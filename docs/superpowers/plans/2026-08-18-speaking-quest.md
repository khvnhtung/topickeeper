# IELTS Speaking Quest & TopicKeeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete interactive web application "TopicKeeper (IELTS Speaking Quest)" for Q2 May–August 2026 forecast pool with the 62-node quest journey map, 4 mastery stages, Today's 3 micro-missions, in-practice hourglass timers (1:00 prep / 2:00 speak), story multiplier hub, preloaded student transcripts, and instant cue card bullet point display on circle clicks.

**Architecture:** A standalone, responsive modern single-page application built with modular ES6 JavaScript, HTML5, and CSS3. Features full offline support via `localStorage`, export/import data portability, high-performance SVG animations for the Hourglass timer, and complete dataset coverage for all 62 Part 2 + 32 Part 1 topics.

**Tech Stack:** HTML5, CSS3 (modern responsive design with dark/light theme support), Vanilla ES6+ JavaScript, Node.js test runner for automated data and state verification.

---

### Task 1: Complete Q2 2026 Datasets & Story Multipliers

**Files:**
- Create: `src/data/topics-part2.js`
- Create: `src/data/topics-part1.js`
- Create: `src/data/stories.js`
- Test: `tests/data.test.js`

- [ ] **Step 1: Write automated test to verify all 62 Part 2 topics and 32 Part 1 topics are present with complete cue cards, prompts, and sample transcripts**

```javascript
// tests/data.test.js
const assert = require('assert');
const { topicsPart2 } = require('../src/data/topics-part2.js');
const { topicsPart1 } = require('../src/data/topics-part1.js');
const { storyClusters } = require('../src/data/stories.js');

console.log('Testing Datasets...');
assert.strictEqual(topicsPart2.length, 62, 'Must contain exactly 62 Part 2 topics');
topicsPart2.forEach(t => {
  assert.ok(t.id >= 1 && t.id <= 62, `Topic id must be between 1 and 62, got ${t.id}`);
  assert.ok(t.title && t.title.length > 0, `Topic ${t.id} must have a title`);
  assert.ok(t.cueCard && t.cueCard.points && t.cueCard.points.length > 0, `Topic ${t.id} must have cue points`);
  assert.ok(Array.isArray(t.part3Questions), `Topic ${t.id} must have part 3 questions array`);
  assert.ok(['new', 'tried', 'improving', 'ready'].includes(t.status), `Topic ${t.id} must have valid status`);
});

assert.strictEqual(topicsPart1.length, 32, 'Must contain exactly 32 Part 1 topics');
topicsPart1.forEach(t => {
  assert.ok(t.id >= 1 && t.id <= 32, `Part 1 topic id must be between 1 and 32, got ${t.id}`);
  assert.ok(t.title && t.title.length > 0, `Part 1 topic ${t.id} must have a title`);
  assert.ok(t.questions && t.questions.length > 0, `Part 1 topic ${t.id} must have questions`);
});

assert.ok(storyClusters.length >= 5, 'Must contain at least 5 story clusters');
console.log('✅ Datasets verification passed!');
```

- [ ] **Step 2: Run test to verify it fails before file creation**

Run: `node tests/data.test.js`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement `src/data/topics-part2.js`, `src/data/topics-part1.js`, and `src/data/stories.js` with full content from prompt**

Write the complete datasets with all 62 Part 2 cue cards and bullet points, Part 3 questions, and student notes for `#4`, `#23`, `#46`, plus all 32 Part 1 topics with student notes for `#1`, `#7`, `#8`, `#11`, `#13`, `#14`, `#16`, `#30`, `#31`, `#32`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/data.test.js`
Expected: PASS (`✅ Datasets verification passed!`)

- [ ] **Step 5: Commit dataset module**

```bash
git add src/data/ tests/data.test.js
git commit -m "feat(data): add complete Q2 2026 forecast pool datasets and student transcripts"
```

---

### Task 2: State Management & Persistence Engine

**Files:**
- Create: `src/state.js`
- Test: `tests/state.test.js`

- [ ] **Step 1: Write state management test covering 4-stage mastery transitions, streak calculation, and localStorage sync**

```javascript
// tests/state.test.js
const assert = require('assert');
const { AppState } = require('../src/state.js');
const { topicsPart2 } = require('../src/data/topics-part2.js');
const { topicsPart1 } = require('../src/data/topics-part1.js');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; },
  removeItem: (k) => { delete storage[k]; }
};

const appState = new AppState(topicsPart2, topicsPart1);
assert.strictEqual(appState.getPart2Topic(4).status, 'ready');
assert.strictEqual(appState.getPart2Topic(23).status, 'ready');
assert.strictEqual(appState.getPart2Topic(46).status, 'ready');

appState.setPart2Status(1, 'improving');
assert.strictEqual(appState.getPart2Topic(1).status, 'improving');

const stats = appState.getPart2Stats();
assert.ok(stats.readyCount >= 3, 'Must have at least 3 ready topics');
assert.strictEqual(stats.total, 62);

const mission = appState.getTodaysMission();
assert.strictEqual(mission.length, 3, 'Must generate exactly 3 daily mission topics');

console.log('✅ State management tests passed!');
```

- [ ] **Step 2: Run test to verify failure**

Run: `node tests/state.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `src/state.js`**

Implement `AppState` with reactive event dispatching, auto-save to `localStorage`, status getters/setters, daily streak logic, and import/export methods.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/state.test.js`
Expected: PASS

- [ ] **Step 5: Commit state management module**

```bash
git add src/state.js tests/state.test.js
git commit -m "feat(state): implement reactive state manager, streak tracker, and storage persistence"
```

---

### Task 3: Hourglass Animated Countdown Timer & Sound Engine

**Files:**
- Create: `src/timer.js`
- Test: `tests/timer.test.js`

- [ ] **Step 1: Write timer engine test**

```javascript
// tests/timer.test.js
const assert = require('assert');
const { ExamTimer } = require('../src/timer.js');

let ticks = 0;
let phaseChanged = null;
const timer = new ExamTimer({
  onTick: (remaining, total, phase) => { ticks++; },
  onPhaseChange: (phase) => { phaseChanged = phase; },
  onComplete: () => {}
});

timer.startPrep(2); // 2 seconds test
assert.strictEqual(timer.phase, 'prep');
assert.strictEqual(timer.remaining, 2);
timer.stop();
console.log('✅ Timer engine test passed!');
```

- [ ] **Step 2: Run test to verify failure**

Run: `node tests/timer.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `src/timer.js`**

Implement `ExamTimer` with 1:00 prep phase, 2:00 speaking phase, web audio synthesized pleasant chimes for timer start/completion, and smooth hourglass SVG drain progress generator.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/timer.test.js`
Expected: PASS

- [ ] **Step 5: Commit timer module**

```bash
git add src/timer.js tests/timer.test.js
git commit -m "feat(timer): implement exam prep & speak hourglass timer engine"
```

---

### Task 4: UI Presentation, 62-Node Map Matrix, and Interactive Cue Card Modal

**Files:**
- Create: `index.html`
- Create: `src/styles.css`
- Create: `src/app.js`

- [ ] **Step 1: Write `src/styles.css`**

Implement clean, responsive, aesthetic UI styles:
- Multi-colored progress bar (`--state-ready`, `--state-improving`, `--state-tried`, `--state-new`)
- 62-node matrix grid with glowing interactive circles and tooltips
- Milestone progress ladder with achievement badges
- Today's 3 Mission widget
- Story Multiplier Hub cards
- Topic Practice Drawer / Modal with SVG Hourglass animation, cue card bullet points, notes editor, and Part 3 accordion.
- Part 1 tab layout.

- [ ] **Step 2: Build `index.html` structure**

Build the complete HTML layout with navigation tabs (*Part 2 Quest Map*, *Part 1 Frames*, *Story Multiplier*, *Backup & Settings*), header KPIs, filter chips, search bar, and modal containers.

- [ ] **Step 3: Implement `src/app.js` UI Controller**

Connect `AppState`, `ExamTimer`, and datasets to the DOM:
- Render the 62 circles with numbers 1 to 62.
- **Attach click listener to each circle to immediately open its Cue Card modal with title, cue points, and notes.**
- Render Today's 3 Speaking Mission.
- Render Story Multiplier cards with jump-to-topic badges.
- Render Part 1 topics list with collapsible questions and notes.
- Wire status changer buttons (`New`, `Tried`, `Improving`, `Exam Ready`).
- Wire 1:00 Prep and 2:00 Speak Hourglass timers.
- Wire Export / Import JSON functionality.

- [ ] **Step 4: Commit UI components**

```bash
git add index.html src/styles.css src/app.js
git commit -m "feat(ui): implement 62-node journey matrix, cue card modal, and story multiplier"
```

---

### Task 5: End-to-End Verification & Walkthrough

**Files:**
- Create: `tests/e2e.test.js`

- [ ] **Step 1: Write comprehensive validation test**

```javascript
// tests/e2e.test.js
const assert = require('assert');
const fs = require('fs');

assert.ok(fs.existsSync('index.html'), 'index.html must exist');
assert.ok(fs.existsSync('src/styles.css'), 'src/styles.css must exist');
assert.ok(fs.existsSync('src/app.js'), 'src/app.js must exist');
assert.ok(fs.existsSync('src/data/topics-part2.js'), 'topics-part2.js must exist');
assert.ok(fs.existsSync('src/data/topics-part1.js'), 'topics-part1.js must exist');

const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('IELTS Speaking Quest'), 'Title must be in HTML');
assert.ok(indexHtml.includes('id="topic-map"'), 'Topic map container must exist');
assert.ok(indexHtml.includes('id="modal-cuecard"'), 'Modal cuecard must exist');

console.log('✅ End-to-End project structure verified!');
```

- [ ] **Step 2: Run all tests and verify all pass**

Run: `node tests/data.test.js && node tests/state.test.js && node tests/timer.test.js && node tests/e2e.test.js`
Expected: PASS

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: complete IELTS Speaking Quest & TopicKeeper application"
```
