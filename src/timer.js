/**
 * IELTS Speaking Quest — Hourglass Animated Countdown Timer & Sound Engine
 * Supports prep (1 min) and speak (2 min) countdowns, SVG hourglass animation state,
 * and Web Audio API synthesized sound cues.
 */

class ExamTimer {
  /**
   * @param {Object} options
   * @param {Function} [options.onTick] - Callback with timer state object
   * @param {Function} [options.onPhaseChange] - Callback with (phase, total)
   * @param {Function} [options.onComplete] - Callback with (phase)
   * @param {Function} [options.onWarning] - Callback when 30s remaining
   * @param {boolean} [options.enableAudio=true] - Enable/disable Web Audio chimes
   * @param {number} [options.warningThreshold=30] - Seconds remaining to trigger warning
   */
  constructor(options = {}) {
    this.onTick = options.onTick || null;
    this.onPhaseChange = options.onPhaseChange || null;
    this.onComplete = options.onComplete || null;
    this.onWarning = options.onWarning || null;
    this.enableAudio = options.enableAudio !== undefined ? options.enableAudio : true;
    this.warningThreshold = options.warningThreshold || 30;

    this.phase = 'idle'; // 'idle' | 'prep' | 'speak'
    this.total = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.intervalId = null;
    this.hasWarned = false;

    this.audioCtx = null;
  }

  /**
   * Get formatted time MM:SS
   * @param {number} [seconds]
   * @returns {string}
   */
  getFormatted(seconds = this.remaining) {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Get current state object
   * @returns {Object}
   */
  getState() {
    const percentage = this.total > 0 ? (this.remaining / this.total) * 100 : 0;
    return {
      phase: this.phase,
      remaining: this.remaining,
      total: this.total,
      percentage: Number(percentage.toFixed(2)),
      formatted: this.getFormatted(),
      isRunning: this.isRunning
    };
  }

  /**
   * Helper to emit state to onTick callback
   * @private
   */
  _emitTick() {
    if (typeof this.onTick === 'function') {
      this.onTick(this.getState());
    }
  }

  /**
   * Start 1-minute Preparation Countdown (default 60s)
   * @param {number} [durationSeconds=60]
   */
  startPrep(durationSeconds = 60) {
    this._startPhase('prep', durationSeconds);
  }

  /**
   * Start 2-minute Speaking Countdown (default 120s)
   * @param {number} [durationSeconds=120]
   */
  startSpeak(durationSeconds = 120) {
    this._startPhase('speak', durationSeconds);
  }

  /**
   * Internal method to start a phase
   * @private
   */
  _startPhase(phase, durationSeconds) {
    this._clearInterval();
    this.phase = phase;
    this.total = durationSeconds;
    this.remaining = durationSeconds;
    this.hasWarned = false;
    this.isRunning = true;

    this.playChime('start');

    if (typeof this.onPhaseChange === 'function') {
      this.onPhaseChange(this.phase, this.total);
    }

    this._emitTick();
    this._startInterval();
  }

  /**
   * Pause current countdown
   */
  pause() {
    if (!this.isRunning) return;
    this._clearInterval();
    this.isRunning = false;
    this._emitTick();
  }

  /**
   * Resume paused countdown
   */
  resume() {
    if (this.isRunning || this.phase === 'idle' || this.remaining <= 0) return;
    this.isRunning = true;
    this._emitTick();
    this._startInterval();
  }

  /**
   * Stop timer and reset to idle
   */
  stop() {
    this._clearInterval();
    this.phase = 'idle';
    this.total = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.hasWarned = false;
    this._emitTick();
  }

  /**
   * Advance timer by 1 second (can be called manually for testing or via interval)
   */
  tick() {
    if (this.remaining <= 0) return;

    this.remaining = Math.max(0, this.remaining - 1);

    // Check warning threshold during speak phase (e.g. 30s remaining)
    if (this.phase === 'speak' && this.remaining === this.warningThreshold && !this.hasWarned) {
      this.hasWarned = true;
      this.playChime('warning');
      if (typeof this.onWarning === 'function') {
        this.onWarning();
      }
    }

    if (this.remaining === 0) {
      this._clearInterval();
      this.isRunning = false;
      const completedPhase = this.phase;
      this.playChime('complete');
      this._emitTick();
      if (typeof this.onComplete === 'function') {
        this.onComplete(completedPhase);
      }
    } else {
      this._emitTick();
    }
  }

  /**
   * Start interval ticking every 1000ms
   * @private
   */
  _startInterval() {
    this._clearInterval();
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Clear active interval
   * @private
   */
  _clearInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Calculate dynamic SVG Hourglass levels and animation state
   * @returns {{ topLevel: number, bottomLevel: number, isFlowing: boolean, streamOpacity: number }}
   */
  getHourglassSVGData() {
    if (this.total === 0 || this.phase === 'idle') {
      return {
        topLevel: 0,
        bottomLevel: 0,
        isFlowing: false,
        streamOpacity: 0
      };
    }

    const topLevel = (this.remaining / this.total) * 100;
    const bottomLevel = ((this.total - this.remaining) / this.total) * 100;
    const isFlowing = this.isRunning && this.remaining > 0;
    const streamOpacity = isFlowing ? 1 : 0;

    return {
      topLevel: Math.max(0, Math.min(100, topLevel)),
      bottomLevel: Math.max(0, Math.min(100, bottomLevel)),
      isFlowing,
      streamOpacity
    };
  }

  /**
   * Synthesize Web Audio sound cues for start, warning, and complete events.
   * Gracefully degrades in Node.js or when audio is not supported/enabled.
   * @param {'start' | 'warning' | 'complete'} type
   */
  playChime(type) {
    if (!this.enableAudio) return;

    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'start') {
        // Two-tone gentle bell chime (D5: 587.33Hz -> A5: 880Hz)
        this._playTone(587.33, now, 0.25, 0.15);
        this._playTone(880.00, now + 0.15, 0.4, 0.15);
      } else if (type === 'warning') {
        // Soft double-beep warning
        this._playTone(660.00, now, 0.12, 0.12);
        this._playTone(660.00, now + 0.18, 0.12, 0.12);
      } else if (type === 'complete') {
        // Celebratory triumph arpeggio (C5 -> E5 -> G5 -> C6)
        this._playTone(523.25, now, 0.18, 0.15);
        this._playTone(659.25, now + 0.12, 0.18, 0.15);
        this._playTone(783.99, now + 0.24, 0.22, 0.15);
        this._playTone(1046.50, now + 0.36, 0.6, 0.2);
      }
    } catch (err) {
      console.warn('ExamTimer playChime error:', err);
    }
  }

  /**
   * Helper to play an individual tone with exponential envelope
   * @private
   */
  _playTone(freq, startTime, duration, maxVolume = 0.2) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(maxVolume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Ignore audio synthesis errors
    }
  }
}

// Dual export support (Node.js CommonJS & Browser window)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExamTimer };
}

if (typeof window !== 'undefined') {
  window.ExamTimer = ExamTimer;
}
