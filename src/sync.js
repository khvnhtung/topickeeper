/**
 * TopicKeeper — Supabase Cloud Sync Engine
 * Synchronizes topic progress, practice records, and notes across all student devices and browsers in real time.
 */

const SUPABASE_CONFIG = {
  url: 'https://grjqhwtyipegtxlmrlpu.supabase.co',
  publishableKey: 'sb_publishable_JNMpDLq3acSYeX_7-FqACg_oX3ta1KA',
  defaultSlug: 'phuong-linh'
};

class CloudSyncEngine {
  constructor(appState, options = {}) {
    this.state = appState;
    this.url = options.url || SUPABASE_CONFIG.url;
    this.apiKey = options.apiKey || SUPABASE_CONFIG.publishableKey;
    this.currentSlug = options.slug || SUPABASE_CONFIG.defaultSlug;
    this.isSyncing = false;
    this.lastSyncedAt = null;
    this.syncListeners = [];
    this.autoSyncTimer = null;

    this.init();
  }

  getHeaders() {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  onSyncStatus(callback) {
    this.syncListeners.push(callback);
  }

  notifySyncStatus(status, message) {
    this.syncListeners.forEach(fn => {
      try { fn(status, message, this.lastSyncedAt); } catch (e) { console.error(e); }
    });
  }

  /**
   * Initialize sync on startup
   */
  async init() {
    // 1. Initial pull from Cloud
    await this.pullFromCloud();

    // 2. Subscribe to local state changes to auto-push to Cloud
    if (this.state && typeof this.state.subscribe === 'function') {
      this.state.subscribe(() => {
        this.schedulePush();
      });
    }

    // 3. Periodic cloud polling (every 15 seconds) so student device auto-receives updates
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.pullFromCloud(true);
      }, 15000);
    }
  }

  /**
   * Switch student profile and re-sync
   */
  async setStudent(newSlug) {
    if (this.autoSyncTimer) clearTimeout(this.autoSyncTimer);
    this.currentSlug = newSlug || SUPABASE_CONFIG.defaultSlug;
    this.lastSyncedAt = null;
    return await this.pullFromCloud();
  }

  /**
   * Pull latest state from Supabase for current student
   */
  async pullFromCloud(silent = false) {
    if (!silent) this.notifySyncStatus('pulling', 'Đang tải dữ liệu Cloud...');
    try {
      const endpoint = `${this.url}/rest/v1/student_states?slug=eq.${encodeURIComponent(this.currentSlug)}&select=*`;
      const res = await fetch(endpoint, {
        headers: this.getHeaders()
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 400) {
          console.warn('Cloud table not ready yet. Using local state.');
        }
        this.notifySyncStatus('idle', 'Sẵn sàng (Local)');
        return false;
      }

      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].state_data) {
        const cloudData = rows[0].state_data;
        const updatedAt = rows[0].updated_at;

        const baseDefaults = (this.state && typeof this.state.getCleanDefaults === 'function' && this.state.studentSlug !== 'phuong-linh')
          ? this.state.getCleanDefaults()
          : { part2: this.state.defaultPart2 || [], part1: this.state.defaultPart1 || [] };

        // Compare if cloud data is valid
        if (cloudData.part2 && Array.isArray(cloudData.part2)) {
          this.state.part2 = baseDefaults.part2.map(def => {
            const saved = (cloudData.part2 || []).find(t => t.id === def.id);
            if (!saved) return this.state.cloneData(def);
            return {
              ...this.state.cloneData(def),
              status: saved.status || def.status || 'new',
              lastPracticed: saved.lastPracticed || def.lastPracticed || null,
              notes: saved.notes !== undefined ? saved.notes : def.notes,
              studentTranscript: saved.studentTranscript !== undefined ? saved.studentTranscript : def.studentTranscript
            };
          });

          if (cloudData.part1 && Array.isArray(cloudData.part1)) {
            this.state.part1 = baseDefaults.part1.map(def => {
              const saved = (cloudData.part1 || []).find(t => t.id === def.id);
              if (!saved) return this.state.cloneData(def);
              return {
                ...this.state.cloneData(def),
                status: saved.status || def.status || 'new',
                lastPracticed: saved.lastPracticed || def.lastPracticed || null,
                notes: saved.notes !== undefined ? saved.notes : def.notes,
                studentTranscript: saved.studentTranscript !== undefined ? saved.studentTranscript : def.studentTranscript
              };
            });
          }

          if (cloudData.streak) this.state.streak = cloudData.streak;
          this.state.saveToStorage();
          this.state.notifyListeners();
          this.lastSyncedAt = new Date(updatedAt || Date.now());
          this.notifySyncStatus('synced', 'Đã đồng bộ Cloud');
          return true;
        }
      }
      this.notifySyncStatus('synced', 'Đã đồng bộ');
      return true;
    } catch (err) {
      console.warn('Cloud sync pull warning:', err);
      this.notifySyncStatus('offline', 'Chế độ ngoại tuyến');
      return false;
    }
  }

  /**
   * Debounced push to avoid hammering database during quick clicks
   */
  schedulePush() {
    if (this.autoSyncTimer) clearTimeout(this.autoSyncTimer);
    this.notifySyncStatus('saving', 'Đang lưu lên Cloud...');
    this.autoSyncTimer = setTimeout(() => {
      this.pushToCloud();
    }, 600);
  }

  /**
   * Push full student state to Supabase
   */
  async pushToCloud() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notifySyncStatus('saving', 'Đang lưu lên Cloud...');

    try {
      const fullState = {
        part2: this.state.part2,
        part1: this.state.part1,
        streak: this.state.streak,
        dailyMissions: this.state.dailyMissions
      };

      const payload = {
        slug: this.currentSlug,
        state_data: fullState,
        updated_at: new Date().toISOString()
      };

      const endpoint = `${this.url}/rest/v1/student_states`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201 || res.status === 204) {
        this.lastSyncedAt = new Date();
        this.notifySyncStatus('synced', 'Đã đồng bộ Cloud');
      } else {
        const errorText = await res.text();
        console.warn('Cloud save response:', res.status, errorText);
        this.notifySyncStatus('warning', 'Lưu cục bộ (chưa kết nối table)');
      }
    } catch (err) {
      console.warn('Cloud sync push error:', err);
      this.notifySyncStatus('offline', 'Lưu cục bộ (Offline)');
    } finally {
      this.isSyncing = false;
    }
  }
}

if (typeof module !== 'undefined') module.exports = { CloudSyncEngine, SUPABASE_CONFIG };
if (typeof window !== 'undefined') window.CloudSyncEngine = CloudSyncEngine;
