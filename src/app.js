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

  // --- INTERNATIONALIZATION (I18N) ENGINE ---
  const I18N = {
    vi: {
      langCode: 'VI',
      langFlag: '🇻🇳',
      brandSubtitle: 'IELTS Speaking Quest · Bộ đề dự đoán Quý 2 (Tháng 5 – Tháng 8, 2026)',
      streak: '{n} ngày liên tiếp',
      kpiLabel: '/ 62 Đã sẵn sàng',
      topicsToNextMilestone: '{n} chủ đề nữa để đạt mốc {name}',
      allMastered: 'Đã hoàn thành toàn bộ 62 chủ đề!',
      ready: 'Sẵn sàng',
      readyFull: '● Sẵn sàng',
      improving: 'Đang cải thiện',
      improvingFull: '◑ Đang cải thiện',
      tried: 'Đã thử',
      triedFull: '◔ Đã thử',
      new: 'Chưa luyện',
      newFull: '○ Chưa luyện',
      all: 'Tất cả',
      tabPart2: 'Bản đồ Part 2',
      tabPart1: 'Khung đề Part 1',
      tabStories: 'Nhóm câu chuyện',
      tabSettings: 'Sao lưu & Cài đặt',
      searchPlaceholderPart2: 'Tìm kiếm chủ đề theo số (#4), tên tiếng Anh, từ khóa...',
      searchPlaceholderPart1: 'Tìm kiếm chủ đề & câu hỏi Part 1...',
      btnRandomTopic: 'Chọn ngẫu nhiên 1 chủ đề',
      filterStatus: 'Trạng thái:',
      filterCategory: 'Chủ đề:',
      allCategories: 'Tất cả chủ đề',
      matrixTitle: 'Hành trình 62 chủ đề Part 2',
      matrixHint: 'Nhấp vào vòng tròn số bất kỳ để xem Cue Card & gợi ý chi tiết',
      storyTabTitle: '🧬 Chiến lược dùng 1 câu chuyện cho nhiều đề',
      storyTabDesc: 'Thay vì ghi nhớ 62 bài nói riêng biệt, hãy làm chủ <strong>6 câu chuyện cốt lõi</strong> này. Mỗi câu chuyện có thể linh hoạt chuyển hóa để trả lời 4–6 đề IELTS Part 2 khác nhau (Người, Địa điểm, Đồ vật, Trải nghiệm). Nhấp vào bất kỳ chủ đề nào bên dưới để mở ngay Cue Card!',
      storyCovers: 'Bao quát {n} chủ đề Part 2:',
      settingsExportTitle: 'Xuất bản sao lưu',
      settingsExportDesc: 'Lưu trạng thái luyện tập, streak và tiến độ ra file JSON hoặc sao chép vào bộ nhớ tạm.',
      btnDownloadJson: 'Tải file JSON',
      btnCopyJson: 'Sao chép JSON',
      settingsImportTitle: 'Khôi phục bản sao lưu',
      settingsImportDesc: 'Khôi phục tiến độ từ file JSON đã lưu hoặc dán nội dung JSON vào khung bên dưới.',
      importPlaceholder: 'Hoặc dán nội dung JSON sao lưu vào đây...',
      btnImportJson: 'Khôi phục tiến độ',
      settingsResetTitle: 'Đặt lại mặc định',
      settingsResetDesc: 'Đặt lại tất cả trạng thái chủ đề về mặc định ban đầu. Hành động này không thể hoàn tác.',
      btnResetData: 'Xóa và đặt lại dữ liệu gốc',
      modalStoryLabel: '🧬 Câu chuyện liên kết:',
      modalPart3Title: '💬 Câu hỏi thảo luận Part 3 ({n})',
      modalUpdateStatus: 'Cập nhật trạng thái:',
      btnPrevTopic: '← Chủ đề trước',
      btnNextTopic: 'Chủ đề tiếp theo →',
      copied: '✓ Đã sao chép vào bộ nhớ tạm!',
      copyFailed: 'Không thể sao chép. Vui lòng sử dụng nút tải file JSON.',
      importEmpty: '⚠️ Vui lòng dán nội dung JSON hoặc chọn file trước.',
      importSuccess: '✓ Khôi phục tiến độ thành công!',
      importError: '❌ Lỗi khôi phục: ',
      resetConfirm: 'Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ về mặc định? Thao tác này không thể hoàn tác.',
      resetSuccess: 'Đã khôi phục dữ liệu gốc thành công!',
      categories: {
        People: 'Con người',
        Places: 'Địa điểm',
        'Tech & Objects': 'Công nghệ & Đồ vật',
        Experiences: 'Trải nghiệm',
        'Culture & Nature': 'Văn hóa & Tự nhiên',
        Ambition: 'Ước mơ & Dự định'
      },
      milestones: {
        10: { name: 'Khởi động', targetText: '10 Chủ đề' },
        20: { name: 'Tăng tốc', targetText: '20 Chủ đề' },
        30: { name: 'Tự tin nói', targetText: '30 Chủ đề' },
        40: { name: 'Sẵn sàng thi', targetText: '40 Chủ đề' },
        50: { name: 'Về đích', targetText: '50 Chủ đề' },
        62: { name: 'Hoàn thành bộ đề', targetText: '62 Chủ đề' }
      },
      tooltipCategory: 'Chủ đề:',
      tooltipStatus: 'Trạng thái:',
      tooltipLastPracticed: 'Lần luyện gần nhất:',
      tooltipNotPracticed: 'Chưa luyện'
    },
    en: {
      langCode: 'EN',
      langFlag: '🇬🇧',
      brandSubtitle: 'IELTS Speaking Quest · Q2 May–August 2026 Forecast Pool',
      streak: '{n}-Day Streak',
      kpiLabel: '/ 62 Exam Ready',
      topicsToNextMilestone: '{n} more to {name}',
      allMastered: 'All 62 Topics Mastered!',
      ready: 'Ready',
      readyFull: '● Ready',
      improving: 'Improving',
      improvingFull: '◑ Improving',
      tried: 'Tried',
      triedFull: '◔ Tried',
      new: 'New',
      newFull: '○ New',
      all: 'All',
      tabPart2: 'Part 2 Quest Map',
      tabPart1: 'Part 1 Frames',
      tabStories: 'Story Multipliers',
      tabSettings: 'Backup & Settings',
      searchPlaceholderPart2: 'Search topics by number (#4), title, or keywords...',
      searchPlaceholderPart1: 'Search Part 1 topics & questions...',
      btnRandomTopic: 'Pick Next Random Topic',
      filterStatus: 'Status:',
      filterCategory: 'Category:',
      allCategories: 'All Categories',
      matrixTitle: '62-Node Quest Journey Matrix',
      matrixHint: 'Click any circle to open its full Cue Card & bullet points',
      storyTabTitle: '🧬 The Story Multiplier Strategy',
      storyTabDesc: 'Instead of memorizing 62 distinct cue cards, master these <strong>6 core life stories</strong>. Each story effortlessly adapts to cover 4–6 different IELTS Part 2 topics across People, Places, Objects, and Experiences. Click any topic badge below to open its cue card!',
      storyCovers: 'Covers {n} Cue Cards:',
      settingsExportTitle: 'Export Backup',
      settingsExportDesc: 'Save your practice statuses, streak, and progress to a JSON file or copy to your clipboard.',
      btnDownloadJson: 'Download JSON File',
      btnCopyJson: 'Copy JSON',
      settingsImportTitle: 'Import Backup',
      settingsImportDesc: 'Restore your progress from a saved JSON backup file or paste JSON text below.',
      importPlaceholder: 'Or paste JSON backup content here...',
      btnImportJson: 'Restore Progress',
      settingsResetTitle: 'Reset to Default',
      settingsResetDesc: 'Reset all topic progress and statuses back to original factory defaults. This action cannot be undone.',
      btnResetData: 'Reset All Data to Default',
      modalStoryLabel: '🧬 Linked Story:',
      modalPart3Title: '💬 Part 3 Follow-up Discussion Questions ({n})',
      modalUpdateStatus: 'Update Mastery Status:',
      btnPrevTopic: '← Previous Topic',
      btnNextTopic: 'Next Topic →',
      copied: '✓ Copied to Clipboard!',
      copyFailed: 'Could not copy to clipboard. Please use file export.',
      importEmpty: '⚠️ Please paste JSON or select a file first.',
      importSuccess: '✓ Progress restored successfully!',
      importError: '❌ Import failed: ',
      resetConfirm: 'Are you sure you want to reset all topic progress to default? This cannot be undone.',
      resetSuccess: 'Progress reset to default successfully!',
      categories: {
        People: 'People',
        Places: 'Places',
        'Tech & Objects': 'Tech & Objects',
        Experiences: 'Experiences',
        'Culture & Nature': 'Culture & Nature',
        Ambition: 'Ambition'
      },
      milestones: {
        10: { name: 'Getting Started', targetText: '10 Topics' },
        20: { name: 'Building Fluency', targetText: '20 Topics' },
        30: { name: 'Confident Speaker', targetText: '30 Topics' },
        40: { name: 'Exam Mode', targetText: '40 Topics' },
        50: { name: 'Almost Ready', targetText: '50 Topics' },
        62: { name: 'Pool Complete', targetText: '62 Topics' }
      },
      tooltipCategory: 'Category:',
      tooltipStatus: 'Status:',
      tooltipLastPracticed: 'Last Practiced:',
      tooltipNotPracticed: 'Not practiced yet'
    }
  };

  let currentLang = 'vi';

  // --- DOM ELEMENT REFERENCES ---
  const elements = {};

  function cacheDOMElements() {
    elements.streakCount = document.getElementById('streak-count');
    elements.langToggle = document.getElementById('lang-toggle');
    elements.langFlag = document.getElementById('lang-flag');
    elements.langCode = document.getElementById('lang-code');
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.brandSubtitle = document.getElementById('brand-subtitle');

    // Dashboard KPIs
    elements.kpiReadyCount = document.getElementById('kpi-ready-count');
    elements.kpiLabel = document.getElementById('kpi-label');
    elements.kpiPercentage = document.getElementById('kpi-percentage');
    elements.segReady = document.getElementById('seg-ready');
    elements.segImproving = document.getElementById('seg-improving');
    elements.segTried = document.getElementById('seg-tried');
    elements.segNew = document.getElementById('seg-new');
    elements.legendLabelReady = document.getElementById('legend-label-ready');
    elements.legendLabelImproving = document.getElementById('legend-label-improving');
    elements.legendLabelTried = document.getElementById('legend-label-tried');
    elements.legendLabelNew = document.getElementById('legend-label-new');
    elements.countReady = document.getElementById('count-ready');
    elements.countImproving = document.getElementById('count-improving');
    elements.countTried = document.getElementById('count-tried');
    elements.countNew = document.getElementById('count-new');

    // Tabs & Views
    elements.navTabs = document.querySelectorAll('.nav-tab');
    elements.tabViews = document.querySelectorAll('.tab-view');
    elements.tabTitlePart2 = document.getElementById('tab-title-part2');
    elements.tabTitlePart1 = document.getElementById('tab-title-part1');
    elements.tabTitleStories = document.getElementById('tab-title-stories');
    elements.tabTitleSettings = document.getElementById('tab-title-settings');
    elements.tabBadgePart2 = document.getElementById('tab-badge-part2');
    elements.tabBadgePart1 = document.getElementById('tab-badge-part1');

    // Part 2 Matrix View
    elements.searchInput = document.getElementById('search-input');
    elements.btnRandomTopic = document.getElementById('btn-random-topic');
    elements.btnRandomTopicText = document.getElementById('btn-random-topic-text');
    elements.filterLabelStatus = document.getElementById('filter-label-status');
    elements.chipStatusAll = document.getElementById('chip-status-all');
    elements.chipStatusReady = document.getElementById('chip-status-ready');
    elements.chipStatusImproving = document.getElementById('chip-status-improving');
    elements.chipStatusTried = document.getElementById('chip-status-tried');
    elements.chipStatusNew = document.getElementById('chip-status-new');
    elements.filterLabelCategory = document.getElementById('filter-label-category');
    elements.chipCatAll = document.getElementById('chip-cat-all');
    elements.chipCatPeople = document.getElementById('chip-cat-people');
    elements.chipCatPlaces = document.getElementById('chip-cat-places');
    elements.chipCatTech = document.getElementById('chip-cat-tech');
    elements.chipCatExp = document.getElementById('chip-cat-exp');
    elements.chipCatCulture = document.getElementById('chip-cat-culture');
    elements.chipCatAmbition = document.getElementById('chip-cat-ambition');
    elements.statusChips = document.querySelectorAll('[data-filter-status]');
    elements.categoryChips = document.querySelectorAll('[data-filter-category]');
    elements.matrixTitleText = document.getElementById('matrix-title-text');
    elements.matrixHint = document.getElementById('matrix-hint');
    elements.topicMap = document.getElementById('topic-map');
    elements.nodeTooltip = document.getElementById('node-tooltip');

    // Part 1 View
    elements.searchPart1 = document.getElementById('search-part1');
    elements.filterPart1LabelStatus = document.getElementById('filter-part1-label-status');
    elements.chipP1All = document.getElementById('chip-p1-all');
    elements.chipP1Ready = document.getElementById('chip-p1-ready');
    elements.chipP1Improving = document.getElementById('chip-p1-improving');
    elements.chipP1Tried = document.getElementById('chip-p1-tried');
    elements.chipP1New = document.getElementById('chip-p1-new');
    elements.part1StatusChips = document.querySelectorAll('[data-filter-part1-status]');
    elements.part1List = document.getElementById('part1-list');

    // Stories View
    elements.storiesIntroTitle = document.getElementById('stories-intro-title');
    elements.storiesIntroDesc = document.getElementById('stories-intro-desc');
    elements.storiesGrid = document.getElementById('stories-grid');

    // Settings View
    elements.settingsExportTitle = document.getElementById('settings-export-title');
    elements.settingsExportDesc = document.getElementById('settings-export-desc');
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.btnCopyJson = document.getElementById('btn-copy-json');
    elements.settingsImportTitle = document.getElementById('settings-import-title');
    elements.settingsImportDesc = document.getElementById('settings-import-desc');
    elements.fileImportJson = document.getElementById('file-import-json');
    elements.importJsonText = document.getElementById('import-json-text');
    elements.btnImportJson = document.getElementById('btn-import-json');
    elements.importStatusMsg = document.getElementById('import-status-msg');
    elements.settingsResetTitle = document.getElementById('settings-reset-title');
    elements.settingsResetDesc = document.getElementById('settings-reset-desc');
    elements.btnResetData = document.getElementById('btn-reset-data');

    // Cue Card Modal
    elements.modalCuecard = document.getElementById('modal-cuecard');
    elements.modalTopicId = document.getElementById('modal-topic-id');
    elements.modalCategory = document.getElementById('modal-category');
    elements.modalStatusBadge = document.getElementById('modal-status-badge');
    elements.modalTitle = document.getElementById('modal-title');
    elements.modalStoryLink = document.getElementById('modal-story-link');
    elements.modalStoryLabel = document.getElementById('modal-story-label');
    elements.modalStoryName = document.getElementById('modal-story-name');
    elements.btnCloseModal = document.getElementById('btn-close-modal');
    elements.cuecardPrompt = document.getElementById('cuecard-prompt');
    elements.cuecardPoints = document.getElementById('cuecard-points');
    elements.accordionPart3 = document.getElementById('accordion-part3');
    elements.accordionPart3Toggle = document.getElementById('accordion-part3-toggle');
    elements.accordionPart3Title = document.getElementById('accordion-part3-title');
    elements.part3QuestionsList = document.getElementById('part3-questions-list');
    elements.masterySetterLabel = document.getElementById('mastery-setter-label');
    elements.btnSetNew = document.getElementById('btn-set-new');
    elements.btnSetTried = document.getElementById('btn-set-tried');
    elements.btnSetImproving = document.getElementById('btn-set-improving');
    elements.btnSetReady = document.getElementById('btn-set-ready');
    elements.btnPrevTopic = document.getElementById('btn-prev-topic');
    elements.btnNextTopic = document.getElementById('btn-next-topic');
  }

  // --- LANGUAGE MANAGEMENT ---
  function initLanguage() {
    const savedLang = localStorage.getItem('topickeeper_lang');
    currentLang = savedLang === 'en' ? 'en' : 'vi'; // Default to Vietnamese
    applyLanguage(currentLang, false);

    if (elements.langToggle) {
      elements.langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'vi' ? 'en' : 'vi';
        applyLanguage(newLang, true);
        localStorage.setItem('topickeeper_lang', newLang);
      });
    }
  }

  function applyLanguage(lang, shouldRerender = true) {
    currentLang = lang;
    const dict = I18N[lang] || I18N.vi;

    // Switcher button
    if (elements.langCode) elements.langCode.textContent = dict.langCode;
    if (elements.langFlag) elements.langFlag.textContent = dict.langFlag;
    if (elements.langToggle) {
      elements.langToggle.title = lang === 'vi' ? 'Chuyển sang Tiếng Anh (Switch to English)' : 'Switch to Vietnamese (Chuyển sang Tiếng Việt)';
    }

    // Header & Dashboard
    if (elements.brandSubtitle) elements.brandSubtitle.textContent = dict.brandSubtitle;
    if (elements.kpiLabel) elements.kpiLabel.textContent = dict.kpiLabel;
    if (elements.legendLabelReady) elements.legendLabelReady.textContent = dict.readyFull + ':';
    if (elements.legendLabelImproving) elements.legendLabelImproving.textContent = dict.improvingFull + ':';
    if (elements.legendLabelTried) elements.legendLabelTried.textContent = dict.triedFull + ':';
    if (elements.legendLabelNew) elements.legendLabelNew.textContent = dict.newFull + ':';

    // Nav Tabs
    if (elements.tabTitlePart2) elements.tabTitlePart2.textContent = dict.tabPart2;
    if (elements.tabTitlePart1) elements.tabTitlePart1.textContent = dict.tabPart1;
    if (elements.tabTitleStories) elements.tabTitleStories.textContent = dict.tabStories;
    if (elements.tabTitleSettings) elements.tabTitleSettings.textContent = dict.tabSettings;

    // Part 2 Matrix toolbar
    if (elements.searchInput) elements.searchInput.placeholder = dict.searchPlaceholderPart2;
    if (elements.btnRandomTopicText) elements.btnRandomTopicText.textContent = dict.btnRandomTopic;
    if (elements.filterLabelStatus) elements.filterLabelStatus.textContent = dict.filterStatus;
    if (elements.chipStatusAll) elements.chipStatusAll.textContent = `${dict.all} (62)`;
    if (elements.chipStatusReady) elements.chipStatusReady.textContent = dict.readyFull;
    if (elements.chipStatusImproving) elements.chipStatusImproving.textContent = dict.improvingFull;
    if (elements.chipStatusTried) elements.chipStatusTried.textContent = dict.triedFull;
    if (elements.chipStatusNew) elements.chipStatusNew.textContent = dict.newFull;

    if (elements.filterLabelCategory) elements.filterLabelCategory.textContent = dict.filterCategory;
    if (elements.chipCatAll) elements.chipCatAll.textContent = dict.allCategories;
    if (elements.chipCatPeople) elements.chipCatPeople.textContent = dict.categories.People;
    if (elements.chipCatPlaces) elements.chipCatPlaces.textContent = dict.categories.Places;
    if (elements.chipCatTech) elements.chipCatTech.textContent = dict.categories['Tech & Objects'];
    if (elements.chipCatExp) elements.chipCatExp.textContent = dict.categories.Experiences;
    if (elements.chipCatCulture) elements.chipCatCulture.textContent = dict.categories['Culture & Nature'];
    if (elements.chipCatAmbition) elements.chipCatAmbition.textContent = dict.categories.Ambition;

    if (elements.matrixTitleText) elements.matrixTitleText.textContent = dict.matrixTitle;
    if (elements.matrixHint) elements.matrixHint.textContent = dict.matrixHint;

    // Part 1 Toolbar
    if (elements.searchPart1) elements.searchPart1.placeholder = dict.searchPlaceholderPart1;
    if (elements.filterPart1LabelStatus) elements.filterPart1LabelStatus.textContent = dict.filterStatus;
    if (elements.chipP1All) elements.chipP1All.textContent = `${dict.all} (32)`;
    if (elements.chipP1Ready) elements.chipP1Ready.textContent = dict.readyFull;
    if (elements.chipP1Improving) elements.chipP1Improving.textContent = dict.improvingFull;
    if (elements.chipP1Tried) elements.chipP1Tried.textContent = dict.triedFull;
    if (elements.chipP1New) elements.chipP1New.textContent = dict.newFull;

    // Stories Tab
    if (elements.storiesIntroTitle) elements.storiesIntroTitle.textContent = dict.storyTabTitle;
    if (elements.storiesIntroDesc) elements.storiesIntroDesc.innerHTML = dict.storyTabDesc;

    // Settings Tab
    if (elements.settingsExportTitle) elements.settingsExportTitle.textContent = dict.settingsExportTitle;
    if (elements.settingsExportDesc) elements.settingsExportDesc.textContent = dict.settingsExportDesc;
    if (elements.btnExportJson) elements.btnExportJson.textContent = dict.btnDownloadJson;
    if (elements.btnCopyJson) elements.btnCopyJson.textContent = dict.btnCopyJson;

    if (elements.settingsImportTitle) elements.settingsImportTitle.textContent = dict.settingsImportTitle;
    if (elements.settingsImportDesc) elements.settingsImportDesc.textContent = dict.settingsImportDesc;
    if (elements.importJsonText) elements.importJsonText.placeholder = dict.importPlaceholder;
    if (elements.btnImportJson) elements.btnImportJson.textContent = dict.btnImportJson;

    if (elements.settingsResetTitle) elements.settingsResetTitle.textContent = dict.settingsResetTitle;
    if (elements.settingsResetDesc) elements.settingsResetDesc.textContent = dict.settingsResetDesc;
    if (elements.btnResetData) elements.btnResetData.textContent = dict.btnResetData;

    // Modal controls
    if (elements.modalStoryLabel) elements.modalStoryLabel.textContent = dict.modalStoryLabel;
    if (elements.masterySetterLabel) elements.masterySetterLabel.textContent = dict.modalUpdateStatus;
    if (elements.btnSetNew) elements.btnSetNew.textContent = dict.newFull;
    if (elements.btnSetTried) elements.btnSetTried.textContent = dict.triedFull;
    if (elements.btnSetImproving) elements.btnSetImproving.textContent = dict.improvingFull;
    if (elements.btnSetReady) elements.btnSetReady.textContent = dict.readyFull;
    if (elements.btnPrevTopic) elements.btnPrevTopic.textContent = dict.btnPrevTopic;
    if (elements.btnNextTopic) elements.btnNextTopic.textContent = dict.btnNextTopic;

    if (shouldRerender) {
      renderDashboard();
      renderTopicMap();
      renderStoryMultipliers();
      renderPart1List();

      if (elements.modalCuecard && elements.modalCuecard.classList.contains('active')) {
        openPart2Modal(currentModalTopicId);
      }
    }
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
    const dict = I18N[currentLang] || I18N.vi;

    // Streak
    if (elements.streakCount) {
      elements.streakCount.textContent = dict.streak.replace('{n}', streak.count);
    }

    // KPIs
    if (elements.kpiReadyCount) elements.kpiReadyCount.textContent = stats.readyCount;
    if (elements.kpiPercentage) elements.kpiPercentage.textContent = `${stats.readinessPercentage}%`;

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
      node.setAttribute('aria-label', `Topic #${topic.id}: ${topic.title} (${getStatusLabel(topic.status || 'new')})`);

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
      const topic = state ? state.getPart2Topic(id) : null;

      let matchStatus = (currentFilterStatus === 'all' || status === currentFilterStatus);
      let matchCategory = (currentFilterCategory === 'all' || category === currentFilterCategory);

      let matchSearch = true;
      if (query && topic) {
        // Match topic id (e.g. #4, 4)
        const idMatches = query === String(id) || query === `#${id}`;
        const titleMatches = topic && topic.title && topic.title.toLowerCase().includes(query);
        const promptMatches = topic && topic.cueCard && topic.cueCard.prompt && topic.cueCard.prompt.toLowerCase().includes(query);
        const pointsMatch = topic && topic.cueCard && topic.cueCard.points && topic.cueCard.points.some(p => p.toLowerCase().includes(query));
        const storyMatch = topic.storyCluster && topic.storyCluster.toLowerCase().includes(query);

        matchSearch = idMatches || titleMatches || promptMatches || pointsMatch || storyMatch;
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

    const dict = I18N[currentLang] || I18N.vi;
    const statusLabel = getStatusLabel(topic.status || 'new');
    const lastPracticedHtml = topic.lastPracticed 
      ? `<br><span style="color: var(--text-muted); font-size: 0.75rem;">${dict.tooltipLastPracticed} ${escapeHtml(topic.lastPracticed.slice(0, 10))}</span>` 
      : '';

    elements.nodeTooltip.innerHTML = `
      <strong>#${topic.id} · ${escapeHtml(topic.title)}</strong><br>
      <span style="color: var(--text-muted); font-size: 0.8rem;">${dict.tooltipCategory} ${escapeHtml(getCategoryLabel(topic.category))}</span><br>
      <span style="font-size: 0.85rem;">${dict.tooltipStatus} <strong>${statusLabel}</strong></span>${lastPracticedHtml}
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
    const dict = I18N[currentLang] || I18N.vi;

    // Header info
    if (elements.modalTopicId) elements.modalTopicId.textContent = `#${topic.id}`;
    if (elements.modalCategory) elements.modalCategory.textContent = getCategoryLabel(topic.category);
    if (elements.modalTitle) elements.modalTitle.textContent = topic.title;

    // Status badge
    if (elements.modalStatusBadge) {
      elements.modalStatusBadge.className = `modal-status-badge status-${topic.status || 'new'}`;
      elements.modalStatusBadge.textContent = `${getStatusEmoji(topic.status)} ${getStatusLabel(topic.status || 'new')}`;
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

    // "You should say:" Bullet Points (Always in English)
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

    // Part 3 Accordion Questions (Questions in English, title in active language)
    if (elements.part3QuestionsList) {
      elements.part3QuestionsList.innerHTML = '';
      const p3Questions = Array.isArray(topic.part3Questions) ? topic.part3Questions : [];
      if (elements.accordionPart3Title) {
        elements.accordionPart3Title.textContent = dict.modalPart3Title.replace('{n}', p3Questions.length);
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
        elements.modalStatusBadge.textContent = `${getStatusEmoji(updated.status)} ${getStatusLabel(updated.status)}`;
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
    const dict = I18N[currentLang] || I18N.vi;

    stories.forEach(story => {
      const card = document.createElement('div');
      card.className = 'story-card';

      const sTitle = (currentLang === 'vi' && story.title_vi) ? story.title_vi : (story.title_en || story.title);
      const sDesc = (currentLang === 'vi' && story.description_vi) ? story.description_vi : (story.description_en || story.description);
      const sNarrative = (currentLang === 'vi' && story.narrative_vi) ? story.narrative_vi : (story.narrative_en || story.narrative);

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
            <h3 class="story-title">${escapeHtml(sTitle)}</h3>
            <p class="story-summary">${escapeHtml(sDesc)}</p>
          </div>
        </div>

        <div class="story-narrative-box">
          ${escapeHtml(sNarrative)}
        </div>

        <div>
          <div class="story-topics-title">${dict.storyCovers.replace('{n}', story.topicIds ? story.topicIds.length : 0)}</div>
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
    const dict = I18N[currentLang] || I18N.vi;

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
            ${getStatusEmoji(topic.status)} ${getStatusLabel(topic.status || 'new')}
          </span>
        </div>

        <div class="part1-questions-box">
          <ol class="part1-q-list">
            ${qListHtml}
          </ol>
        </div>

        <div class="part1-actions">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">${dict.filterStatus}</span>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn-mastery btn-set-new ${topic.status === 'new' ? 'active' : ''}" data-status="new">${dict.newFull}</button>
            <button class="btn-mastery btn-set-tried ${topic.status === 'tried' ? 'active' : ''}" data-status="tried">${dict.triedFull}</button>
            <button class="btn-mastery btn-set-improving ${topic.status === 'improving' ? 'active' : ''}" data-status="improving">${dict.improvingFull}</button>
            <button class="btn-mastery btn-set-ready ${topic.status === 'ready' ? 'active' : ''}" data-status="ready">${dict.readyFull}</button>
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
    const dict = I18N[currentLang] || I18N.vi;
    navigator.clipboard.writeText(json).then(() => {
      if (elements.btnCopyJson) {
        const originalText = elements.btnCopyJson.textContent;
        elements.btnCopyJson.textContent = dict.copied;
        setTimeout(() => {
          elements.btnCopyJson.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      alert(dict.copyFailed);
    });
  }

  function importBackupJSON() {
    if (!state) return;
    const text = elements.importJsonText ? elements.importJsonText.value.trim() : '';
    const dict = I18N[currentLang] || I18N.vi;

    if (!text) {
      if (elements.importStatusMsg) {
        elements.importStatusMsg.textContent = dict.importEmpty;
        elements.importStatusMsg.style.color = '#ef4444';
      }
      return;
    }

    try {
      state.importJSON(text);
      if (elements.importStatusMsg) {
        elements.importStatusMsg.textContent = dict.importSuccess;
        elements.importStatusMsg.style.color = '#10b981';
      }
      if (elements.importJsonText) elements.importJsonText.value = '';
    } catch (err) {
      if (elements.importStatusMsg) {
        elements.importStatusMsg.textContent = `${dict.importError}${err.message}`;
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
    const dict = I18N[currentLang] || I18N.vi;
    const confirmed = confirm(dict.resetConfirm);
    if (confirmed) {
      state.resetToDefaults();
      alert(dict.resetSuccess);
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

  function getStatusLabel(status) {
    const dict = I18N[currentLang] || I18N.vi;
    switch (status) {
      case 'ready': return dict.ready;
      case 'improving': return dict.improving;
      case 'tried': return dict.tried;
      default: return dict.new;
    }
  }

  function getCategoryLabel(category) {
    const dict = I18N[currentLang] || I18N.vi;
    if (dict.categories && dict.categories[category]) {
      return dict.categories[category];
    }
    return category || (currentLang === 'vi' ? 'Chung' : 'General');
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
    initLanguage();
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
