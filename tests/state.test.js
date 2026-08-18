const assert = require('assert');
const { AppState, MILESTONES } = require('../src/state.js');
const { topicsPart2 } = require('../src/data/topics-part2.js');
const { topicsPart1 } = require('../src/data/topics-part1.js');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

console.log('Testing State Management & Persistence Engine...');

// Initialize AppState
const appState = new AppState(topicsPart2, topicsPart1);

// 1. Test initial preloaded states
assert.strictEqual(appState.getPart2Topic(4).status, 'ready');
assert.strictEqual(appState.getPart2Topic(23).status, 'ready');
assert.strictEqual(appState.getPart2Topic(46).status, 'ready');
assert.strictEqual(appState.getPart2Topic(999), null, 'Non-existent topic should return null');

// 2. Test status updates
appState.setPart2Status(1, 'improving');
assert.strictEqual(appState.getPart2Topic(1).status, 'improving');
assert.ok(appState.getPart2Topic(1).lastPracticed, 'Should update lastPracticed timestamp');

// 3. Test statistics calculation
const stats = appState.getPart2Stats();
assert.strictEqual(stats.total, 62);
assert.ok(stats.improvingCount >= 1, 'Must have improving topics');
assert.ok(stats.readyCount >= 3, 'Must have at least 3 ready topics');
assert.strictEqual(typeof stats.readinessPercentage, 'number');
assert.ok(stats.nextMilestone, 'Must calculate next milestone');
assert.strictEqual(stats.nextMilestone.target, 10);
assert.strictEqual(stats.topicsToNextMilestone, 10 - stats.readyCount);

// 4. Test Part 1 topic retrieval and status updates
assert.strictEqual(appState.getAllPart1Topics().length, 32);
appState.setPart1Status(1, 'improving');
assert.strictEqual(appState.getPart1Topic(1).status, 'improving');
assert.strictEqual(appState.getPart1Topic(999), null);

// 5. Test Today's 3 Mission generator
const mission = appState.getTodaysMission();
assert.strictEqual(mission.length, 3, 'Must generate exactly 3 daily mission topics');
assert.ok(mission.every(t => t.id && t.title && t.cueCard), 'Each mission item must be a valid topic');

// Test mission completion
assert.strictEqual(appState.isMissionComplete(), false);
const firstMissionId = mission[0].id;
appState.markMissionTopicComplete(firstMissionId);
const missionAfterOne = appState.getTodaysMission();
assert.strictEqual(missionAfterOne[0].completed, true);
assert.strictEqual(missionAfterOne[1].completed, false);

// Complete remaining mission topics
appState.markMissionTopicComplete(mission[1].id);
appState.markMissionTopicComplete(mission[2].id);
assert.strictEqual(appState.isMissionComplete(), true);

// 6. Test Daily Streak calculation
const streak = appState.getStreak();
assert.ok(typeof streak.count === 'number');
assert.strictEqual(streak.count >= 1, true, 'Streak count should be active after practice');
assert.strictEqual(streak.streakActive, true);

// 7. Test notes and student transcript updates
appState.updatePart2Notes(1, 'Updated teacher notes for family topic', 'My sample student transcript');
assert.strictEqual(appState.getPart2Topic(1).notes, 'Updated teacher notes for family topic');
assert.strictEqual(appState.getPart2Topic(1).studentTranscript, 'My sample student transcript');

appState.updatePart1Notes(2, 'Updated Part 1 notes', 'Part 1 transcript');
assert.strictEqual(appState.getPart1Topic(2).notes, 'Updated Part 1 notes');
assert.strictEqual(appState.getPart1Topic(2).studentTranscript, 'Part 1 transcript');

// 8. Test Pub/Sub subscription
let eventReceived = null;
const unsubscribe = appState.subscribe((state, event) => {
  eventReceived = event;
});
appState.setPart2Status(2, 'tried');
assert.ok(eventReceived, 'Subscriber should receive event');
assert.strictEqual(eventReceived.type, 'topic_status_change');
assert.strictEqual(eventReceived.id, 2);

unsubscribe();
eventReceived = null;
appState.setPart2Status(2, 'ready');
assert.strictEqual(eventReceived, null, 'Unsubscribed listener should not receive events');

// 9. Test persistence & restore
const exportedJson = appState.exportJSON();
assert.ok(exportedJson.includes('Updated teacher notes for family topic'));

// 10. Test importing
const freshState = new AppState(topicsPart2, topicsPart1);
freshState.importJSON(exportedJson);
assert.strictEqual(freshState.getPart2Topic(1).status, 'improving');
assert.strictEqual(freshState.getPart2Topic(1).notes, 'Updated teacher notes for family topic');
assert.strictEqual(freshState.getPart2Topic(1).studentTranscript, 'My sample student transcript');

// Test importing invalid JSON fails gracefully
assert.throws(() => {
  freshState.importJSON('{ invalid json');
});
assert.throws(() => {
  freshState.importJSON(JSON.stringify({ invalid: true }));
});

// 11. Test reset to defaults
freshState.resetToDefaults();
assert.strictEqual(freshState.getPart2Topic(2).status, 'new');
assert.strictEqual(freshState.getPart2Topic(1).status, 'improving');

// 12. Test Milestone progression
for (let i = 1; i <= 15; i++) {
  freshState.setPart2Status(i, 'ready');
}
const stats15 = freshState.getPart2Stats();
assert.strictEqual(stats15.readyCount, 17); // 15 + #23 + #46
assert.strictEqual(stats15.currentMilestone.target, 10);
assert.strictEqual(stats15.currentMilestone.name, 'Khởi động');
assert.strictEqual(stats15.nextMilestone.target, 20);
assert.strictEqual(stats15.topicsToNextMilestone, 3);

console.log('✅ State management tests passed!');
