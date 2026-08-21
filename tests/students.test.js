const assert = require('assert');
const { STUDENTS, DEFAULT_STUDENT_SLUG, getDefaultStudent, getStudentBySlug, getAllStudents } = require('../src/data/students.js');
const { AppState } = require('../src/state.js');
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

console.log('Testing Multi-Student Registry & State Isolation...');

// 1. Test Registry Lookup & Defaults
assert.strictEqual(DEFAULT_STUDENT_SLUG, 'phuong-linh', 'Default student slug must be phuong-linh');

const defaultStudent = getDefaultStudent();
assert.strictEqual(defaultStudent.slug, 'phuong-linh');
assert.strictEqual(defaultStudent.name, 'Phương Linh');

const khaiStudent = getStudentBySlug('khai');
assert.strictEqual(khaiStudent.slug, 'khai');
assert.strictEqual(khaiStudent.name, 'Khải');
assert.strictEqual(khaiStudent.avatar, '👨‍🎓');

// Case insensitive and slash-trimmed lookup
assert.strictEqual(getStudentBySlug('/Khai/').slug, 'khai');
assert.strictEqual(getStudentBySlug('/phuong-linh').slug, 'phuong-linh');

// Slugless fallback must return Phuong Linh
assert.strictEqual(getStudentBySlug('').slug, 'phuong-linh', 'Empty slug must fallback to phuong-linh');
assert.strictEqual(getStudentBySlug(null).slug, 'phuong-linh', 'Null slug must fallback to phuong-linh');
assert.strictEqual(getStudentBySlug('unknown-student').slug, 'phuong-linh', 'Unknown student must fallback to phuong-linh');

const allStudents = getAllStudents();
assert.strictEqual(allStudents.length, 2);
assert.deepStrictEqual(allStudents.map(s => s.slug), ['phuong-linh', 'khai']);

// 2. Test Phuong Linh State (with seeded topics)
global.localStorage.clear();
const statePL = new AppState(topicsPart2, topicsPart1, 'phuong-linh');
assert.strictEqual(statePL.studentSlug, 'phuong-linh');
assert.strictEqual(statePL.storageKey, 'topickeeper_app_state_v1_phuong-linh');

// Phuong Linh has preloaded practiced topics
assert.strictEqual(statePL.getPart2Topic(4).status, 'ready');
assert.strictEqual(statePL.getPart2Topic(23).status, 'ready');
assert.strictEqual(statePL.getPart2Topic(46).status, 'ready');
assert.ok(statePL.getPart2Topic(1).notes.includes('Lesson 7'));

// 3. Test Khai State (Preloaded seeded baseline: 7 Part 2 topics, 14 Part 1 topics)
const stateKhai = new AppState(topicsPart2, topicsPart1, 'khai');
assert.strictEqual(stateKhai.studentSlug, 'khai');
assert.strictEqual(stateKhai.storageKey, 'topickeeper_app_state_v1_khai');

// Khai Part 2 topics
assert.strictEqual(stateKhai.getAllPart2Topics().length, 62);
assert.strictEqual(stateKhai.getPart2Topic(6).status, 'ready');
assert.strictEqual(stateKhai.getPart2Topic(13).status, 'ready');
assert.strictEqual(stateKhai.getPart2Topic(22).status, 'ready');
assert.strictEqual(stateKhai.getPart2Topic(49).status, 'ready');
assert.strictEqual(stateKhai.getPart2Topic(18).status, 'improving');
assert.strictEqual(stateKhai.getPart2Topic(35).status, 'improving');
assert.strictEqual(stateKhai.getPart2Topic(45).status, 'improving');
assert.strictEqual(stateKhai.getPart2Topic(48).status, 'improving');
assert.ok(stateKhai.getPart2Topic(6).studentTranscript.includes('my father'));
assert.ok(stateKhai.getPart2Topic(13).studentTranscript.includes('So that person is me'));
assert.ok(stateKhai.getPart2Topic(22).studentTranscript.includes('Ho Chi Minh'));
assert.ok(stateKhai.getPart2Topic(49).studentTranscript.includes('math homework'));

// Untouched topics remain 'new'
assert.strictEqual(stateKhai.getPart2Topic(4).status, 'new');
assert.strictEqual(stateKhai.getPart2Topic(23).status, 'new');

const khaiStats = stateKhai.getPart2Stats();
assert.strictEqual(khaiStats.readyCount, 4, 'Khai should have 4 ready topics (#6, #13, #22, #49)');
assert.strictEqual(khaiStats.improvingCount, 4, 'Khai should have 4 improving topics (#18, #35, #45, #48)');
assert.strictEqual(khaiStats.newCount, 54, 'Khai should have 54 new topics');

// Khai Part 1 topics (17 practiced topics)
assert.strictEqual(stateKhai.getAllPart1Topics().length, 32);
[1, 2, 7, 8, 9, 15, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32].forEach(id => {
  const p1 = stateKhai.getPart1Topic(id);
  assert.ok(p1.status === 'improving' || p1.status === 'ready', `Part 1 topic #${id} should be practiced`);
});
assert.strictEqual(stateKhai.getPart1Topic(3).status, 'new');
assert.strictEqual(stateKhai.getPart1Topic(4).status, 'new');

// 4. Test State & LocalStorage Isolation between Students
stateKhai.setPart2Status(1, 'ready');
stateKhai.updatePart2Notes(1, 'Khai personalized notes', 'Khai spoken transcript');
stateKhai.setPart1Status(1, 'improving');

assert.strictEqual(stateKhai.getPart2Topic(1).status, 'ready');
assert.strictEqual(stateKhai.getPart2Topic(1).notes, 'Khai personalized notes');
assert.strictEqual(stateKhai.getPart1Topic(1).status, 'improving');

// Reload Phuong Linh state from localStorage — must NOT be modified by Khai's practice
const reloadedPL = new AppState(topicsPart2, topicsPart1, 'phuong-linh');
assert.strictEqual(reloadedPL.getPart2Topic(1).status, 'improving', 'Phuong Linh topic #1 should remain untouched');
assert.notStrictEqual(reloadedPL.getPart2Topic(1).notes, 'Khai personalized notes');

// Reload Khai state from localStorage — must preserve Khai's practice
const reloadedKhai = new AppState(topicsPart2, topicsPart1, 'khai');
assert.strictEqual(reloadedKhai.getPart2Topic(1).status, 'ready');
assert.strictEqual(reloadedKhai.getPart2Topic(1).notes, 'Khai personalized notes');

// 5. Test Dynamic Student Switching on same AppState instance
const dynamicState = new AppState(topicsPart2, topicsPart1, 'phuong-linh');
assert.strictEqual(dynamicState.studentSlug, 'phuong-linh');
assert.strictEqual(dynamicState.getPart2Topic(4).status, 'ready');

let notifiedEvent = null;
dynamicState.subscribe((s, event) => {
  notifiedEvent = event;
});

dynamicState.setStudent('khai');
assert.strictEqual(dynamicState.studentSlug, 'khai');
assert.strictEqual(dynamicState.storageKey, 'topickeeper_app_state_v1_khai');
assert.strictEqual(dynamicState.getPart2Topic(1).status, 'ready', 'Should load Khai saved state');
assert.strictEqual(dynamicState.getPart2Topic(4).status, 'new', 'Topic 4 for Khai should be new');
assert.strictEqual(notifiedEvent.type, 'student_changed');
assert.strictEqual(notifiedEvent.studentSlug, 'khai');

// 6. Test Legacy LocalStorage Migration for Phuong Linh
global.localStorage.clear();
// Simulate legacy data saved under un-namespaced key 'topickeeper_app_state_v1'
const legacyPayload = {
  version: 1,
  part2: topicsPart2.map(t => t.id === 10 ? { ...t, status: 'ready', notes: 'Legacy test note' } : t),
  part1: topicsPart1,
  streak: { count: 5, lastPracticedDate: '2026-08-18', streakActive: true },
  dailyMissions: { date: '2026-08-18', topicIds: [1, 2, 3], completedIds: [1] }
};
global.localStorage.setItem('topickeeper_app_state_v1', JSON.stringify(legacyPayload));

const migratedPL = new AppState(topicsPart2, topicsPart1, 'phuong-linh');
assert.strictEqual(migratedPL.getPart2Topic(10).status, 'ready', 'Should migrate legacy topic status');
assert.strictEqual(migratedPL.getPart2Topic(10).notes, 'Legacy test note');
assert.strictEqual(migratedPL.streak.count, 5);

// 7. Test Export JSON studentSlug metadata
const exportedKhai = stateKhai.exportJSON();
assert.ok(exportedKhai.includes('"studentSlug": "khai"'));

console.log('✅ All Multi-Student & Khai tests passed successfully!');
