/**
 * IELTS Speaking Quest & TopicKeeper — Main Application Controller
 * Wires State Management, 62-Node Map Matrix, Cue Card Modal, Story Multipliers, and Part 1 Frames.
 */

(function () {
  'use strict';

  // --- STATE INITIALIZATION ---
  const defaultP2 = (typeof window !== 'undefined' && window.topicsPart2) ? window.topicsPart2 : [];
  const defaultP1 = (typeof window !== 'undefined' && window.topicsPart1) ? window.topicsPart1 : [];
  const stories = (typeof window !== 'undefined' && window.storyClusters) ? window.storyClusters : [];

  let state;
  if (typeof window !== 'undefined' && window.AppState) {
    state = new window.AppState(defaultP2, defaultP1);
    window.appStateInstance = state;
  }

  // Active UI filters
  let currentFilterStatus = 'all';
  let currentFilterCategory = 'all';
  let currentSearchQuery = '';

  let currentPart1Status = 'all';
  let currentPart1Search = '';

  let currentModalTopicId = 1;
  let notesSaveTimeout = null;

  // --- DOM ELEMENT REFERENCES ---
  const elements = {};

  function cacheDOMElements() {
    elements.streakCount = document.getElementById('streak-count');
    elements.themeToggle = document.getElementById('theme-toggle');

    // Dashboard KPIs
    elements.kpiReadyCount = document.getElementById('kpi-ready-count');
    elements.kpiPercentage = document.getElementById('kpi-percentage');
    elements.milestoneNextText = document.getElementById('milestone-next-text');
    elements.milestoneNextBadge = document.getElementById('milestone-next-badge');
    elements.segReady = document.getElementById('seg-ready');
    elements.segImproving = document.getElementById('seg-improving');
    elements.segTried = document.getElementById('seg-tried');
    elements.segNew = document.getElementById('seg-new');
    elements.countReady = document.getElementById('count-ready');
    elements.countImproving = document.getElementById('count-improving');
    elements.countTried = document.getElementById('count-tried');
    elements.milestoneLadder = document.getElementById('milestone-ladder');

    // Tabs & Views
    elements.navTabs = document.querySelectorAll('.nav-tab');
    elements.tabViews = document.querySelectorAll('.tab-view');
    elements.tabBadgePart2 = document.getElementById('tab-badge-part2');
    elements.tabBadgePart1 = document.getElementById('tab-badge-part1');

    // Part 2 Matrix View
    elements.searchInput = document.getElementById('search-input');
    elements.btnRandomTopic = document.getElementById('btn-random-topic');
    elements.statusChips = document.querySelectorAll('[data-filter-status]');
    elements.categoryChips = document.querySelectorAll('[data-filter-category]');
    elements.topicMap = document.getElementById('topic-map');
    elements.nodeTooltip = document.getElementById('node-tooltip');

    // Part 1 View
    elements.searchPart1 = document.getElementById('search-part1');
    elements.part1StatusChips = document.querySelectorAll('[data-filter-part1-status]');
    elements.part1List = document.getElementById('part1-list');

    // Stories View
    elements.storiesGrid = document.getElementById('stories-grid');

    // Settings View
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.btnCopyJson = document.getElementById('btn-copy-json');
    elements.fileImportJson = document.getElementById('file-import-json');
    elements.importJsonText = document.getElementById('import-json-text');
    elements.btnImportJson = document.getElementById('btn-import-json');
    elements.importStatusMsg = document.getElementById('import-status-msg');
    elements.btnResetData = document.getElementById('btn-reset-data');

    // Cue Card Modal
    elements.modalCuecard = document.getElementById('modal-cuecard');
    elements.modalTopicId = document.getElementById('modal-topic-id');
    elements.modalCategory = document.getElementById('modal-category');
    elements.modalStatusBadge = document.getElementById('modal-status-badge');
    elements.modalTitle = document.getElementById('modal-title');
    elements.modalStoryLink = document.getElementById('modal-story-link');
    elements.modalStoryName = document.getElementById('modal-story-name');
    elements.btnCloseModal = document.getElementById('btn-close-modal');
    elements.cuecardPrompt = document.getElementById('cuecard-prompt');
    elements.cuecardPoints = document.getElementById('cuecard-points');
    elements.accordionPart3 = document.getElementById('accordion-part3');
    elements.accordionPart3Toggle = document.getElementById('accordion-part3-toggle');
    elements.accordionPart3Title = document.getElementById('accordion-part3-title');
    elements.part3QuestionsList = document.getElementById('part3-questions-list');
    elements.btnSetNew = document.getElementById('btn-set-new');
    elements.btnSetTried = document.getElementById('btn-set-tried');
    elements.btnSetImproving = document.getElementById('btn-set-improving');
    elements.btnSetReady = document.getElementById('btn-set-ready');
    elements.btnPrevTopic = document.getElementById('btn-prev-topic');
    elements.btnNextTopic = document.getElementById('btn-next-topic');
  }

  // --- THEME MANAGEMENT ---
  function initTheme() {
    const savedTheme = localStorage.getItem('topickeeper_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('topickeeper_theme', newTheme);
      });
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (elements.themeToggle) elements.themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (elements.themeToggle) elements.themeToggle.textContent = '🌙';
    }
  }

  // --- DASHBOARD & READINESS RENDERING ---
  function renderDashboard() {
    if (!state) return;

    const stats = state.getPart2Stats();
    const streak = state.getStreak();

    // Streak
    if (elements.streakCount) {
      elements.streakCount.textContent = `${streak.count}-Day Streak`;
    }

    // KPIs
    if (elements.kpiReadyCount) elements.kpiReadyCount.textContent = stats.readyCount;
    if (elements.kpiPercentage) elements.kpiPercentage.textContent = `${stats.readinessPercentage}%`;

    // Next Milestone
    if (elements.milestoneNextText && stats.nextMilestone) {
      elements.milestoneNextText.textContent = `${stats.topicsToNextMilestone} more to ${stats.nextMilestone.name}`;
      if (elements.milestoneNextBadge) {
        elements.milestoneNextBadge.querySelector('span:first-child').textContent = stats.nextMilestone.emoji;
      }
    } else if (elements.milestoneNextText) {
      elements.milestoneNextText.textContent = 'All 62 Topics Mastered!';
    }

    // Multi-segment progress bar
    const total = stats.total || 62;
    const readyPct = (stats.readyCount / total) * 100;
    const improvingPct = (stats.improvingCount / total) * 100;
    const triedPct = (stats.triedCount / total) * 100;
    const newPct = (stats.newCount / total) * 100;

    if (elements.segReady) elements.segReady.style.width = `${readyPct}%`;
    if (elements.segImproving) elements.segImproving.style.width = `${improvingPct}%`;
    if (elements.segTried) elements.segTried.style.width = `${triedPct}%`;
    if (elements.segNew) elements.segNew.style.width = `${newPct}%`;

    // Counts
    if (elements.countReady) elements.countReady.textContent = stats.readyCount;
    if (elements.countImproving) elements.countImproving.textContent = stats.improvingCount;
    if (elements.countTried) elements.countTried.textContent = stats.triedCount;
    if (elements.countNew) elements.countNew.textContent = stats.newCount;

    // Milestone ladder
    if (elements.milestoneLadder) {
      const steps = elements.milestoneLadder.querySelectorAll('.milestone-step');
      steps.forEach(step => {
        const target = Number(step.dataset.target);
        step.classList.remove('achieved', 'current');
        if (stats.readyCount >= target) {
          step.classList.add('achieved');
        } else if (stats.nextMilestone && stats.nextMilestone.target === target) {
          step.classList.add('current');
        }
      });
    }
  }

  // --- 62-NODE MATRIX MAP RENDERING ---
  function renderTopicMap() {
    if (!state || !elements.topicMap) return;

    const topics = state.getAllPart2Topics();
    elements.topicMap.innerHTML = '';

    topics.forEach(topic => {
      const node = document.createElement('button');
      node.className = `topic-node node-${topic.status || 'new'} ${topic.storyCluster ? 'has-story' : ''}`;
      node.dataset.id = topic.id;
      node.dataset.category = topic.category || '';
      node.dataset.status = topic.status || 'new';
      node.setAttribute('aria-label', `Topic ${topic.id}: ${topic.title} (${topic.status || 'new'})`);

      node.textContent = topic.id;

      // Event: Click node opens Cue Card Modal
      node.addEventListener('click', () => {
        openPart2Modal(topic.id);
      });

      // Event: Tooltip hover
      node.addEventListener('mouseenter', (e) => {
        showTooltip(topic, e);
      });

      node.addEventListener('mousemove', (e) => {
        positionTooltip(e);
      });

      node.addEventListener('mouseleave', () => {
        hideTooltip();
      });

      elements.topicMap.appendChild(node);
    });

    applyTopicFilters();
  }

  function applyTopicFilters() {
    if (!elements.topicMap) return;

    const nodes = elements.topicMap.querySelectorAll('.topic-node');
    const query = currentSearchQuery.trim().toLowerCase();

    nodes.forEach(node => {
      const id = Number(node.dataset.id);
      const category = node.dataset.category;
      const status = node.dataset.status;
      const topic = state.getPart2Topic(id);

      let matchStatus = (currentFilterStatus === 'all' || status === currentFilterStatus);
      let matchCategory = (currentFilterCategory === 'all' || category === currentFilterCategory);

      let matchSearch = true;
      if (query) {
        // Match topic id (e.g. #4, 4)
        const idMatches = query === String(id) || query === `#${id}`;
        const titleMatches = topic && topic.title && topic.title.toLowerCase().includes(query);
        const promptMatches = topic && topic.cueCard && topic.cueCard.prompt && topic.cueCard.prompt.toLowerCase().includes(query);
        const pointsMatch = topic && topic.cueCard && topic.cueCard.points && topic.cueCard.points.some(p => p.toLowerCase().includes(query));

        matchSearch = idMatches || titleMatches || promptMatches || pointsMatch;
      }

      if (matchStatus && matchCategory && matchSearch) {
        node.classList.remove('is-hidden');
      } else {
        node.classList.add('is-hidden');
      }
    });
  }

  // --- TOOLTIP LOGIC ---
  function showTooltip(topic, e) {
    if (!elements.nodeTooltip) return;

    const statusLabel = capitalize(topic.status || 'new');
    const practicedText = topic.lastPracticed ? `Last: ${topic.lastPracticed.slice(0, 10)}` : 'Not practiced yet';

    elements.nodeTooltip.innerHTML = `
      <strong>#${topic.id} · ${escapeHtml(topic.title)}</strong><br>
      <span style="color: var(--text-muted);">Category: ${escapeHtml(topic.category || 'General')}</span><br>
      <span>Status: <strong>${statusLabel}</strong> (${practicedText})</span>
    `;

    elements.nodeTooltip.classList.add('visible');
    positionTooltip(e);
  }

  function positionTooltip(e) {
    if (!elements.nodeTooltip) return;
    const padding = 12;
    let x = e.clientX + padding;
    let y = e.clientY + padding;

    // Prevent overflow offscreen
    const tooltipRect = elements.nodeTooltip.getBoundingClientRect();
    if (x + tooltipRect.width > window.innerWidth) {
      x = e.clientX - tooltipRect.width - padding;
    }
    if (y + tooltipRect.height > window.innerHeight) {
      y = e.clientY - tooltipRect.height - padding;
    }

    elements.nodeTooltip.style.left = `${Math.max(10, x)}px`;
    elements.nodeTooltip.style.top = `${Math.max(10, y)}px`;
  }

  function hideTooltip() {
    if (!elements.nodeTooltip) return;
    elements.nodeTooltip.classList.remove('visible');
  }

  // --- CUE CARD MODAL LOGIC ---
  function openPart2Modal(topicId) {
    if (!state) return;
    const id = Number(topicId);
    const topic = state.getPart2Topic(id);
    if (!topic) return;

    currentModalTopicId = id;

    // Header info
    if (elements.modalTopicId) elements.modalTopicId.textContent = `#${topic.id}`;
    if (elements.modalCategory) elements.modalCategory.textContent = topic.category || 'Part 2';
    if (elements.modalTitle) elements.modalTitle.textContent = topic.title;

    // Status badge
    if (elements.modalStatusBadge) {
      elements.modalStatusBadge.className = `modal-status-badge status-${topic.status || 'new'}`;
      elements.modalStatusBadge.textContent = `${getStatusEmoji(topic.status)} ${capitalize(topic.status || 'new')}`;
    }

    // Story Link
    if (elements.modalStoryLink && elements.modalStoryName) {
      if (topic.storyCluster) {
        elements.modalStoryName.textContent = topic.storyCluster;
        elements.modalStoryLink.style.display = 'inline-flex';
        elements.modalStoryLink.onclick = (e) => {
          e.preventDefault();
          closeModal();
          switchTab('stories');
        };
      } else {
        elements.modalStoryLink.style.display = 'none';
      }
    }

    // "You should say:" Bullet Points
    if (elements.cuecardPrompt) {
      elements.cuecardPrompt.textContent = (topic.cueCard && topic.cueCard.prompt) ? topic.cueCard.prompt : 'You should say:';
    }
    if (elements.cuecardPoints) {
      elements.cuecardPoints.innerHTML = '';
      const points = (topic.cueCard && Array.isArray(topic.cueCard.points)) ? topic.cueCard.points : [];
      points.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        elements.cuecardPoints.appendChild(li);
      });
    }

    // Part 3 Accordion Questions
    if (elements.part3QuestionsList) {
      elements.part3QuestionsList.innerHTML = '';
      const p3Questions = Array.isArray(topic.part3Questions) ? topic.part3Questions : [];
      if (elements.accordionPart3Title) {
        elements.accordionPart3Title.textContent = `💬 Part 3 Follow-up Discussion Questions (${p3Questions.length})`;
      }
      p3Questions.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q;
        elements.part3QuestionsList.appendChild(li);
      });
    }

    // Update Mastery Buttons highlight
    updateModalMasteryButtons(topic.status || 'new');

    // Open Modal
    if (elements.modalCuecard) {
      elements.modalCuecard.classList.add('open');
      elements.modalCuecard.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (elements.modalCuecard) {
      elements.modalCuecard.classList.remove('open');
      elements.modalCuecard.setAttribute('aria-hidden', 'true');
    }
    hideTooltip();
  }

  function updateModalMasteryButtons(currentStatus) {
    const btns = [
      { el: elements.btnSetNew, status: 'new' },
      { el: elements.btnSetTried, status: 'tried' },
      { el: elements.btnSetImproving, status: 'improving' },
      { el: elements.btnSetReady, status: 'ready' }
    ];

    btns.forEach(({ el, status }) => {
      if (el) {
        if (status === currentStatus) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  }

  function handleSetStatus(newStatus) {
    if (!state || !currentModalTopicId) return;

    state.setPart2Status(currentModalTopicId, newStatus);
    const updated = state.getPart2Topic(currentModalTopicId);

    if (updated) {
      if (elements.modalStatusBadge) {
        elements.modalStatusBadge.className = `modal-status-badge status-${updated.status}`;
        elements.modalStatusBadge.textContent = `${getStatusEmoji(updated.status)} ${capitalize(updated.status)}`;
      }
      updateModalMasteryButtons(updated.status);
    }
  }

  // --- RANDOM TOPIC PICKER ---
  function pickRandomTopic() {
    if (!state) return;
    const allTopics = state.getAllPart2Topics();

    // Prefer unpracticed or improving topics
    const candidates = allTopics.filter(t => t.status === 'new' || t.status === 'tried' || t.status === 'improving');
    const pool = candidates.length > 0 ? candidates : allTopics;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    if (chosen) {
      openPart2Modal(chosen.id);
    }
  }

  // --- STORY MULTIPLIERS RENDERING ---
  function renderStoryMultipliers() {
    if (!elements.storiesGrid) return;

    elements.storiesGrid.innerHTML = '';

    stories.forEach(story => {
      const card = document.createElement('div');
      card.className = 'story-card';

      // Collect topic badges
      let badgesHtml = '';
      if (Array.isArray(story.topicIds) && state) {
        story.topicIds.forEach(tid => {
          const t = state.getPart2Topic(tid);
          const title = t ? t.title : `Topic #${tid}`;
          const status = t ? (t.status || 'new') : 'new';
          badgesHtml += `
            <button class="story-topic-badge badge-${status}" data-topic-id="${tid}" title="${escapeHtml(title)}">
              ${getStatusEmoji(status)} #${tid} ${escapeHtml(title.length > 28 ? title.slice(0, 26) + '…' : title)}
            </button>
          `;
        });
      }

      card.innerHTML = `
        <div class="story-header">
          <span class="story-emoji">${story.emoji || '📖'}</span>
          <div class="story-title-group">
            <h3 class="story-title">${escapeHtml(story.title)}</h3>
            <p class="story-summary">${escapeHtml(story.description || '')}</p>
          </div>
        </div>

        <div class="story-narrative-box">
          ${escapeHtml(story.narrative || '')}
        </div>

        <div>
          <div class="story-topics-title">Covers ${story.topicIds ? story.topicIds.length : 0} Cue Cards:</div>
          <div class="story-topics-wrap">
            ${badgesHtml}
          </div>
        </div>
      `;

      // Wire badge clicks
      const badges = card.querySelectorAll('.story-topic-badge');
      badges.forEach(b => {
        b.addEventListener('click', () => {
          const tid = Number(b.dataset.topicId);
          openPart2Modal(tid);
        });
      });

      elements.storiesGrid.appendChild(card);
    });
  }

  // --- PART 1 COMPULSORY FRAMES RENDERING ---
  function renderPart1List() {
    if (!state || !elements.part1List) return;

    const topics = state.getAllPart1Topics();
    elements.part1List.innerHTML = '';

    const query = currentPart1Search.trim().toLowerCase();

    topics.forEach(topic => {
      // Filter check
      const matchStatus = (currentPart1Status === 'all' || topic.status === currentPart1Status);
      let matchQuery = true;
      if (query) {
        const idMatches = query === String(topic.id) || query === `#${topic.id}`;
        const titleMatches = topic.title && topic.title.toLowerCase().includes(query);
        const questionsMatch = topic.questions && topic.questions.some(q => q.toLowerCase().includes(query));
        matchQuery = idMatches || titleMatches || questionsMatch;
      }

      if (!matchStatus || !matchQuery) return;

      const card = document.createElement('div');
      card.className = 'part1-card';
      card.dataset.id = topic.id;

      let qListHtml = '';
      if (Array.isArray(topic.questions)) {
        topic.questions.forEach(q => {
          qListHtml += `<li>${escapeHtml(q)}</li>`;
        });
      }

      card.innerHTML = `
        <div class="part1-header">
          <div class="part1-title-group">
            <span class="part1-num">#${topic.id}</span>
            <h3 class="part1-title">${escapeHtml(topic.title)}</h3>
          </div>
          <span class="part1-status-pill modal-status-badge status-${topic.status || 'new'}">
            ${getStatusEmoji(topic.status)} ${capitalize(topic.status || 'new')}
          </span>
        </div>

        <div class="part1-questions-box">
          <ol class="part1-q-list">
            ${qListHtml}
          </ol>
        </div>

        <div class="part1-actions">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Set Status:</span>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn-mastery btn-set-new ${topic.status === 'new' ? 'active' : ''}" data-status="new">○ New</button>
            <button class="btn-mastery btn-set-tried ${topic.status === 'tried' ? 'active' : ''}" data-status="tried">◔ Tried</button>
            <button class="btn-mastery btn-set-improving ${topic.status === 'improving' ? 'active' : ''}" data-status="improving">◑ Improving</button>
            <button class="btn-mastery btn-set-ready ${topic.status === 'ready' ? 'active' : ''}" data-status="ready">● Ready</button>
          </div>
        </div>
      `;

      // Wire Part 1 status buttons
      const statusBtns = card.querySelectorAll('.btn-mastery');
      statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const st = btn.dataset.status;
          state.setPart1Status(topic.id, st);
        });
      });

      elements.part1List.appendChild(card);
    });
  }

  // --- BACKUP & SETTINGS ACTIONS ---
  function exportBackupJSON() {
    if (!state) return;
    const json = state.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `topickeeper-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyBackupJSON() {
    if (!state) return;
    const json = state.exportJSON();
    navigator.clipboard.writeText(json).then(() => {
      if (elements.btnCopyJson) {
        const originalText = elements.btnCopyJson.textContent;
        elements.btnCopyJson.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => {
          elements.btnCopyJson.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      alert('Could not copy to clipboard. Please use file export.');
    });
  }

  function importBackupJSON() {
    if (!state) return;
    const text = elements.importJsonText ? elements.importJsonText.value.trim() : '';

    if (!text) {
      if (elements.importStatusMsg) {
        elements.importStatusMsg.textContent = '⚠️ Please paste JSON or select a file first.';
        elements.importStatusMsg.style.color = '#ef4444';
      }
      return;
    }

    try {
      state.importJSON(text);
      if (elements.importStatusMsg) {
        elements.importStatusMsg.textContent = '✓ Backup restored successfully!';
        elements.importStatusMsg.style.color = '#10b981';
      }
      if (elements.importJsonText) elements.importJsonText.value = '';
    } catch (err) {
      if (elements.importStatusMsg) {
        elements.importStatusMsg.textContent = `❌ Import failed: ${err.message}`;
        elements.importStatusMsg.style.color = '#ef4444';
      }
    }
  }

  function handleFileInput(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (elements.importJsonText) {
        elements.importJsonText.value = content;
      }
      importBackupJSON();
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (!state) return;
    const confirmReset = window.confirm('Are you sure you want to reset all topics, notes, and streak back to factory defaults? This cannot be undone.');
    if (confirmReset) {
      state.resetToDefaults();
      alert('All data has been reset to defaults.');
    }
  }

  // --- TAB NAVIGATION ---
  function switchTab(tabId) {
    if (!elements.navTabs || !elements.tabViews) return;

    elements.navTabs.forEach(tab => {
      if (tab.dataset.tab === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    elements.tabViews.forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Re-render Part 1 or Stories if active
    if (tabId === 'part1') renderPart1List();
    if (tabId === 'stories') renderStoryMultipliers();
  }

  // --- EVENT LISTENERS INITIALIZATION ---
  function initEventListeners() {
    // Navigation Tabs
    if (elements.navTabs) {
      elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          switchTab(tab.dataset.tab);
        });
      });
    }

    // Part 2 Search & Filter
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', debounce((e) => {
        currentSearchQuery = e.target.value;
        applyTopicFilters();
      }, 150));
    }

    if (elements.btnRandomTopic) {
      elements.btnRandomTopic.addEventListener('click', pickRandomTopic);
    }

    if (elements.statusChips) {
      elements.statusChips.forEach(chip => {
        chip.addEventListener('click', () => {
          elements.statusChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilterStatus = chip.dataset.filterStatus;
          applyTopicFilters();
        });
      });
    }

    if (elements.categoryChips) {
      elements.categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
          elements.categoryChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilterCategory = chip.dataset.filterCategory;
          applyTopicFilters();
        });
      });
    }

    // Modal Close
    if (elements.btnCloseModal) {
      elements.btnCloseModal.addEventListener('click', closeModal);
    }

    if (elements.modalCuecard) {
      elements.modalCuecard.addEventListener('click', (e) => {
        if (e.target === elements.modalCuecard) {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modalCuecard && elements.modalCuecard.classList.contains('open')) {
        closeModal();
      }
    });

    // Modal Previous / Next Navigation
    if (elements.btnPrevTopic) {
      elements.btnPrevTopic.addEventListener('click', () => {
        const prevId = currentModalTopicId <= 1 ? 62 : currentModalTopicId - 1;
        openPart2Modal(prevId);
      });
    }

    if (elements.btnNextTopic) {
      elements.btnNextTopic.addEventListener('click', () => {
        const nextId = currentModalTopicId >= 62 ? 1 : currentModalTopicId + 1;
        openPart2Modal(nextId);
      });
    }

    // Modal Part 3 Accordion Toggle
    if (elements.accordionPart3Toggle && elements.accordionPart3) {
      elements.accordionPart3Toggle.addEventListener('click', () => {
        elements.accordionPart3.classList.toggle('open');
      });
    }

    // Modal Mastery Buttons
    if (elements.btnSetNew) elements.btnSetNew.addEventListener('click', () => handleSetStatus('new'));
    if (elements.btnSetTried) elements.btnSetTried.addEventListener('click', () => handleSetStatus('tried'));
    if (elements.btnSetImproving) elements.btnSetImproving.addEventListener('click', () => handleSetStatus('improving'));
    if (elements.btnSetReady) elements.btnSetReady.addEventListener('click', () => handleSetStatus('ready'));

    // Part 1 Search & Filters
    if (elements.searchPart1) {
      elements.searchPart1.addEventListener('input', debounce((e) => {
        currentPart1Search = e.target.value;
        renderPart1List();
      }, 150));
    }

    if (elements.part1StatusChips) {
      elements.part1StatusChips.forEach(chip => {
        chip.addEventListener('click', () => {
          elements.part1StatusChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentPart1Status = chip.dataset.filterPart1Status;
          renderPart1List();
        });
      });
    }

    // Settings Actions
    if (elements.btnExportJson) elements.btnExportJson.addEventListener('click', exportBackupJSON);
    if (elements.btnCopyJson) elements.btnCopyJson.addEventListener('click', copyBackupJSON);
    if (elements.btnImportJson) elements.btnImportJson.addEventListener('click', importBackupJSON);
    if (elements.fileImportJson) elements.fileImportJson.addEventListener('change', handleFileInput);
    if (elements.btnResetData) elements.btnResetData.addEventListener('click', resetAllData);

    // Subscribe to state changes for reactive re-render
    if (state) {
      state.subscribe((s, event) => {
        renderDashboard();
        renderTopicMap();
        if (elements.tabBadgePart2) elements.tabBadgePart2.textContent = s.getAllPart2Topics().length;
        if (elements.tabBadgePart1) elements.tabBadgePart1.textContent = s.getAllPart1Topics().length;

        // If part 1 is visible, re-render
        const activeTab = document.querySelector('.nav-tab.active');
        if (activeTab && activeTab.dataset.tab === 'part1') {
          renderPart1List();
        }
        if (activeTab && activeTab.dataset.tab === 'stories') {
          renderStoryMultipliers();
        }
      });
    }
  }

  // --- UTILITY HELPERS ---
  function getStatusEmoji(status) {
    switch (status) {
      case 'ready': return '●';
      case 'improving': return '◑';
      case 'tried': return '◔';
      default: return '○';
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // --- INITIALIZATION ENTRYPOINT ---
  function initApp() {
    cacheDOMElements();
    initTheme();
    initEventListeners();

    renderDashboard();
    renderTopicMap();
    renderStoryMultipliers();
    renderPart1List();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
