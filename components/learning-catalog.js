/* Catalog v2: presentation metadata is separate from the existing LMS registry. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AcademyLearningCatalog = api;
})(globalThis, function () {
  'use strict';
  const categories = Object.freeze([
    { id: 'electrical', label: '전기·제어' },
    { id: 'safety', label: '안전·현장 실무' },
    { id: 'equipment', label: '설비 운용·정비' }
  ]);
  const metadata = Object.freeze({
    platform: { category: 'safety', title: 'ONOFF Safety Platform 이해', description: '플랫폼의 설계 사상과 핵심 Workflow를 익힙니다.' },
    risk: { category: 'safety', description: '유해·위험요인을 찾고 감소대책을 수립합니다.' },
    practical: { category: 'safety', description: '업종별 예시로 위험성평가 서식을 작성합니다.' },
    sop: { category: 'equipment', description: '위험 공정의 안전 수칙과 이행 기록을 배웁니다.' },
    tbm: { category: 'safety', description: '작업 전 10분, 현장의 위험을 함께 공유합니다.' },
    special: { category: 'safety', description: '로봇·전기·유해물질·중량물 작업 안전을 배웁니다.' }
  });
  const examples = Object.freeze([Object.freeze({
    key: 'example-sensors', replacedBy: 'sensor-npn', registered: false, category: 'electrical',
    title: '센서 기초와 현장 데이터 읽기',
    description: '센서의 동작 원리부터 신호 확인까지, 현장 데이터의 기초를 배웁니다.',
    lessonIds: [], chapters: []
  })]);
  function catalog(courses, sampleCourses = examples) {
    return [...courses.map(course => ({
      ...course, ...metadata[course.id], key: course.id, registered: true,
      category: metadata[course.id]?.category || course.category || 'safety',
      lessonIds: course.lessonIds || course.chapters.map(chapter => chapter[0])
    })), ...sampleCourses.filter(example => !courses.some(course => course.id === example.replacedBy))];
  }
  function courseStatusLabel(state, officiallyCompleted) {
    if (officiallyCompleted === true) return '공식 이수 완료';
    if (state === 'COMPLETED') return officiallyCompleted === false ? '학습 완료 · 이수 대기' : '학습 완료';
    return state === 'IN_PROGRESS' ? '학습 중' : '미시작';
  }
  function courseState(course, record, ready) {
    if (!course.registered) return { known: false, example: true, label: '신규 예시', target: null, percent: null };
    const stored = ready && record?.courses?.[course.id];
    if (!stored || !Number.isFinite(stored.progressPercent) || !stored.lessons) {
      return { known: false, label: '상태 확인 필요', target: course.route, percent: null };
    }
    const lessonIds = course.lessonIds.filter(id => Object.hasOwn(stored.lessons, id));
    const completed = lessonIds.filter(id => stored.lessons[id].state === 'COMPLETED').length;
    const last = lessonIds.includes(stored.lastLessonId) ? stored.lastLessonId : null;
    const target = last || lessonIds.find(id => stored.lessons[id].state !== 'COMPLETED') || lessonIds[0] || course.route;
    const official = stored.officiallyCompleted === true;
    const started = ['IN_PROGRESS', 'COMPLETED'].includes(stored.state);
    return {
      known: true, percent: Math.min(100, Math.max(0, stored.progressPercent)),
      state: stored.state, official, completed, total: lessonIds.length,
      label: courseStatusLabel(stored.state, stored.officiallyCompleted),
      started, target, lastActivityAt: stored.lastActivityAt || null,
      // The current server has no course-assignment field. Practice.required is NOT a course assignment.
      required: null
    };
  }
  const normalize = text => String(text || '').normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/\s+/g, ' ').trim();
  function filter(courses, states, { category = 'all', query = '', requiredOnly = false, mineOnly = false, sort = 'recommended' } = {}) {
    const words = normalize(query).split(' ').filter(Boolean);
    const matches = courses.filter(course => {
      if (category !== 'all' && course.category !== category) return false;
      if (requiredOnly && states[course.key]?.required !== true) return false;
      if (mineOnly && !states[course.key]?.started) return false;
      const text = normalize([course.title, course.description, course.id, categories.find(c => c.id === course.category)?.label, ...(course.chapters || []).flatMap(chapter => chapter.slice(1))].join(' '));
      return words.every(word => text.includes(word));
    });
    if (sort === 'title') matches.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    if (sort === 'recent') matches.sort((a, b) => String(states[b.key]?.lastActivityAt || '').localeCompare(String(states[a.key]?.lastActivityAt || '')));
    return matches;
  }
  function continuation(courses, states) {
    return courses.filter(course => course.registered && states[course.key]?.known && states[course.key]?.started && !states[course.key]?.official)
      .sort((a, b) => String(states[b.key].lastActivityAt || '').localeCompare(String(states[a.key].lastActivityAt || '')))[0] || null;
  }
  const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const button = (label, attrs = '', primary = false, compact = null) => `<a class="catalog-button${primary ? ' is-primary' : ''}" ${attrs}>${compact ? `<span class="catalog-label-wide">${escape(label)}</span><span class="catalog-label-compact">${escape(compact)}</span>` : escape(label)}</a>`;
  const progress = (state, label) => state.known
    ? `<div class="catalog-progress" role="progressbar" aria-label="${escape(label)} 학습 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state.percent}"><span style="width:${state.percent}%"></span></div>`
    : '';
  function card(course, state) {
    const category = categories.find(item => item.id === course.category)?.label || course.category;
    const title = course.registered ? `<a class="catalog-course-title" href="#${escape(course.route)}">${escape(course.title)}</a>` : escape(course.title);
    const label = state.known ? `${state.percent}% · ${state.total}개 학습` : state.example ? '신규 과정 예시 · 학습 준비 중' : '서버 학습 정보를 확인할 수 없습니다.';
    const action = state.example
      ? '<button class="catalog-button" type="button" data-catalog-example>살펴보기 →</button>'
      : button(state.known ? state.started ? state.official || state.state === 'COMPLETED' ? '다시 학습하기 →' : '이어서 학습하기 →' : '시작하기 →' : '과정 살펴보기 →', `href="#${escape(state.known && state.started ? state.target : course.route)}"`, state.known && state.started && state.state !== 'COMPLETED', state.known && state.started ? state.state === 'COMPLETED' ? '다시 학습 →' : '이어하기 →' : null);
    return `<article class="catalog-course${course.registered ? '' : ' is-example'}" data-catalog-key="${escape(course.key)}"${course.registered ? ` data-catalog-course="${escape(course.id)}"` : ''}>
      <div class="catalog-classification"><span>${escape(category)}</span><span class="catalog-status${state.started || state.official ? ' is-active' : ''}">${escape(state.label)}</span></div>
      <div class="catalog-overview"><h3>${title}</h3><p>${escape(course.description)}</p></div>
      <div class="catalog-course-completion"><p class="catalog-meta">${escape(label)}</p>${progress(state, course.title)}</div>
      ${action}</article>`;
  }
  function mount(host, { courses, onRefresh = () => {} }) {
    let all = catalog(courses), record = null, user = null, ready = false, connection = 'loading';
    const routes = ['home', 'my-academy', 'academy-resources'];
    const defaults = route => ({ category: 'all', query: '', requiredOnly: false, mineOnly: route === 'my-academy', sort: 'recommended' });
    const currentRoute = () => location.hash.slice(1) || 'home';
    let activeRoute = null, entryKey = null, scrollFrame = null, restoring = false;
    let selection = defaults('home'), states = {};
    const navigation = [['home', '교육과정'], ['my-academy', '나의 강의실'], ['academy-resources', '안전 자료실']]
      .map(([route, label]) => `<a href="#${route}" data-catalog-view="${route}">${label}</a>`).join('');
    host.className = 'academy-flow-home catalog-home';
    host.innerHTML = `<header class="catalog-header"><div class="catalog-header-inner">
      <a href="#home" class="catalog-brand" data-catalog-view="home" aria-label="ONOFF Academy 홈"><strong>ONOFF</strong><span>Academy</span></a>
      <nav class="catalog-nav" aria-label="Academy">${navigation}</nav>
      <span class="catalog-user"></span><details class="unified-menu catalog-mobile-menu"><summary>메뉴</summary><nav aria-label="Academy 모바일">${navigation}</nav></details><span class="catalog-work-actions" data-catalog-work-actions></span>
      </div></header>
      <div class="catalog-workspace">
        <div class="catalog-introduction"><div><h1>교육과정 탐색</h1><p><span class="catalog-label-wide">현장에 필요한 지식을 찾고, 나의 속도로 학습하세요.</span><span class="catalog-label-compact">현장에 필요한 지식, 나의 속도로.</span></p></div></div>
        <div class="catalog-layout"><section class="catalog-continue" aria-label="이어서 학습하기"></section>
          <section class="catalog-discovery" aria-labelledby="catalog-heading">
            <div class="catalog-search-heading"><h2 id="catalog-heading" tabindex="-1">전체 교육과정</h2><label class="catalog-search"><img src="assets/catalog-v2/search.svg" alt="" width="20" height="20"><input type="search" aria-label="교육과정 검색" placeholder="과정명 또는 키워드로 검색" autocomplete="off"></label></div>
            <div class="catalog-category-tabs" role="tablist" aria-label="분야별 교육과정"></div>
            <div class="catalog-filters"><span class="catalog-results-count" role="status" aria-live="polite"></span><select aria-label="과정 정렬"><option value="recommended">추천순</option><option value="title">과정명순</option><option value="recent">최근 학습순</option></select></div>
            <div class="catalog-courses" id="catalog-course-results" role="tabpanel" aria-labelledby="catalog-tab-all"></div>
          </section>
          <aside class="catalog-sidebar" aria-label="나의 학습"><section class="catalog-panel catalog-my-learning" id="catalog-my-learning" aria-labelledby="catalog-my-heading"></section></aside>
        </div>
        <section class="catalog-empty catalog-resources" hidden><h2>자료를 준비하고 있습니다.</h2><a class="catalog-button" href="#home" data-catalog-view="home">교육과정 보기 →</a></section>
      </div><footer class="catalog-footer"><span>© ONOFF Academy</span></footer>`;
    const find = selector => host.querySelector(selector);
    // Mounted once so focused tabs and mobile tab-strip scroll survive filtering.
    find('.catalog-category-tabs').innerHTML = [{ id: 'all', label: '전체' }, ...categories].map(category =>
      `<button type="button" role="tab" id="catalog-tab-${category.id}" aria-controls="catalog-course-results" data-category="${category.id}">${category.label}</button>`).join('');
    function holdViewport(y = window.scrollY) {
      const workspace = find('.catalog-workspace');
      const top = workspace.getBoundingClientRect().top + window.scrollY;
      workspace.style.minHeight = `${Math.max(0, y + window.innerHeight - top - find('.catalog-footer').getBoundingClientRect().height)}px`;
    }
    function saveEntry() {
      if (!activeRoute || currentRoute() !== activeRoute) return;
      history.replaceState({ ...history.state, academyCatalog: {
        key: entryKey, route: activeRoute, selection: { ...selection },
        scrollY: window.scrollY, tabsX: find('.catalog-category-tabs').scrollLeft
      } }, '');
    }
    const exampleDialog = document.createElement('dialog');
    exampleDialog.className = 'unified-toc catalog-example-dialog';
    exampleDialog.setAttribute('aria-labelledby', 'catalog-example-title');
    exampleDialog.innerHTML = `<form method="dialog"><strong id="catalog-example-title">센서 기초와 현장 데이터 읽기</strong><button class="catalog-button" type="submit">닫기</button></form><p>준비 중인 교육과정입니다.</p><p>${escape(examples[0].description)}</p>`;
    document.body.append(exampleDialog);
    function render(preserve = true) {
      const visible = routes.includes(currentRoute()) && !host.hidden;
      const y = window.scrollY;
      if (visible && preserve) holdViewport(y);
      const verified = ready && user?.id && record?.user?.id === user.id;
      states = Object.fromEntries(all.map(course => [course.key, courseState(course, record, verified)]));
      const registered = all.filter(course => course.registered);
      const qa = verified && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && (user.id === 'onoff-unified-device-qa' || user.name === 'Academy Local QA');
      find('.catalog-user').textContent = qa ? '로컬 QA' : verified ? `${user.name || '학습자'} 님` : '';
      find('.catalog-user').classList.toggle('is-qa', Boolean(qa));
      [{ id: 'all', label: '전체' }, ...categories].forEach(category => {
        const count = all.filter(course => category.id === 'all' || course.category === category.id).length;
        const tab = find(`[data-category="${category.id}"]`);
        tab.textContent = `${category.label} ${count}`;
        tab.setAttribute('aria-selected', String(category.id === selection.category));
        tab.tabIndex = category.id === selection.category ? 0 : -1;
      });
      const resume = continuation(all, states);
      if (resume) {
        const state = states[resume.key];
        const chapter = resume.chapters?.find(item => item[0] === state.target);
        find('.catalog-continue').innerHTML = `<div class="catalog-continue-heading"><strong>이어서 학습하기</strong><span>${state.percent}% 학습</span></div><div class="catalog-resume-content"><div><h2>${escape(resume.title)}</h2><p>${chapter ? escape(chapter[1]) : '마지막 학습 위치에서 이어가세요.'}</p></div>${button('이어서 학습하기 →', `href="#${escape(state.target)}"`, true)}</div>${progress(state, resume.title)}`;
      } else if (verified) {
        const course = registered.find(item => !states[item.key].official) || registered[0];
        find('.catalog-continue').innerHTML = `<div class="catalog-continue-heading"><strong>나의 다음 학습</strong></div><div class="catalog-resume-content"><div><h2>${escape(course?.title || '교육과정을 살펴보세요')}</h2><p>관심 있는 과정부터 학습을 시작해 보세요.</p></div>${course ? button('과정 살펴보기 →', `href="#${escape(course.route)}"`, true) : ''}</div>`;
      } else {
        find('.catalog-continue').innerHTML = `<div class="catalog-continue-heading"><strong>이어서 학습하기</strong></div><div class="catalog-resume-content"><div><h2>${connection === 'loading' ? '학습 정보를 확인하고 있습니다.' : '학습 정보를 확인할 수 없습니다.'}</h2><p>교육과정은 아래에서 살펴볼 수 있습니다.</p></div><button class="catalog-button" type="button" data-catalog-refresh>다시 확인</button></div>`;
      }
      const known = registered.map(course => states[course.key]).filter(state => state.known);
      const metrics = [{ value: known.filter(state => state.state === 'IN_PROGRESS').length, label: '진행 중' }, { value: known.filter(state => state.official).length, label: '공식 이수' }, { value: known.filter(state => state.state === 'NOT_STARTED').length, label: '미시작' }];
      const pendingOfficial = known.filter(state => state.state === 'COMPLETED' && !state.official).length;
      find('.catalog-my-learning').innerHTML = `<h2 id="catalog-my-heading">나의 학습 현황</h2>${verified ? '' : '<p>학습 정보를 확인해 주세요.</p>'}<dl class="catalog-metrics">${metrics.map((metric, i) => `<div${i === 0 ? ' class="is-primary"' : ''}><dd>${verified ? metric.value : '—'}</dd><dt>${metric.label}</dt></div>`).join('')}</dl>${pendingOfficial ? `<p class="catalog-meta">${pendingOfficial}개 과정 공식 이수 대기</p>` : ''}<a class="catalog-button" href="#my-academy" data-catalog-view="my-academy">나의 강의실 →</a>`;
      host.querySelectorAll('[data-catalog-view]').forEach(link => {
        if (link.dataset.catalogView === (activeRoute || 'home')) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      const resources = activeRoute === 'academy-resources';
      find('.catalog-introduction h1').textContent = resources ? '안전 자료실' : selection.mineOnly ? '나의 강의실' : '교육과정 탐색';
      find('.catalog-introduction p').hidden = resources || selection.mineOnly;
      find('.catalog-layout').hidden = resources;
      find('.catalog-resources').hidden = !resources;
      find('#catalog-heading').textContent = selection.mineOnly ? '내 교육과정' : '전체 교육과정';
      const matches = filter(all, states, selection);
      find('.catalog-results-count').textContent = `${matches.filter(course => course.registered).length}개 과정`;
      find('.catalog-courses').setAttribute('aria-labelledby', `catalog-tab-${selection.category}`);
      find('.catalog-courses').innerHTML = matches.length ? matches.map(course => card(course, states[course.key])).join('') : `<div class="catalog-empty"><h3>${selection.query ? '검색 결과가 없습니다.' : selection.mineOnly ? '진행 중인 학습이 없습니다.' : '등록된 과정이 없습니다.'}</h3><button class="catalog-button" type="button" data-catalog-all>전체 과정 보기</button></div>`;
      if (visible && preserve && window.scrollY !== y) window.scrollTo({ top: y, behavior: 'instant' });
    }
    function showRoute(route) {
      if (!routes.includes(route)) { activeRoute = null; restoring = false; return; }
      if (!routes.includes(route)) { activeRoute = null; return; }
      const saved = history.state?.academyCatalog;
      const entry = saved?.route === route ? saved : null;
      const changed = activeRoute !== route || entryKey !== entry?.key;
      activeRoute = route;
      if (!changed) return;
      restoring = true;
      entryKey = entry?.key || `${Date.now()}-${Math.random()}`;
      selection = { ...defaults(route), ...entry?.selection, mineOnly: route === 'my-academy', requiredOnly: false };
      if (selection.category !== 'all' && !categories.some(item => item.id === selection.category)) selection.category = 'all';
      find('input[type="search"]').value = selection.query;
      find('select').value = selection.sort;
      find('.catalog-mobile-menu').open = false;
      const y = Math.max(0, Number(entry?.scrollY) || 0);
      holdViewport(y);
      render(false);
      find('.catalog-category-tabs').scrollLeft = Number(entry?.tabsX) || 0;
      window.scrollTo({ top: y, behavior: 'instant' });
      requestAnimationFrame(() => {
        if (activeRoute !== route || currentRoute() !== route) return;
        window.scrollTo({ top: y, behavior: 'instant' });
        restoring = false; saveEntry();
      });
    }
    function navigate(route) {
      saveEntry();
      find('.catalog-mobile-menu').open = false;
      if (currentRoute() !== route) location.hash = route;
      else { selection = defaults(route); history.replaceState({ ...history.state, academyCatalog: null }, ''); entryKey = null; showRoute(route); }
    }
    host.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
        if (link.hasAttribute('data-catalog-view')) { event.preventDefault(); navigate(link.dataset.catalogView); }
        else saveEntry();
      }
      const target = event.target.closest('button');
      if (!target) return;
      if (target.hasAttribute('data-category')) { selection.category = target.dataset.category; render(); target.focus({ preventScroll: true }); saveEntry(); }
      if (target.hasAttribute('data-catalog-all')) {
        if (activeRoute === 'my-academy') navigate('home');
        else { selection = defaults('home'); find('input[type="search"]').value = ''; find('select').value = 'recommended'; render(); saveEntry(); }
      }
      if (target.hasAttribute('data-catalog-refresh')) onRefresh();
      if (target.hasAttribute('data-catalog-example')) exampleDialog.showModal();
    });
    const searchChanged = event => {
      if (event.target.matches('input[type="search"]') && !event.isComposing) { selection.query = event.target.value; render(); saveEntry(); }
    };
    host.addEventListener('input', searchChanged);
    host.addEventListener('compositionend', searchChanged);
    host.addEventListener('change', event => {
      if (!event.target.matches('select')) return;
      selection.sort = event.target.value; render(); saveEntry();
    });
    host.addEventListener('keydown', event => {
      if (!event.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...find('.catalog-category-tabs').children], index = tabs.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selection.category = tabs[next].dataset.category; render(); tabs[next].focus({ preventScroll: true });
      // Reveal horizontal tabs without invoking scrollIntoView on the page.
      const strip = find('.catalog-category-tabs'), tab = tabs[next];
      const bounds = strip.getBoundingClientRect(), item = tab.getBoundingClientRect();
      if (item.left < bounds.left) strip.scrollLeft += item.left - bounds.left;
      else if (item.right > bounds.right) strip.scrollLeft += item.right - bounds.right;
      saveEntry();
    });
    window.addEventListener('scroll', () => {
      if (restoring || currentRoute() !== activeRoute || scrollFrame !== null) return;
      scrollFrame = requestAnimationFrame(() => { scrollFrame = null; holdViewport(); saveEntry(); });
    }, { passive: true });
    find('.catalog-category-tabs').addEventListener('scroll', saveEntry, { passive: true });
    // Save before the browser changes a hash or an external link leaves this document.
    window.addEventListener('pagehide', saveEntry);
    render(false);
    return {
      isRoute: route => routes.includes(route), showRoute,
      update(value) {
        if (value.courses) all = catalog(value.courses);
        record = value.record ?? null; user = value.user ?? null; ready = Boolean(value.ready);
        connection = value.connection || (ready ? 'ready' : 'unavailable'); render();
      }
    };
  }
  return { categories, metadata, examples, catalog, courseState, courseStatusLabel, filter, continuation, mount };
});
