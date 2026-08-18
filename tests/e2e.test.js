// tests/e2e.test.js
const assert = require('assert');
const fs = require('fs');

console.log('Testing End-to-End project structure & markup...');

assert.ok(fs.existsSync('index.html'), 'index.html must exist');
assert.ok(fs.existsSync('src/styles.css'), 'src/styles.css must exist');
assert.ok(fs.existsSync('src/app.js'), 'src/app.js must exist');
assert.ok(fs.existsSync('src/data/topics-part2.js'), 'topics-part2.js must exist');
assert.ok(fs.existsSync('src/data/topics-part1.js'), 'topics-part1.js must exist');
assert.ok(fs.existsSync('src/data/stories.js'), 'stories.js must exist');
assert.ok(fs.existsSync('src/state.js'), 'state.js must exist');

const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('IELTS Speaking Quest'), 'Title must be in HTML');
assert.ok(indexHtml.includes('id="topic-map"'), 'Topic map container must exist');
assert.ok(indexHtml.includes('id="modal-cuecard"'), 'Modal cuecard must exist');
assert.ok(indexHtml.includes('id="cuecard-points"'), 'Cuecard points list container must exist');
assert.ok(indexHtml.includes('id="part3-questions-list"'), 'Part 3 questions list must exist');
assert.ok(indexHtml.includes('id="daily-mission-widget"'), 'Daily mission widget container must exist');
assert.ok(indexHtml.includes('id="stories-grid"'), 'Stories grid container must exist');
assert.ok(indexHtml.includes('id="part1-list"'), 'Part 1 list container must exist');

console.log('✅ End-to-End project structure verified!');
