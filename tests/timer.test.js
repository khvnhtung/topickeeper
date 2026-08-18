const assert = require('assert');
const { ExamTimer } = require('../src/timer.js');

console.log('Testing ExamTimer Engine...');

let ticks = 0;
let phaseChanged = null;
let completed = false;
let completedPhase = null;

const timer = new ExamTimer({
  onTick: (state) => {
    ticks++;
    assert.ok(typeof state.remaining === 'number');
    assert.ok(typeof state.total === 'number');
    assert.ok(typeof state.percentage === 'number');
    assert.ok(typeof state.formatted === 'string');
    assert.ok(['prep', 'speak', 'idle'].includes(state.phase));
  },
  onPhaseChange: (phase, total) => {
    phaseChanged = phase;
  },
  onComplete: (phase) => {
    completed = true;
    completedPhase = phase;
  },
  enableAudio: false // for testing in Node without Web Audio API
});

// 1. Test prep timer initialization
timer.startPrep(60);
assert.strictEqual(timer.phase, 'prep');
assert.strictEqual(timer.total, 60);
assert.strictEqual(timer.remaining, 60);
assert.strictEqual(timer.getFormatted(), '01:00');
assert.strictEqual(phaseChanged, 'prep');
assert.strictEqual(timer.isRunning, true);

// 2. Test manual tick simulation
timer.tick();
assert.strictEqual(timer.remaining, 59);
assert.strictEqual(timer.getFormatted(), '00:59');
assert.ok(ticks > 0);

// 3. Test pause / resume
timer.pause();
assert.strictEqual(timer.isRunning, false);
const svgPaused = timer.getHourglassSVGData();
assert.strictEqual(svgPaused.isFlowing, false);

timer.resume();
assert.strictEqual(timer.isRunning, true);
const svgRunning = timer.getHourglassSVGData();
assert.strictEqual(svgRunning.isFlowing, true);

// 4. Test countdown to zero in prep mode
while (timer.remaining > 1) {
  timer.tick();
}
assert.strictEqual(completed, false);
timer.tick(); // hits 0
assert.strictEqual(timer.remaining, 0);
assert.strictEqual(completed, true);
assert.strictEqual(completedPhase, 'prep');

// Reset completed flag
completed = false;
completedPhase = null;

// 5. Test transition to speak
timer.startSpeak(120);
assert.strictEqual(timer.phase, 'speak');
assert.strictEqual(timer.total, 120);
assert.strictEqual(timer.remaining, 120);
assert.strictEqual(timer.getFormatted(), '02:00');
assert.strictEqual(phaseChanged, 'speak');

// 6. Test SVG Hourglass path / level generator helper
const svgData = timer.getHourglassSVGData();
assert.ok(svgData.topLevel >= 0 && svgData.topLevel <= 100);
assert.ok(svgData.bottomLevel >= 0 && svgData.bottomLevel <= 100);
assert.strictEqual(svgData.topLevel, 100);
assert.strictEqual(svgData.bottomLevel, 0);
assert.strictEqual(svgData.isFlowing, true);
assert.strictEqual(svgData.streamOpacity, 1);

// Tick half way
for (let i = 0; i < 60; i++) {
  timer.tick();
}
assert.strictEqual(timer.remaining, 60);
const svgHalf = timer.getHourglassSVGData();
assert.strictEqual(Math.round(svgHalf.topLevel), 50);
assert.strictEqual(Math.round(svgHalf.bottomLevel), 50);

// 7. Test warning trigger detection (e.g. at 30 seconds remaining)
let warningTriggered = false;
timer.onWarning = () => { warningTriggered = true; };
for (let i = 0; i < 30; i++) {
  timer.tick();
}
assert.strictEqual(timer.remaining, 30);
assert.strictEqual(warningTriggered, true);

// 8. Test stop
timer.stop();
assert.strictEqual(timer.phase, 'idle');
assert.strictEqual(timer.remaining, 0);
assert.strictEqual(timer.isRunning, false);
const svgIdle = timer.getHourglassSVGData();
assert.strictEqual(svgIdle.isFlowing, false);
assert.strictEqual(svgIdle.streamOpacity, 0);

// 9. Test playChime safety when enableAudio is false or in node
assert.doesNotThrow(() => {
  timer.playChime('start');
  timer.playChime('warning');
  timer.playChime('complete');
});

console.log('✅ ExamTimer tests passed!');
