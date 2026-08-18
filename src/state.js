/**
 * IELTS Speaking Quest — State Management & Persistence Engine
 * Manages Part 1 & Part 2 topic status, practice records, daily streaks, missions, and localStorage sync.
 */

const STORAGE_KEY = 'topickeeper_app_state_v1';

const MILESTONES = [
  { name: 'Khởi động', emoji: '🌱', target: 10 },
  { name: 'Tăng tốc', emoji: '🔥', target: 20 },
  { name: 'Tự tin nói', emoji: '🎙️', target: 30 },
  { name: 'Sẵn sàng thi', emoji: '🚀', target: 40 },
  { name: 'Về đích', emoji: '💪', target: 50 },
  { name: 'Hoàn thành bộ đề', emoji: '🏆', target: 62 }
];

class AppState {
  constructor(defaultPart2 = [], defaultPart1 = []) {
    this.defaultPart2 = defaultPart2;
    this.defaultPart1 = defaultPart1;
    this.storageKey = STORAGE_KEY;
    this.listeners = [];

    this.part2 = [];
    this.part1 = [];
    this.streak = { count: 0, lastPracticedDate: null, streakActive: false };
    this.dailyMissions = { date: '', topicIds: [], completedIds: [] };

    this.init();
  }

  /**
   * Helper to deep clone object/array structures
   */
  cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Get current local date string (YYYY-MM-DD)
   */
  getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get yesterday date string (YYYY-MM-DD)
   */
  getYesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Initialize state from localStorage if available, or load defaults
   */
  init() {
    const loaded = this.loadFromStorage();
    if (!loaded) {
      this.part2 = this.cloneData(this.defaultPart2);
      this.part1 = this.cloneData(this.defaultPart1);
      this.streak = { count: 0, lastPracticedDate: null, streakActive: false };
      this.dailyMissions = { date: '', topicIds: [], completedIds: [] };
    }
  }

  /**
   * Safe localStorage load with smart dataset merge
   */
  loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.part2) || !Array.isArray(data.part1)) {
        return false;
      }

      // Merge saved user progress with latest default question bank & ideas
      const savedP2Map = new Map((data.part2 || []).map(t => [t.id, t]));
      this.part2 = (this.defaultPart2 || []).map(def => {
        const saved = savedP2Map.get(def.id);
        if (!saved) return this.cloneData(def);
        return {
          ...this.cloneData(def),
          status: saved.status || def.status || 'new',
          lastPracticed: saved.lastPracticed || def.lastPracticed || null,
          notes: saved.notes !== undefined ? saved.notes : def.notes,
          studentTranscript: saved.studentTranscript !== undefined ? saved.studentTranscript : def.studentTranscript
        };
      });

      const savedP1Map = new Map((data.part1 || []).map(t => [t.id, t]));
      this.part1 = (this.defaultPart1 || []).map(def => {
        const saved = savedP1Map.get(def.id);
        if (!saved) return this.cloneData(def);
        return {
          ...this.cloneData(def),
          status: saved.status || def.status || 'new',
          lastPracticed: saved.lastPracticed || def.lastPracticed || null,
          notes: saved.notes !== undefined ? saved.notes : def.notes,
          studentTranscript: saved.studentTranscript !== undefined ? saved.studentTranscript : def.studentTranscript
        };
      });

      this.streak = data.streak || { count: 0, lastPracticedDate: null, streakActive: false };
      this.dailyMissions = data.dailyMissions || { date: '', topicIds: [], completedIds: [] };
      return true;
    } catch (err) {
      console.warn('Could not load from localStorage:', err);
      return false;
    }
  }

  /**
   * Safe localStorage save
   */
  saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const payload = {
        version: 1,
        lastSaved: new Date().toISOString(),
        part2: this.part2,
        part1: this.part1,
        streak: this.streak,
        dailyMissions: this.dailyMissions
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  }

  /**
   * Record practice activity to maintain daily streak
   */
  _recordActivity() {
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();

    if (this.streak.lastPracticedDate === today) {
      this.streak.streakActive = true;
    } else if (this.streak.lastPracticedDate === yesterday) {
      this.streak.count = (this.streak.count || 0) + 1;
      this.streak.lastPracticedDate = today;
      this.streak.streakActive = true;
    } else {
      this.streak.count = 1;
      this.streak.lastPracticedDate = today;
      this.streak.streakActive = true;
    }
  }

  /**
   * Pub/Sub: Subscribe to state changes
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Pub/Sub: Notify all listeners
   */
  notify(type, data = {}) {
    for (const listener of this.listeners) {
      try {
        listener(this, { type, ...data });
      } catch (err) {
        console.error('State subscriber notification error:', err);
      }
    }
  }

  // --- TOPIC ACCESSORS ---

  getPart2Topic(id) {
    return this.part2.find(t => t.id === Number(id)) || null;
  }

  getPart1Topic(id) {
    return this.part1.find(t => t.id === Number(id)) || null;
  }

  getAllPart2Topics() {
    return this.part2;
  }

  getAllPart1Topics() {
    return this.part1;
  }

  // --- STATUS UPDATES ---

  setPart2Status(id, status) {
    const topic = this.getPart2Topic(id);
    if (!topic) return null;

    topic.status = status;
    topic.lastPracticed = new Date().toISOString();
    topic.lastPracticedDate = this.getTodayString();

    if (status === 'tried' || status === 'improving' || status === 'ready') {
      this._recordActivity();
      // If part of today's mission, auto-complete
      if (this.dailyMissions && this.dailyMissions.topicIds && this.dailyMissions.topicIds.includes(Number(id))) {
        if (!this.dailyMissions.completedIds.includes(Number(id))) {
          this.dailyMissions.completedIds.push(Number(id));
        }
      }
    }

    this.saveToStorage();
    this.notify('topic_status_change', { part: 2, id: Number(id), status, topic });
    return topic;
  }

  setPart1Status(id, status) {
    const topic = this.getPart1Topic(id);
    if (!topic) return null;

    topic.status = status;
    topic.lastPracticed = new Date().toISOString();
    topic.lastPracticedDate = this.getTodayString();

    if (status === 'tried' || status === 'improving' || status === 'ready') {
      this._recordActivity();
    }

    this.saveToStorage();
    this.notify('topic_status_change', { part: 1, id: Number(id), status, topic });
    return topic;
  }

  // --- NOTES & TRANSCRIPT UPDATES ---

  updatePart2Notes(id, notes, transcript) {
    const topic = this.getPart2Topic(id);
    if (!topic) return null;

    if (notes !== undefined) topic.notes = notes;
    if (transcript !== undefined) topic.studentTranscript = transcript;
    topic.lastPracticed = new Date().toISOString();
    topic.lastPracticedDate = this.getTodayString();

    this._recordActivity();
    this.saveToStorage();
    this.notify('topic_notes_change', { part: 2, id: Number(id), topic });
    return topic;
  }

  updatePart1Notes(id, notes, transcript) {
    const topic = this.getPart1Topic(id);
    if (!topic) return null;

    if (notes !== undefined) topic.notes = notes;
    if (transcript !== undefined) topic.studentTranscript = transcript;
    topic.lastPracticed = new Date().toISOString();
    topic.lastPracticedDate = this.getTodayString();

    this._recordActivity();
    this.saveToStorage();
    this.notify('topic_notes_change', { part: 1, id: Number(id), topic });
    return topic;
  }

  // --- STATISTICS & MILESTONES ---

  getPart2Stats() {
    const total = this.part2.length;
    const readyCount = this.part2.filter(t => t.status === 'ready').length;
    const improvingCount = this.part2.filter(t => t.status === 'improving').length;
    const triedCount = this.part2.filter(t => t.status === 'tried').length;
    const newCount = this.part2.filter(t => t.status === 'new' || !t.status).length;
    const readinessPercentage = total > 0 ? Math.round((readyCount / total) * 100) : 0;

    let currentMilestone = null;
    let nextMilestone = MILESTONES[0];

    for (let i = 0; i < MILESTONES.length; i++) {
      if (readyCount >= MILESTONES[i].target) {
        currentMilestone = MILESTONES[i];
        nextMilestone = MILESTONES[i + 1] || null;
      } else {
        if (!currentMilestone) {
          nextMilestone = MILESTONES[i];
        }
        break;
      }
    }

    const topicsToNextMilestone = nextMilestone ? Math.max(0, nextMilestone.target - readyCount) : 0;

    return {
      total,
      readyCount,
      improvingCount,
      triedCount,
      newCount,
      readinessPercentage,
      currentMilestone,
      nextMilestone,
      topicsToNextMilestone
    };
  }

  // --- TODAY'S MISSION & DAILY STREAK ---

  getStreak() {
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();
    const last = this.streak.lastPracticedDate;
    const streakActive = (last === today || last === yesterday) && (this.streak.count || 0) > 0;

    return {
      count: streakActive ? (this.streak.count || 0) : 0,
      lastPracticedDate: this.streak.lastPracticedDate,
      streakActive
    };
  }

  getTodaysMission() {
    const today = this.getTodayString();

    // Check if we already have valid missions for today
    if (
      this.dailyMissions &&
      this.dailyMissions.date === today &&
      Array.isArray(this.dailyMissions.topicIds) &&
      this.dailyMissions.topicIds.length === 3
    ) {
      const missionTopics = this.dailyMissions.topicIds
        .map(id => this.getPart2Topic(id))
        .filter(Boolean);

      if (missionTopics.length === 3) {
        const completedIds = this.dailyMissions.completedIds || [];
        return missionTopics.map(t => ({
          ...t,
          completed: completedIds.includes(t.id)
        }));
      }
    }

    // Otherwise generate 3 recommended topics
    // Smart mix: 1 from improving (or tried/new), 1 from tried (or new/improving), 1 from new (or improving/tried)
    const improving = this.part2.filter(t => t.status === 'improving');
    const tried = this.part2.filter(t => t.status === 'tried');
    const newTopics = this.part2.filter(t => t.status === 'new' || !t.status);
    const readyTopics = this.part2.filter(t => t.status === 'ready');

    const selectedIds = new Set();

    const pickFrom = (pool) => {
      for (const item of pool) {
        if (!selectedIds.has(item.id)) {
          selectedIds.add(item.id);
          return item;
        }
      }
      return null;
    };

    // Slot 1: Prefer Improving
    let slot1 = pickFrom(improving) || pickFrom(tried) || pickFrom(newTopics) || pickFrom(readyTopics);
    // Slot 2: Prefer Tried
    let slot2 = pickFrom(tried) || pickFrom(newTopics) || pickFrom(improving) || pickFrom(readyTopics);
    // Slot 3: Prefer New
    let slot3 = pickFrom(newTopics) || pickFrom(improving) || pickFrom(tried) || pickFrom(readyTopics);

    // Fallback if needed to fill 3 items
    for (const t of this.part2) {
      if (selectedIds.size >= 3) break;
      selectedIds.add(t.id);
    }

    const topicIds = Array.from(selectedIds).slice(0, 3);
    this.dailyMissions = {
      date: today,
      topicIds,
      completedIds: []
    };

    this.saveToStorage();

    return topicIds.map(id => {
      const topic = this.getPart2Topic(id);
      return {
        ...topic,
        completed: false
      };
    });
  }

  markMissionTopicComplete(id) {
    const numId = Number(id);
    if (!this.dailyMissions || !Array.isArray(this.dailyMissions.topicIds)) return;

    if (this.dailyMissions.topicIds.includes(numId)) {
      if (!this.dailyMissions.completedIds) {
        this.dailyMissions.completedIds = [];
      }
      if (!this.dailyMissions.completedIds.includes(numId)) {
        this.dailyMissions.completedIds.push(numId);
      }
      this._recordActivity();
      this.saveToStorage();
      this.notify('mission_update', { dailyMissions: this.dailyMissions });
    }
  }

  isMissionComplete() {
    if (!this.dailyMissions || !this.dailyMissions.topicIds || this.dailyMissions.topicIds.length !== 3) {
      return false;
    }
    const completedIds = this.dailyMissions.completedIds || [];
    return this.dailyMissions.topicIds.every(id => completedIds.includes(id));
  }

  // --- IMPORT / EXPORT / RESET ---

  exportJSON() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      part2: this.part2,
      part1: this.part1,
      streak: this.streak,
      dailyMissions: this.dailyMissions
    };
    return JSON.stringify(payload, null, 2);
  }

  importJSON(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || !Array.isArray(data.part2) || !Array.isArray(data.part1)) {
        throw new Error('Invalid backup data format: part1 and part2 arrays are required');
      }

      this.part2 = this.cloneData(data.part2);
      this.part1 = this.cloneData(data.part1);
      this.streak = data.streak || { count: 0, lastPracticedDate: null, streakActive: false };
      this.dailyMissions = data.dailyMissions || { date: '', topicIds: [], completedIds: [] };

      this.saveToStorage();
      this.notify('state_imported', {});
      return true;
    } catch (err) {
      console.error('Failed to import JSON data:', err);
      throw err;
    }
  }

  resetToDefaults() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    } catch (err) {
      console.warn('Error clearing localStorage:', err);
    }

    this.part2 = this.cloneData(this.defaultPart2);
    this.part1 = this.cloneData(this.defaultPart1);
    this.streak = { count: 0, lastPracticedDate: null, streakActive: false };
    this.dailyMissions = { date: '', topicIds: [], completedIds: [] };

    this.saveToStorage();
    this.notify('state_reset', {});
  }
}

// Dual export support (Node.js CJS & Browser global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppState, MILESTONES };
}

if (typeof window !== 'undefined') {
  window.AppState = AppState;
  window.MILESTONES = MILESTONES;
}
