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
  Object.entries(learningProfiles).forEach(([id, profile]) => {
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
