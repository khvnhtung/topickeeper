const assert = require('assert');
const { topicsPart2 } = require('../src/data/topics-part2.js');
const { topicsPart1 } = require('../src/data/topics-part1.js');
const { storyClusters } = require('../src/data/stories.js');

console.log('Testing Datasets...');

// 1. Part 2 topics verification
assert.strictEqual(topicsPart2.length, 62, 'Must contain exactly 62 Part 2 topics');
topicsPart2.forEach(t => {
  assert.ok(t.id >= 1 && t.id <= 62, `Topic id must be between 1 and 62, got ${t.id}`);
  assert.ok(t.title && t.title.length > 0, `Topic ${t.id} must have a title`);
  assert.ok(t.cueCard && t.cueCard.points && t.cueCard.points.length > 0, `Topic ${t.id} must have cue points`);
  assert.ok(Array.isArray(t.part3Questions), `Topic ${t.id} must have part 3 questions array`);
  assert.ok(t.part3Questions.length >= 3, `Topic ${t.id} must have at least 3 part 3 questions`);
  assert.ok(['new', 'tried', 'improving', 'ready'].includes(t.status), `Topic ${t.id} must have valid status`);
  assert.ok(['People', 'Places', 'Tech & Objects', 'Experiences', 'Culture & Nature', 'Ambition'].includes(t.category), `Topic ${t.id} category is valid: ${t.category}`);
});

// Check preloaded student speeches in Part 2
[4, 23, 46].forEach(id => {
  const topic = topicsPart2.find(t => t.id === id);
  assert.ok(topic, `Topic ${id} must exist`);
  assert.strictEqual(topic.status, 'ready', `Topic ${id} must have 'ready' status`);
  assert.ok(topic.studentTranscript && topic.studentTranscript.length > 20, `Topic ${id} must have student transcript`);
  assert.ok(topic.notes && topic.notes.length > 10, `Topic ${id} must have teacher notes/corrections`);
});

// 2. Part 1 topics verification
assert.strictEqual(topicsPart1.length, 32, 'Must contain exactly 32 Part 1 topics');
topicsPart1.forEach(t => {
  assert.ok(t.id >= 1 && t.id <= 32, `Part 1 topic id must be between 1 and 32, got ${t.id}`);
  assert.ok(t.title && t.title.length > 0, `Part 1 topic ${t.id} must have a title`);
  assert.ok(t.questions && t.questions.length > 0, `Part 1 topic ${t.id} must have questions`);
  assert.ok(['new', 'tried', 'improving', 'ready'].includes(t.status), `Part 1 topic ${t.id} must have valid status`);
});

// Check preloaded student speeches in Part 1
[1, 7, 8, 11, 13, 14, 16, 30, 31, 32].forEach(id => {
  const topic = topicsPart1.find(t => t.id === id);
  assert.ok(topic, `Part 1 topic ${id} must exist`);
  assert.ok(topic.studentTranscript && topic.studentTranscript.length > 20, `Part 1 topic ${id} must have student transcript`);
});

// 3. Story Clusters verification
assert.ok(storyClusters.length >= 5, 'Must contain at least 5 story clusters');
storyClusters.forEach(cluster => {
  assert.ok(cluster.id > 0, 'Cluster must have valid id');
  assert.ok(cluster.title && cluster.title.length > 0, 'Cluster must have title');
  assert.ok(cluster.emoji, 'Cluster must have emoji');
  assert.ok(Array.isArray(cluster.topicIds) && cluster.topicIds.length > 0, 'Cluster must link to topics');
  cluster.topicIds.forEach(tid => {
    assert.ok(tid >= 1 && tid <= 62, `Topic ID ${tid} in cluster must be within 1..62`);
  });
});

console.log('✅ Datasets verification passed!');
