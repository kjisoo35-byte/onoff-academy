(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('.manual-section[id]')];
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sidebar = document.querySelector('.sidebar');
  const menuButton = document.querySelector('.menu-toggle');
  const backdrop = document.querySelector('.drawer-backdrop');
  const searchPanel = document.querySelector('#search-panel');
  const searchInput = document.querySelector('#academy-search');
  const searchResults = document.querySelector('.search-results');
  const searchTrigger = document.querySelector('.search-trigger');
  const heroSearch = document.querySelector('.hero-search');
  const heroSearchInput = document.querySelector('#hero-search-input');
  const knowledgeSections = [...document.querySelectorAll('#home, #library, #safety-book, #continue-reading, #my-academy')];
  const learningScenes = [...document.querySelectorAll('.learning-scene[id]')];
  const sceneLinks = [...document.querySelectorAll('.scene-map a[href^="#"]')];
  const chapterIndex = chapters.map((chapter) => ({ id: chapter.id, title: chapter.querySelector('h1,h2')?.textContent.trim() || chapter.id, description: chapter.querySelector('.lead,.section-heading>p')?.textContent.trim() || '' }));
  const breadcrumb = document.querySelector('.breadcrumb');
  const homeSection = document.querySelector('#home');
  const modeName = document.querySelector('[data-selected-learning-mode]');
  const modeDescription = document.querySelector('[data-selected-mode-description]');
  const globalPager = document.querySelector('.document > .chapter-pager');
  document.querySelectorAll('.academy-hero,.home-discovery,.library-section,.book-overview,.learning-mode-section,.book-complete-view,.book-platform-link,.my-academy-card').forEach((element) => element.remove());
  const bookChapterForm = [
    { id: 'philosophy', book: 'platform', part: '01', partTitle: 'Platform', chapter: '01', title: 'Platform Philosophy', next: 'workflow' },
    { id: 'workflow', book: 'platform', chapter: '02', title: 'Workflow', previous: 'philosophy', next: 'daily-work' },
    { id: 'daily-work', book: 'platform', part: '02', partTitle: 'Daily Safety', chapter: '03', title: "Today's Work", previous: 'workflow', next: 'electronic-documents' },
    { id: 'electronic-documents', book: 'platform', chapter: '04', title: 'Electronic Documents', previous: 'daily-work', next: 'safety-report' },
    { id: 'safety-report', book: 'platform', part: '03', partTitle: 'Safety Operation', chapter: '05', title: 'Safety Report', previous: 'electronic-documents' },
    { id: 'tbm-purpose', book: 'tbm', chapter: '01', title: 'TBM이란 무엇인가?' },
    { id: 'tbm-nine-steps', book: 'tbm', chapter: '02', title: 'TBM 진행 9단계' },
    { id: 'tbm-scenario', book: 'tbm', chapter: '03', title: 'TBM 진행 시나리오' },
    { id: 'tbm-life-rules', book: 'tbm', chapter: '04', title: '생명안전수칙 10' }
  ];
  bookChapterForm.forEach((item) => {
    const chapter = document.getElementById(item.id);
    if (!chapter) return;
    chapter.classList.add('book-chapter-reading');
    chapter.dataset.chapter = item.chapter;
    const sourceHeading = chapter.querySelector('.section-heading, .chapter-header');
    const description = sourceHeading?.querySelector('p:last-child')?.textContent.trim() || 'Chapter의 핵심 Workflow를 학습합니다.';
    const start = document.createElement('header');
    start.className = 'book-chapter-start';
    start.innerHTML = `<p>CHAPTER ${item.chapter}</p><h1>${item.title}</h1><span>${description}</span>`;
    chapter.insertAdjacentElement('afterbegin', start);
  });
  const chapterSectionHeadings = [
    ['#philosophy .prose', 'WHY'],
    ['#philosophy .callout', 'TIP'],
    ['#workflow #scene-why', 'WHY'],
    ['#workflow #scene-case', 'CASE'],
    ['#workflow #scene-workflow .chapter-block:nth-of-type(1)', 'WORKFLOW'],
    ['#workflow #scene-workflow .chapter-block:nth-of-type(2)', 'WORKFLOW'],
    ['#workflow .chapter-block[aria-labelledby="principle-title"]', 'TIP'],
    ['#workflow #scene-tip', 'TIP'],
    ['#daily-work .step-list', 'WORKFLOW'],
    ['#daily-work .callout', 'TIP'],
    ['#electronic-documents .role-table', 'WORKFLOW'],
    ['#electronic-documents .callout', 'TIP'],
    ['#safety-report .event-grid', 'CASE'],
    ['#safety-report .callout', 'TIP'],
    ['#tbm-purpose .prose', 'WHY'],
    ['#tbm-purpose .callout', 'TIP'],
    ['#tbm-nine-steps .tbm-nine-step-flow', 'WORKFLOW'],
    ['#tbm-nine-steps .callout', 'NOTE'],
    ['#tbm-scenario .step-list', 'CASE'],
    ['#tbm-scenario .callout', 'TIP'],
    ['#tbm-life-rules .step-list', 'ACTION'],
    ['#tbm-life-rules .callout', 'WARNING']
  ];
  chapterSectionHeadings.forEach(([selector, label]) => {
    const block = document.querySelector(selector);
    if (!block) return;
    block.querySelector(':scope > .chapter-section-title')?.remove();
    block.insertAdjacentHTML('afterbegin', `<h2 class="chapter-section-title">${label}</h2>`);
  });
  document.querySelectorAll('[id^="tbm-"] .callout > strong').forEach((label) => label.remove());
  document.querySelectorAll('#workflow .scene-number').forEach((label) => label.remove());
  document.querySelector('#workflow #scene-tip > strong')?.remove();
  const workflowPrimaryBlock = document.querySelector('#workflow #scene-workflow .chapter-block:first-of-type');
  if (workflowPrimaryBlock) {
    const heading = workflowPrimaryBlock.querySelector('.chapter-block-heading');
    if (heading) heading.innerHTML = '<div><h3>ONOFF Workflow</h3><p>작업 준비부터 작업 시작까지 하나의 흐름으로 확인합니다.</p></div>';
    const workflowList = workflowPrimaryBlock.querySelector('.standard-workflow');
    if (workflowList) workflowList.innerHTML = [
      ['01', '작업 정의', '작업 범위와 기준을 정합니다.'],
      ['02', '안전 승인', '필수 안전조건과 문서를 검토합니다.'],
      ['03', 'ACTIVE', '수행 가능한 작업으로 전환합니다.'],
      ['04', '작업 제공', 'Worker에게 배정된 작업을 제공합니다.'],
      ['05', '오늘 작업', '배정된 ACTIVE 작업을 확인합니다.'],
      ['06', '전자문서', '필수 안전문서를 확인합니다.'],
      ['07', '전자서명', '확인 완료를 기록합니다.'],
      ['08', 'Safety Start', '작업 전 안전사항을 최종 확인합니다.'],
      ['09', '작업 시작', '승인된 범위에서 작업을 시작합니다.']
    ].map(([index, title, body]) => `<li><span class="flow-index">${index}</span><strong>${title}</strong><small>${body}</small></li>`).join('');
  }
  document.querySelector('#workflow #scene-workflow .chapter-block:nth-of-type(2)')?.remove();
  document.querySelector('#workflow .chapter-block[aria-labelledby="principle-title"]')?.remove();
  const lessonCatalog = [
    { chapter: 'philosophy', key: 'why', title: 'WHY', selector: '.prose' },
    { chapter: 'workflow', key: 'why', title: 'WHY', selector: '#scene-why' },
    { chapter: 'workflow', key: 'case', title: 'CASE', selector: '#scene-case' },
    { chapter: 'workflow', key: 'workflow', title: 'WORKFLOW', selector: '#scene-workflow .chapter-block:first-of-type' },
    { chapter: 'daily-work', key: 'workflow', title: 'WORKFLOW', selector: '.step-list' },
    { chapter: 'electronic-documents', key: 'workflow', title: 'WORKFLOW', selector: '.role-table' },
    { chapter: 'safety-report', key: 'case', title: 'CASE', selector: '.event-grid' },
    { chapter: 'tbm-purpose', book: 'tbm', key: 'why', title: 'WHY', selector: '.prose' },
    { chapter: 'tbm-nine-steps', book: 'tbm', key: 'workflow', title: 'WORKFLOW', selector: '.tbm-nine-step-flow' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'case', title: 'CASE', selector: '.step-list' },
    { chapter: 'tbm-life-rules', book: 'tbm', key: 'action', title: 'ACTION', selector: '.step-list' }
  ].map((lesson) => ({ ...lesson, book: lesson.book || 'platform', route: `${lesson.chapter}-${lesson.key}` }));
  const lessonsByChapter = lessonCatalog.reduce((groups, lesson) => {
    const group = groups.get(lesson.chapter) || [];
    group.push(lesson);
    groups.set(lesson.chapter, group);
    return groups;
  }, new Map());
  lessonCatalog.forEach((lesson) => {
    const chapter = document.getElementById(lesson.chapter);
    const block = chapter?.querySelector(lesson.selector);
    if (!chapter || !block) return;
    block.classList.add('academy-lesson');
    block.dataset.lesson = lesson.key;
    if (!chapter.querySelector('.chapter-reading-nav')) chapter.insertAdjacentHTML('beforeend', '<nav class="chapter-reading-nav" aria-label="Lesson 이동"></nav>');
  });
  [
    ['philosophy', 'why', '.callout'],
    ['workflow', 'workflow', '#scene-tip'],
    ['daily-work', 'workflow', '.callout'],
    ['electronic-documents', 'workflow', '.callout'],
    ['safety-report', 'case', '.callout'],
    ['tbm-purpose', 'why', '.callout'],
    ['tbm-nine-steps', 'workflow', '.callout'],
    ['tbm-scenario', 'case', '.callout'],
    ['tbm-life-rules', 'action', '.callout']
  ].forEach(([chapterId, lessonKey, selector]) => {
    const block = document.querySelector(`#${chapterId} ${selector}`);
    if (!block) return;
    block.classList.add('academy-lesson');
    block.dataset.lesson = lessonKey;
  });
  bookChapterForm.forEach((item) => {
    const chapter = document.getElementById(item.id);
    chapter?.querySelector('.chapter-reading-nav')?.insertAdjacentHTML('beforebegin', '<p class="chapter-complete-label" hidden>Chapter Complete</p>');
  });
  document.querySelectorAll('.book-chapters a[href^="#"]').forEach((link) => {
    const chapterId = link.hash.slice(1);
    const firstLesson = lessonsByChapter.get(chapterId)?.[0];
    if (firstLesson) link.hash = firstLesson.route;
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const resetViewScroll = () => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
    window.setTimeout(() => window.scrollTo(0, 0), 120);
  };
  let selectedLearningMode = sessionStorage.getItem('academy-learning-mode') || 'book';

  const applyLearningMode = (mode) => {
    selectedLearningMode = mode === 'action' ? 'action' : 'book';
    sessionStorage.setItem('academy-learning-mode', selectedLearningMode);
    if (modeName) modeName.textContent = selectedLearningMode === 'action' ? 'Action Mode' : 'Book Mode';
    if (modeDescription) modeDescription.textContent = selectedLearningMode === 'action' ? '한 Scene · 한 Action · Platform Help' : '스크롤 기반 Documentation';
    document.body.dataset.learningMode = selectedLearningMode;
  };

  const renderAcademyFlow = () => {
    const route = location.hash.slice(1) || 'home';
    document.body.dataset.academyView = route;
    resetViewScroll();
    const selectedLesson = lessonCatalog.find((lesson) => lesson.route === route)
      || lessonsByChapter.get(route)?.[0]
      || null;
    document.body.classList.toggle('is-lesson-view', Boolean(selectedLesson));
    document.body.classList.toggle('is-toc-view', route.endsWith('-book-toc'));
    document.body.dataset.lessonType = selectedLesson?.title.toLowerCase() || '';
    const chapterRoute = selectedLesson?.chapter || (route === 'workflow-action' || route.startsWith('scene-') ? 'workflow' : route);
    const homeRoutes = new Set(['home', 'library', 'safety-book', 'safety-book-mode', 'safety-book-toc', 'safety-book-complete', 'tbm-book-toc', 'continue-reading', 'my-academy']);
    const isHomeRoute = homeRoutes.has(route);
    if (route === 'workflow-action') applyLearningMode('action');
    const actionPresentation = selectedLearningMode === 'action' && (route === 'workflow-action' || route.startsWith('scene-'));
    document.body.dataset.presentation = actionPresentation ? 'action' : 'book';
    if (chapterRoute === 'workflow') {
      const activeScene = route.startsWith('scene-') ? route : 'scene-why';
      learningScenes.forEach((scene) => scene.toggleAttribute('hidden', actionPresentation && scene.id !== activeScene));
    }
    if (globalPager) globalPager.hidden = true;
    chapters.forEach((chapter) => { chapter.hidden = isHomeRoute ? chapter.id !== 'home' : chapter.id !== chapterRoute; });
    document.querySelectorAll('.academy-lesson').forEach((lesson) => {
      lesson.hidden = Boolean(selectedLesson) && (lesson.closest('.manual-section')?.id !== selectedLesson.chapter || lesson.dataset.lesson !== selectedLesson.key);
    });
    if (selectedLesson) {
      const handbookLessons = lessonCatalog.filter((lesson) => lesson.book === selectedLesson.book);
      const lessonIndex = handbookLessons.indexOf(selectedLesson);
      const previous = handbookLessons[lessonIndex - 1];
      const next = handbookLessons[lessonIndex + 1];
      const previousItem = previous ? `<a href="#${previous.route}">← 이전 Lesson</a>` : '<span aria-disabled="true">← 이전 Lesson</span>';
      const isLastLesson = handbookLessons.at(-1) === selectedLesson;
      const nextItem = isLastLesson
        ? '<span class="handbook-complete" aria-current="step">Handbook Complete</span>'
        : `<a href="#${next.route}">다음 Lesson →</a>`;
      const lessonNavigation = document.querySelector(`#${selectedLesson.chapter} .chapter-reading-nav`);
      const tocTarget = selectedLesson.book === 'tbm' ? 'tbm-book-toc' : 'safety-book-toc';
      if (lessonNavigation) lessonNavigation.innerHTML = `${previousItem}<a href="#${tocTarget}">목차</a>${nextItem}`;
      const chapterLessons = lessonsByChapter.get(selectedLesson.chapter) || [];
      const completeLabel = document.querySelector(`#${selectedLesson.chapter} .chapter-complete-label`);
      if (completeLabel) {
        completeLabel.hidden = chapterLessons.at(-1) !== selectedLesson;
        completeLabel.textContent = isLastLesson ? '' : 'Chapter Complete';
        completeLabel.hidden = isLastLesson || chapterLessons.at(-1) !== selectedLesson;
      }
    }
    if (!homeSection || !isHomeRoute) {
      resetViewScroll();
      return;
    }
    const visiblePart = route === 'library' ? 'library'
      : ['safety-book', 'safety-book-mode', 'safety-book-toc', 'safety-book-complete'].includes(route) ? 'safety-book'
      : route === 'tbm-book-toc' ? 'tbm-book'
      : route === 'my-academy' ? 'my-academy'
      : 'home';
    [...homeSection.children].forEach((child) => {
      if (child.matches('.academy-flow-home')) child.hidden = route !== 'home';
      else if (child.matches('.academy-hero,.home-discovery')) child.hidden = true;
      else if (child.matches('.library-section')) child.hidden = visiblePart !== 'library';
      else if (child.matches('.book-home')) child.hidden = child.id !== visiblePart;
      else if (child.matches('.my-academy-card')) child.hidden = visiblePart !== 'my-academy';
      else if (child.matches('.academy-home-footer')) child.hidden = route !== 'home';
    });
    const book = document.querySelector(`#${visiblePart}`);
    if (book?.classList.contains('book-home')) {
      const bookView = route === 'safety-book';
      const modeView = route === 'safety-book-mode';
      const tocView = route.endsWith('-book-toc');
      book.querySelector('.book-overview')?.toggleAttribute('hidden', !bookView);
      book.querySelector('.learning-mode-section')?.toggleAttribute('hidden', !modeView);
      book.querySelector('.toc-flow-header')?.toggleAttribute('hidden', !tocView);
      book.querySelector('.book-chapters')?.toggleAttribute('hidden', !tocView);
      book.querySelector('.book-platform-link')?.toggleAttribute('hidden', true);
    }
  };

  document.querySelectorAll('[data-learning-mode-choice]').forEach((link) => link.addEventListener('click', () => applyLearningMode(link.dataset.learningModeChoice)));
  window.addEventListener('hashchange', renderAcademyFlow);
  window.addEventListener('pageshow', resetViewScroll);
  applyLearningMode(selectedLearningMode);
  renderAcademyFlow();
  const chapterGroups = {
    home: '시작하기', philosophy: '시작하기', workflow: '업무 Workflow', project: '업무 Workflow', 'daily-work': '업무 Workflow',
    'electronic-documents': '업무 Workflow', 'safety-start': '업무 Workflow', 'safety-report': '업무 Workflow', dashboard: '운영 관리',
    administration: '운영 관리', 'user-management': '운영 관리', settings: '운영 관리', faq: '지원', 'release-notes': '지원'
  };
  const updateBreadcrumb = (id, title) => {
    if (!breadcrumb) return;
    if (id === 'home') {
      breadcrumb.innerHTML = '<span aria-current="page">홈</span>';
      return;
    }
    breadcrumb.innerHTML = `<a href="#home">홈</a><span aria-hidden="true">›</span><span>${chapterGroups[id] || 'Academy'}</span><span aria-hidden="true">›</span><span aria-current="page">${title}</span>`;
  };
  const closeDrawer = () => { sidebar?.classList.remove('is-open'); menuButton?.setAttribute('aria-expanded', 'false'); if (backdrop) backdrop.hidden = true; };
  menuButton?.addEventListener('click', () => { const open = !sidebar?.classList.contains('is-open'); sidebar?.classList.toggle('is-open', open); menuButton.setAttribute('aria-expanded', String(open)); if (backdrop) backdrop.hidden = !open; });
  backdrop?.addEventListener('click', closeDrawer);
  links.forEach((link) => link.addEventListener('click', closeDrawer));
  const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (!visible) return; links.forEach((link) => { const active = link.hash === `#${visible.target.id}`; link.classList.toggle('is-current', active); active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current'); }); const chapter = chapterIndex.find((item) => item.id === visible.target.id); const label = document.querySelector('[data-current-chapter]'); if (label) label.textContent = chapter?.title || 'Academy'; updateBreadcrumb(visible.target.id, chapter?.title || 'Academy'); }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, .2, .5] });
  chapters.forEach((chapter) => observer.observe(chapter));
  if (sidebar) { sidebar.scrollTop = Number(sessionStorage.getItem('academy-navigation-scroll') || 0); sidebar.addEventListener('scroll', () => sessionStorage.setItem('academy-navigation-scroll', String(sidebar.scrollTop)), { passive: true }); }
  document.querySelectorAll('.nav-group').forEach((group, index) => { const key = `academy-nav-group-${index}`; const saved = sessionStorage.getItem(key); if (saved !== null) group.open = saved === 'true'; group.addEventListener('toggle', () => sessionStorage.setItem(key, String(group.open))); });
  const setSearchOpen = (open) => { if (!searchPanel) return; searchPanel.hidden = !open; searchTrigger?.setAttribute('aria-expanded', String(open)); if (open) searchInput?.focus(); };
  searchTrigger?.addEventListener('click', () => setSearchOpen(true));
  document.querySelector('[data-navigation-search]')?.addEventListener('click', () => { closeDrawer(); setSearchOpen(true); });
  document.querySelector('.search-close')?.addEventListener('click', () => setSearchOpen(false));
  searchPanel?.addEventListener('click', (event) => { if (event.target === searchPanel) setSearchOpen(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setSearchOpen(false); closeDrawer(); } });
  const renderResults = (query) => { if (!searchResults) return; const value = query.trim().toLocaleLowerCase('ko'); const results = value ? chapterIndex.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('ko').includes(value)) : []; searchResults.innerHTML = !value ? '<p>검색어를 입력하면 관련 Chapter가 표시됩니다.</p>' : results.length ? results.map((item) => `<a href="#${item.id}"><strong>${item.title}</strong><span>${item.description}</span></a>`).join('') : '<p>일치하는 문서를 찾지 못했습니다.</p>'; };
  const runHeroSearch = () => {
    if (!searchInput || !heroSearchInput) return;
    searchInput.value = heroSearchInput.value;
    renderResults(searchInput.value);
    setSearchOpen(true);
  };
  heroSearch?.addEventListener('submit', (event) => { event.preventDefault(); runHeroSearch(); });
  document.querySelector('[data-hero-search-submit]')?.addEventListener('click', runHeroSearch);
  heroSearchInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); runHeroSearch(); } });
  searchInput?.addEventListener('input', (event) => renderResults(event.target.value));
  document.querySelectorAll('.recent-searches button').forEach((button) => button.addEventListener('click', () => { if (searchInput) { searchInput.value = button.textContent.trim(); renderResults(searchInput.value); searchInput.focus(); } }));
  searchResults?.addEventListener('click', () => setSearchOpen(false));
  document.querySelector('.print-button')?.addEventListener('click', () => window.print());

  knowledgeSections.forEach((section) => {
    section.addEventListener('focusin', () => {
      const activeLink = links.find((link) => link.hash === `#${section.id}`);
      if (!activeLink) return;
      links.forEach((link) => { link.classList.toggle('is-current', link === activeLink); link === activeLink ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current'); });
    });
  });

  if (learningScenes.length && sceneLinks.length) {
    const sceneObserver = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      sceneLinks.forEach((link) => link.classList.toggle('is-current', link.hash === `#${current.target.id}`));
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .25, .55] });
    learningScenes.forEach((scene) => sceneObserver.observe(scene));
  }

  const learningProfiles = {
    philosophy: { time: '3분', level: '입문', audience: '전체 사용자', platform: 'Platform', next: [['Workflow 개요', 'workflow'], ['오늘 작업', 'daily-work']] },
    workflow: { time: '5분', level: '입문', audience: 'Worker · Supervisor', platform: 'Daily Safety', next: [['오늘 작업', 'daily-work'], ['프로젝트', 'project']] },
    project: { time: '4분', level: '기본', audience: 'Supervisor', platform: 'Project & Work', next: [['오늘 작업', 'daily-work'], ['전자문서', 'electronic-documents']] },
    'daily-work': { time: '4분', level: '기본', audience: 'Worker', platform: 'Today\'s Work', next: [['전자문서', 'electronic-documents'], ['Safety Start', 'safety-start']] },
    'safety-start': { time: '4분', level: '기본', audience: 'Worker', platform: 'Daily Safety', next: [['전자문서', 'electronic-documents'], ['Safety Report', 'safety-report']] },
    'electronic-documents': { time: '5분', level: '기본', audience: 'Worker · Supervisor', platform: 'Electronic Documents', next: [['오늘 작업', 'daily-work'], ['Safety Start', 'safety-start']] },
    'safety-report': { time: '3분', level: '기본', audience: 'Worker · Supervisor', platform: 'Safety Report', next: [['Dashboard', 'dashboard'], ['FAQ', 'faq']] },
    dashboard: { time: '4분', level: '운영', audience: 'Supervisor', platform: 'Daily Safety', next: [['Safety Report', 'safety-report'], ['Administration', 'administration']] },
    administration: { time: '4분', level: '운영', audience: 'Administrator', platform: 'System Mode', next: [['사용자 관리', 'user-management'], ['설정', 'settings']] },
    'user-management': { time: '3분', level: '운영', audience: 'Administrator', platform: 'System Mode', next: [['설정', 'settings'], ['FAQ', 'faq']] },
    settings: { time: '3분', level: '운영', audience: 'Administrator', platform: 'System Mode', next: [['사용자 관리', 'user-management'], ['FAQ', 'faq']] }
  };
  Object.entries({}).forEach(([id, profile]) => {
    const chapter = document.getElementById(id);
    const heading = chapter?.querySelector('.chapter-header, .section-heading');
    if (!chapter || !heading) return;
    const meta = document.createElement('dl');
    meta.className = 'learning-meta';
    meta.setAttribute('aria-label', '학습 정보');
    meta.innerHTML = `<div><dt>예상 학습시간</dt><dd>${profile.time}</dd></div><div><dt>난이도</dt><dd>${profile.level}</dd></div><div><dt>대상</dt><dd>${profile.audience}</dd></div><div><dt>관련 업무</dt><dd>${profile.platform}</dd></div><div><dt>관련 Book</dt><dd>${profile.book || 'Safety Handbook'}</dd></div><div><dt>관련 Workflow</dt><dd>${profile.workflow || profile.platform}</dd></div>`;
    heading.insertAdjacentElement('afterend', meta);
    if (!chapter.querySelector('.learning-next')) {
      const next = document.createElement('nav');
      next.className = 'learning-next';
      next.setAttribute('aria-label', '추천 학습');
      next.innerHTML = `<div><span>CONTINUE LEARNING</span><strong>다음 학습으로 이어가기</strong><p>현재 Chapter와 연결되는 Workflow를 계속 확인하세요.</p></div>${profile.next.map(([label, target]) => `<a href="#${target}">${label}<span>→</span></a>`).join('')}`;
      chapter.append(next);
    }
  });
})();
