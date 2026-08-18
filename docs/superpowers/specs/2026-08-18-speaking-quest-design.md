# IELTS Speaking Quest & TopicKeeper — Design Specification

## 1. Overview & Pedagogical Objective
**TopicKeeper (Speaking Quest)** is an interactive, gamified web application built for IELTS teachers and students to master the official **Q2: May–August 2026 IELTS Speaking Forecast Pool** (62 Part 2 topics and 32 Part 1 frames).

### Key Psychological & Pedagogical Principles:
1. **Accumulation over Depletion:** Rather than an hourglass telling the student *"time is running out"*, the main screen presents a **62-Topic Constellation Quest Map** where students see mastery accumulate into a colorful constellation of wins.
2. **Micro-Habit ("Today's 3 Mission"):** Prevents decision paralysis by breaking 62 topics down into a daily 24-minute mission (3 topics per day).
3. **Four-Stage Mastery Pipeline:** Moves beyond binary *done/not done* to reflect actual language acquisition: `○ New` -> `◔ Tried` -> `◑ Improving` -> `● Exam Ready`.
4. **Hourglass as Realistic Exam Simulation:** The animated Hourglass is used precisely where it belongs—inside the **1:00 Prep** and **2:00 Speaking** practice view.
5. **Story Multiplier Hub:** Highlights how **15–20 core life stories** naturally cover all 62 forecast cue cards, eliminating the anxiety of memorizing 62 distinct speeches.

---

## 2. User Interface & Core Interactive Components

### Component A: Header & Multi-Stage Progress Bar
- **Readiness KPI:** Displays `X / 62 Exam Ready` + percentage (e.g. `24 Ready (39%)`).
- **Multi-color Progress Bar:**
  - 🟢 Green (`Exam Ready`)
  - 🟡 Orange (`Improving`)
  - 🔵 Blue (`Tried`)
  - ⚪ Grey (`New`)
- **Daily Streak Badge:** 🔥 Tracks consecutive practice days and goal completions.
- **Milestone Ladder:**
  - `🌱 10 Topics` — Getting Started
  - `🔥 20 Topics` — Building Fluency
  - `🎙️ 30 Topics` — Confident Speaker
  - `🚀 40 Topics` — Exam Mode
  - `💪 50 Topics` — Almost Ready
  - `🏆 62 Topics` — Prediction Pool Complete

### Component B: The 62-Node Journey Matrix (Interactive Number Map)
- Visual grid of 62 circular interactive nodes (1 to 62), color-coded by current mastery state.
- **Instant Click Interaction:** Clicking on any number circle (e.g. #4, #27, #46) immediately opens the **Cue Card & Practice Drawer/Modal**:
  - Displays the topic title.
  - Displays the exact **"You should say:"** cue card bullet points.
  - Displays the **Part 3 Follow-up Discussion Questions** accordion.
  - Displays preloaded student transcripts, practice notes, and teacher corrections.
  - Controls to start the **1:00 Prep / 2:00 Speak Hourglass Timers**.
  - One-click buttons to change mastery state (`○ New` -> `◔ Tried` -> `◑ Improving` -> `● Exam Ready`).
- **Hover interaction:** Tooltip with topic title and last practiced status.
- Quick filter tabs: `All (62)`, `Exam Ready`, `Improving`, `Tried`, `New`, plus category chips (*People, Places, Tech, Experiences, Culture, Ambition*).
- Tab toggle to switch between **Part 2 + 3 Quest** and **Part 1 Compulsory Frames (32 Topics)**.

### Component C: "Today's 3 Speaking Mission" (Micro-Habit Engine)
- Compact daily card showcasing 3 prioritized topics (~24 minutes total).
- Selection algorithm: Picks 1 topic to review (`Improving`), 1 topic to push (`Tried`), and 1 unseen topic (`New`).
- Visual status checkboxes `① ✓  ② ▶  ③ ○` + celebration modal upon completing all 3.
- Clicking any mission item immediately focuses its cue card and preparation hourglass.

### Component D: Story Multiplier Hub
- Interactive connection cards showing how 1 master story covers multiple cue cards:
  - 👩‍🏫 **My Mother / Family:** #1 (Proud of family), #6 (Helpful person), #13 (Planning), #25 (Encouraged), #45 (Achieved difficult thing).
  - 🏖️ **Cua Lo Beach Trip:** #11 (Quiet place), #22 (City visited), #29 (Good place to live), #43 (Holiday recommend), #44 (Boring place), #57 (Far-away place).
  - 🎂 **20th Birthday Celebration:** #4 (People smiling), #8 (Gifts), #26 (Special food), #62 (Special cake).
  - 🎵 **G-Dragon Concert with Friend:** #14 (Singing), #19 (Music event), #23 (Clever solution), #54 (First time activity).
  - 🚗 **City Traffic & Pollution:** #10 (Trip), #25 (Cars), #46 (Environmental law).
- Clicking any topic badge in a story card jumps directly to that topic's cue card.

### Component E: Active Practice Studio (with Hourglass Countdown)
- **Topic Header & Cues:** Full cue card prompts (*"You should say: ..."*).
- **Preparation Mode (1:00):**
  - Animated visual hourglass emptying over 60 seconds.
  - Prep scratchpad for jotting 3–4 keywords/bullet points.
- **Speaking Mode (2:00):**
  - Animated visual hourglass running for 120 seconds with visual pulse alerts at 1:30 and 2:00.
  - Optional scratchpad notes visible during speech.
- **Part 3 Accordion:** Expands the 4–8 follow-up discussion questions for comprehensive simulation.
- **Student Transcripts & Corrections Log:** Pre-loaded with teacher feedback and student answers, editable in real time.
- **1-Click Mastery Setter:** Update status directly to `Tried ◔`, `Improving ◑`, or `Exam Ready ●`.

---

## 3. Data Model & Architecture

### Topic Data Structure
```typescript
interface TopicPart2 {
  id: number; // 1 to 62
  title: string;
  category: 'People' | 'Places' | 'Tech & Objects' | 'Experiences' | 'Culture & Nature' | 'Ambition';
  cueCard: {
    prompt: string;
    points: string[];
  };
  part3Questions: string[];
  status: 'new' | 'tried' | 'improving' | 'ready';
  lastPracticed?: string; // ISO date string
  notes?: string;
  studentTranscript?: string;
  storyCluster?: string; // e.g. 'Cua Lo Beach', '20th Birthday'
}

interface TopicPart1 {
  id: number; // 1 to 32
  title: string;
  questions: string[];
  status: 'new' | 'tried' | 'improving' | 'ready';
  notes?: string;
  studentTranscript?: string;
}
```

### Persistence & Portability
- **Storage:** LocalStorage browser persistence with auto-save.
- **Backup / Sync:** 1-click **Export JSON** and **Import JSON** to easily backup progress or transfer between teacher and student devices.

---

## 4. Preloaded Datasets
- **All 62 Part 2 + Part 3 Topics** from the Q2 2026 Forecast Pool.
- **All 32 Part 1 Topics** with compulsory questions.
- **Existing Student Transcripts & Corrections** preloaded for:
  - Part 2: `#4` (People smiling), `#23` (Clever solution), `#46` (Environmental law).
  - Part 1: `#1` (Where you live), `#7` (Morning routine), `#8` (Gifts), `#11` (Travelling), `#13` (Memory), `#14` (Singing), `#16` (Watch), `#30` (Ambition), `#31` (Talking to elderly), `#32` (Mirrors).

---

## 5. Verification & Testing Plan
1. **Interactive Node Click:** Verify clicking any of the 62 circles immediately opens and displays the corresponding topic title, cue card prompt, and bullet points.
2. **State Updates:** Test status transitions (`New` -> `Tried` -> `Improving` -> `Ready`) updating the progress bar and node colors instantly.
3. **Daily Mission Generator:** Verify 3 smart topics load daily and track completion.
4. **Hourglass Practice Timer:** Verify 1:00 prep timer and 2:00 speaking timer accurately count down with animation and sound/visual chime.
5. **Data Persistence:** Verify editing notes, student transcripts, and statuses persist after page reload, and export/import works smoothly.
