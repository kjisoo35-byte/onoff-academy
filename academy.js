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
  const bookCatalog = [
    { id: 'platform', route: 'safety-book-toc', view: 'safety-book' },
    { id: 'tbm', route: 'tbm-book-toc', view: 'tbm-book' },
    { id: 'risk', route: 'risk-book-toc', view: 'risk-book' },
    { id: 'sop', route: 'sop-book-toc', view: 'sop-book' },
    { id: 'special', route: 'special-book-toc', view: 'special-book' }
  ];
  const bookRouteRegistry = new Map(bookCatalog.map((book) => [book.route, book.view]));
  const entryCourseCatalog = [
    { id: 'platform', route: 'platform-course', view: 'platform-landing', number: '01', tag: '기초 필수', title: 'ONOFF Safety Platform', description: '안전 관리 플랫폼의 설계 사상과 오늘 작업 선택부터 실제 서명까지의 핵심 Workflow를 학습합니다.', hero: 'assets/course-heroes/platform.png', time: '60분', standard: '퀴즈 80점', chapters: [['philosophy','ONOFF Safety Platform 이해','플랫폼 도입 목적과 핵심 안전 흐름'],['workflow','Safety Start','안전정보 준비'],['daily-work','오늘 작업과 Daily Safety','오늘의 안전확인'],['safety-report','작업 중과 작업 종료','비정상 상황 대처 및 작업 종료']] },
    { id: 'risk', route: 'risk-course', view: 'risk-landing', number: '02', tag: '평가 관리', title: '위험성평가 (Risk Assessment)', description: '잠재적 유해·위험요인을 발견하고 위험성을 결정하여 체계적인 감소대책을 수립합니다.', hero: 'assets/course-heroes/risk-assessment.png', finalHero: 'assets/course-heroes/final-risk.png', time: '75분', standard: '제출물 통과', chapters: [['risk-assessment-purpose','위험성평가의 이해','위험성평가의 필요성과 기본 개념, 유해·위험요인을 바라보는 관점과 전체 평가 흐름을 이해합니다.'],['risk-assessment-structure','위험성 판단과 감소대책','위험 수준 산정과 제거 방안'],['risk-assessment-stra','현장 실행과 지속 관리','대책 실행과 모니터링'],['risk-assessment-platform','ONOFF Platform 연결','결과 반영과 이행 확인']] },
    { id: 'practical', route: 'risk-practical-course', view: 'risk-practical-landing', number: '03', tag: '실무 서식 실습', title: '위험성평가 실무 작성', description: '현장 양식과 산업안전 보건지표 조사표를 직접 열어보고 정해진 서식을 기록하는 실무 코스입니다.', hero: 'assets/course-heroes/risk-practical.png', finalHero: 'assets/course-heroes/final-risk-practical.png', time: '3시간', standard: '4개 실습 제출', chapters: [['risk-practical-01','작업 확인과 위험요인 파악','공정별 표준 위험요인 매핑'],['risk-practical-02','최초 위험성과 안전조치','위험지수 산출과 조치 작성'],['risk-practical-03','감소대책과 재평가','대책 적용 후 재평가'],['risk-practical-04','개선 실행과 완료 확인','완료 증빙과 최종 검토']] },
    { id: 'sop', route: 'sop-course', view: 'sop-landing', number: '04', tag: '절차 이행', title: 'SOP 표준작업절차서', description: '고위험 공정의 안전수칙을 명확히 정의하고 올바르게 작업을 실행·이행하는 체계를 학습합니다.', hero: 'assets/course-heroes/sop.png', finalHero: 'assets/course-heroes/final-sop.png', time: '50분', standard: 'SOP 서명', chapters: [['sop-purpose','표준작업절차서(SOP)의 이해','SOP의 정의와 도입 목적'],['sop-reading','작업 준비와 실행','필수 Sequence 수행'],['sop-structure','변경과 비정상 상황','중지와 관리자 알림'],['sop-platform','ONOFF Platform 연결','이행 결과 확인과 보존']] },
    { id: 'tbm', route: 'tbm-course', view: 'tbm-landing', number: '05', tag: '매일 진행', title: 'TBM (Tool Box Meeting)', description: '작업 개시 전 감독자를 중심으로 현장에서 직접 소통하는 10분 밀착 미팅의 핵심 가이드를 익힙니다.', hero: 'assets/course-heroes/tbm.png', finalHero: 'assets/course-heroes/final-tbm.png', time: '30분', standard: '서명 참여율', chapters: [['tbm-purpose','TBM의 목적과 기본 원칙','컨디션과 보호구 확인'],['tbm-nine-steps','위험 공유와 사고사례','작업별 위험요인 공유'],['tbm-scenario','대응 준비와 작업 시작','비상행동과 미팅 마감']], landingChapters: [['tbm-purpose','TBM이란 무엇인가','TBM의 의미와 목적, 전체 운영 흐름을 이해합니다.'],['tbm-nine-steps','사람 확인과 준비','작업 참여자와 건강상태, 준비체조와 보호구를 확인합니다.'],['tbm-scenario','위험 공유와 사고사례','작업자가 위험을 직접 공유하고 사고사례를 오늘의 예방 기준으로 연결합니다.'],['tbm-life-rules','대응 준비와 작업 시작','안전구호, 비상대피와 연락체계, 작업 역할을 확인하고 작업을 시작합니다.']] },
    { id: 'special', route: 'special-course', view: 'special-landing', number: '06', tag: '고위험군 특화', title: '특별안전교육 (Special Safety)', description: '로봇, 고전압, 유해물질, 중량물 등 사고 위험이 높은 전문 분야의 행동수칙을 학습합니다.', hero: 'assets/course-heroes/special-safety.png', finalHero: 'assets/course-heroes/final-special.png', time: '90분', standard: '최종 시험 90점', accent: 'red', chapters: [['special-robot-work','Robot Safety — 산업용 로봇 작업','협착 방지와 LOTO'],['special-live-work-75v','Electrical Safety — 전기작업','정전작업과 고전압 차단'],['special-hazardous-chemicals','Chemical Safety — 유해물질 취급','MSDS와 보호구'],['special-cargo-handling','Material Handling — 중량물 취급','운반장비와 인양 안전']] }
  ];
  entryCourseCatalog.forEach((course) => bookRouteRegistry.set(course.route, course.view));
  const mobileLandingCatalog = {
    platform: { header: 'Course Platform', tag: '기초 필수', status: '진행률 50%', description: '안전 관리 플랫폼의 전체적인 설계 사상 및 작업 선택부터 실제 서명까지의 핵심 Workflow를 모바일 환경에서 학습합니다.', metrics: [['⏱️','총 학습 시간','60분'],['📝','학습 수','4개 학습'],['🏆','이수 기준','퀴즈 80점']], section: '학습 목록', note: "학습 03 'Safety Start' 학습 대기 중", cta: '이어서 안전 학습하기', ctaRoute: 'daily-work', rows: [['15분','complete'],['15분','complete'],['20분','current'],['10분','upcoming']] },
    risk: { header: 'Course Assessment', tag: '평가 관리', status: '수강 시작', description: '산업현장의 잠재적 유해·위험요인을 사전에 스스로 발견하여 그 크기를 결정하고 체계적인 감소 대책을 수립합니다.', metrics: [['⏱️','총 학습 시간','75분'],['📝','학습 수','4개 학습'],['🏆','이수 기준','제출물 통과']], section: '학습 목록', note: '산업안전보건법 필수 보건 수칙 반영', cta: '첫 번째 학습 시작하기', ctaRoute: 'risk-assessment-purpose', rows: [['20분','current'],['20분','upcoming'],['15분','upcoming'],['20분','upcoming']] },
    practical: { header: 'Hands-on Lab', tag: '실무 실습', status: '평가 완료', title: '위험성평가 실무 작성', description: '현장 양식과 산업안전 보건지표 조사표를 직접 열어보고 누락 없이 정해진 서식을 기록해 보는 고강도 트레이닝입니다.', metrics: [['📋','제출 양식','조사표 1부'],['📝','학습 수','4개 학습'],['⚙️','평가 난이도','심화 수준']], section: '단계별 학습 목록', note: '과정 전체 이수 및 제출 완료', cta: '작성 가이드 다시 보기', ctaRoute: 'risk-assessment-structure', rows: [['20분','complete'],['15분','complete'],['20분','complete'],['15분','complete']] },
    sop: { header: 'Course SOP', tag: '절차 이행', status: '진행률 25%', title: '표준작업절차서(SOP) 학습', description: '제조 및 정비 등 고위험 공정의 안전 수칙을 명확히 정의하고 올바르게 작업을 실행·이행하는 체계를 학습합니다.', metrics: [['⏱️','총 학습 시간','50분'],['📝','학습 수','4개 학습'],['🏆','이수 기준','SOP 서명']], section: '학습 목록', note: "학습 02 '작업 준비와 실행' 진행중", cta: '이어서 학습 진행', ctaRoute: 'sop-reading', rows: [['10분','complete'],['15분','current'],['15분','upcoming'],['10분','upcoming']] },
    tbm: { header: 'Course TBM', tag: '매일 진행', status: '대기 중', title: 'TBM (Tool Box Meeting)', description: '작업 개시 전 감독자를 중심으로 현장에서 직접 소통하는 10분 밀착 미팅의 핵심 가이드를 익힙니다.', metrics: [['⏱️','총 학습 시간','30분'],['📝','학습 수','3개 학습'],['🏆','이수 기준','서명 참여율']], section: '학습 목록', note: '매일 아침 10분, 안전의 첫 걸음', cta: 'Tool Box Meeting 시작', ctaRoute: 'tbm-purpose', rows: [['10분','current'],['10분','upcoming'],['10분','upcoming']] },
    special: { header: 'Course Special', tag: '고위험군 특화', status: '긴급 이수', title: '특별안전교육 (Special Safety)', description: '로봇, 고전압, 유해물질, 중량물 등 사고 위험이 특히 높은 4대 전문 분야에 최적화된 행동 수칙과 법적 규정을 마스터합니다.', metrics: [['🔥','위험도 등급','고위험 (Level 4)'],['📝','학습 수','4개 학습'],['🏆','이수 기준','최종 시험 90점']], section: '특별 안전 학습 목록', note: '미이수 시 규정에 따라 현장 출입이 제한될 수 있습니다.', cta: '고위험 특화 교육 개시', ctaRoute: 'special-robot-work', rows: [['20분','current'],['25분','upcoming'],['20분','upcoming'],['25분','upcoming']] }
  };
  const modeName = document.querySelector('[data-selected-learning-mode]');
  const modeDescription = document.querySelector('[data-selected-mode-description]');
  const globalPager = document.querySelector('.document > .chapter-pager');
  const legacySiteHeader = document.querySelector('.site-header');
  const legacySidebar = document.querySelector('.academy-shell > .sidebar');
  const legacySiteHeaderAnchor = document.createComment('legacy-site-header-anchor');
  const legacySidebarAnchor = document.createComment('legacy-sidebar-anchor');
  legacySiteHeader?.before(legacySiteHeaderAnchor);
  legacySidebar?.before(legacySidebarAnchor);
  const desktopHomeMedia = window.matchMedia('(min-width: 800px)');
  const desktopGlobalHeader = document.createElement('header');
  desktopGlobalHeader.className = 'desktop-academy-global-header';
  desktopGlobalHeader.hidden = true;
  const defaultDesktopHeaderMarkup = `<a href="#home"><i>O</i><strong>ONOFF Academy</strong></a><nav aria-label="Academy Global Navigation"><a href="#home">학습 라이브러리</a><span aria-disabled="true" title="V2 예정">나의 강의실</span><span aria-disabled="true" title="V2 예정">안전 자료실</span><b title="V2 예정">● 홍길동 작업자</b></nav>`;
  const sopLearning01HeaderMarkup = `<div class="desktop-learning-brand"><a href="#home"><strong>ONOFF Academy</strong></a><span>SOP COURSE · 학습 01</span></div><nav aria-label="Academy Global Navigation"><a href="#home">Courses</a><span aria-disabled="true">Library</span><span aria-disabled="true">Support</span><i aria-hidden="true"></i><b>홍길동</b><em aria-hidden="true">KO</em></nav>`;
  desktopGlobalHeader.innerHTML = defaultDesktopHeaderMarkup;
  document.querySelector('.academy-shell')?.before(desktopGlobalHeader);
  const syncDesktopHomeShell = (route) => {
    const useDesktopAcademyShell = desktopHomeMedia.matches;
    const useFigmaHomeShell = route === 'home' && useDesktopAcademyShell;
    const useCourseLandingHeader = useDesktopAcademyShell && entryCourseCatalog.some((course) => course.route === route);
    const useSopLearning01Header = useDesktopAcademyShell && route === 'sop-purpose';
    desktopGlobalHeader.classList.toggle('is-sop-learning-01', useSopLearning01Header);
    const expectedDesktopHeaderMarkup = useSopLearning01Header ? sopLearning01HeaderMarkup : defaultDesktopHeaderMarkup;
    if (desktopGlobalHeader.innerHTML !== expectedDesktopHeaderMarkup) desktopGlobalHeader.innerHTML = expectedDesktopHeaderMarkup;
    document.body.classList.toggle('is-figma-desktop-home', useFigmaHomeShell);
    document.body.classList.toggle('is-academy-desktop-shell', useDesktopAcademyShell);
    if (useDesktopAcademyShell) {
      legacySiteHeader?.remove();
      legacySidebar?.remove();
      desktopGlobalHeader.hidden = useFigmaHomeShell || useCourseLandingHeader;
      return;
    }
    desktopGlobalHeader.hidden = true;
    if (legacySiteHeader && !legacySiteHeader.isConnected) legacySiteHeaderAnchor.after(legacySiteHeader);
    if (legacySidebar && !legacySidebar.isConnected) legacySidebarAnchor.after(legacySidebar);
  };
  const lessonStickyStack = document.createElement('div');
  lessonStickyStack.className = 'lesson-sticky-stack';
  lessonStickyStack.hidden = true;
  breadcrumb?.insertAdjacentElement('beforebegin', lessonStickyStack);
  if (breadcrumb) lessonStickyStack.append(breadcrumb);
  let activeStickyChapterHeader = null;
  document.querySelectorAll('.academy-hero,.home-discovery,.library-section,.book-overview,.learning-mode-section,.book-complete-view,.book-platform-link,.my-academy-card').forEach((element) => element.remove());
  const entryHome = homeSection?.querySelector('.academy-flow-home');
  if (entryHome) {
    [...homeSection.children].forEach((child) => { if (child !== entryHome) child.remove(); });
    entryHome.className = 'academy-flow-home figma-academy-home';
    const homeCourseState = [
      { status: '이수완료', title: 'ONOFF Safety Platform 이해', summary: '제품과 Workflow 이해 · 4개 학습', desktopDescription: '안전 관리 플랫폼의 전체적인 설계 사상 및 작업 선택부터 실제 서명까지의 핵심 Workflow를 익힙니다.', progress: '진행상황: 100%', cta: '복습하기 →' },
      { status: '학습진행', tag: '핵심 과정', summary: '위험 발견 및 수준 결정 가이드 · 4개 학습', desktopDescription: '산업현장의 잠재적 유해·위험요인을 사전에 스스로 발견하여 그 크기를 결정하고 감소대책을 세웁니다.', progress: '진행상황: 50%', cta: '이어 학습하기 →' },
      { status: '대기중', tag: '실무 서식', summary: '현장 양식 기반 실제 문서 작성 실습 · 4개 학습', desktopDescription: '다양한 업종별 표준 예시 시나리오를 바탕으로 위험성평가 서식을 누락없이 정확히 작성해 봅니다.', progress: '진행상황: 0%', cta: '시작하기 →' },
      { status: '대기중', summary: '안전 규정 숙지 및 현장 준수 · 4개 학습', desktopDescription: '제조 및 정비 등 모든 위험 공정의 안전 수칙을 시각화하고 올바른 이행 상태를 기록하는 법을 학습합니다.' },
      { status: '대기중', summary: 'Tool Box Meeting 안전 소통 지침 · 3개 학습', desktopDescription: '작업 개시 전 현장 부근에서 감독자를 중심으로 한 10분 미팅을 실질적으로 안전하게 소통하는 가이드입니다.' },
      { status: '고위험', tag: '고위험군', summary: '로봇, 전력, 화학 물질별 특화 수칙 · 4 Topics', desktopDescription: '산업용 로봇 작업, 전기 작업, 유해물질 취급, 중량물 인양 등 위험도 상위 분야 전문 행동 수칙을 마스터합니다.' }
    ];
    entryHome.innerHTML = `<header class="figma-home-header"><div><i>O</i><strong>ONOFF Academy</strong></div><nav><a href="#home">학습 라이브러리</a><a href="#my-academy">나의 강의실</a><span>안전 자료실</span><b>● 홍길동 작업자</b></nav><em></em></header><section class="figma-home-hero"><p>PREMIUM INDUSTRIAL SAFETY SYSTEM</p><small>ONOFF ACADEMY</small><h1><span>안전을 이해하고, 현장에서 실행하는 방법을 배웁니다.</span><b>안전을 이해하고,<br>현장에서 실행하는 법</b></h1><div class="figma-home-desktop-meta"><span>전체 6개 과정 · 23개 학습 챕터 완비</span><i></i><span data-academy-total-progress>내 학습 진행률 0%</span><b data-academy-total-progress-bar></b></div><blockquote>“안전한 작업은 시작하기 전에 결정됩니다.”</blockquote></section><main class="figma-home-content"><section class="figma-home-courses" aria-labelledby="figma-home-courses-title"><header><h2 id="figma-home-courses-title"><span>전체 학습 과정</span><b>과정 목록 (6)</b></h2><a href="#home">필수 이수 과정 보기 →</a></header><div>${entryCourseCatalog.map((course,index) => { const state = homeCourseState[index]; const priorityClass = course.id === 'risk' ? ' is-core' : course.id === 'special' ? ' is-red is-high-risk' : ''; return `<a class="figma-home-course${priorityClass}" href="#${course.route}" data-progress-course="${course.id}"><div class="figma-home-course-cover" aria-hidden="true"><span></span><img src="assets/academy-home/course-${course.number}.png" alt=""><i></i><b></b><img src="assets/academy-home/cover-overlay.png" alt=""></div><div class="figma-home-course-details"><header><span>${course.number}</span><small class="desktop-tag">${state.tag || course.tag}</small><strong>${state.title || course.title}</strong><small class="mobile-status" data-course-state>대기중</small></header><p class="desktop-description">${state.desktopDescription}</p><p class="mobile-summary">${state.summary}</p><footer><em>${course.id === 'special' ? '4 대 주제 핵심 교육' : `${course.chapters.length} 챕터 구성`}</em><b class="desktop-cta" data-course-cta>시작하기 <i aria-hidden="true">→</i></b><span data-course-progress>진행상황: 0%</span><b class="mobile-cta" data-course-cta>시작하기 →</b></footer></div></a>`; }).join('')}</div></section><aside class="figma-home-report"><h2>나의 학업 리포트</h2><dl><div><dt>수강 중인 과정</dt><dd data-home-active-courses>0개 과정</dd></div><div><dt>남은 평가 시험</dt><dd data-home-pending-assessments>0개 대기</dd></div></dl><div><strong>TBM 매뉴얼 개정안 알림</strong><p>최근 고용노동부 지침에 따른 중대재해 감축 대책 가이드라인 자료가 업데이트 되었습니다.</p></div><a href="#tbm-course">이어서 안전학습하기</a></aside></main>`;
    const reservedHomeLink = entryHome.querySelector('.figma-home-header a[href="#my-academy"]');
    if (reservedHomeLink) reservedHomeLink.outerHTML = '<span aria-disabled="true" title="V2 예정">나의 강의실</span>';
    entryHome.querySelector('.figma-home-header nav span:not([aria-disabled])')?.setAttribute('aria-disabled', 'true');
    entryHome.querySelector('.figma-home-header nav span:not([title])')?.setAttribute('title', 'V2 예정');
    entryHome.querySelector('.figma-home-header nav b')?.setAttribute('title', 'V2 예정');
    entryHome.querySelector('.figma-home-report > a')?.setAttribute('data-academy-continue', '');
  }
  const desktopLandingCatalog = {
    platform: {
      time: '1시간 30분', audience: '모든 신규·기존 현장 작업자',
      points: [['스마트 안전 모바일 앱 흐름 이해','작업 개시부터 종료 시각 측정까지 전체 수명 주기의 안전 흐름을 이해합니다.'],['안전 검토 자동화 연동','위험 수준과 현장 상태 검증이 클라우드에서 연결되는 방식을 확인합니다.'],['작업 기록의 디지털 증적 확보','안전활동 이력과 서명을 신뢰할 수 있는 디지털 기록으로 남깁니다.']]
    },
    risk: {
      time: '2시간', audience: '관리감독자 및 안전관리 책임자',
      points: [['잠재 유해·위험요인 식별 규칙','공정과 작업환경에 숨어 있는 위험요인을 빠짐없이 찾는 기준을 익힙니다.'],['위험성 크기 결정 매트릭스','가능성과 중대성을 조합하여 위험 수준을 일관되게 판단합니다.'],['감소대책 설계 및 지속 피드백','우선순위에 따라 대책을 수립하고 현장 실행 결과를 계속 점검합니다.']]
    },
    practical: {
      time: '3시간', audience: '현장 안전 담당 서기 및 공장 관리자',
      pointsTitle: '실전 서식 기입 학습 포인트',
      points: [['현장 양식 실전 기입 가이드','실제 FORM 양식의 항목별 작성 순서와 판단 기준을 익힙니다.'],['자주 하는 실수 클리닉','누락되거나 모호하게 작성하기 쉬운 항목을 사례로 바로잡습니다.'],['실제 공정 가상 작성 피드백','가상 공정을 기준으로 작성 결과를 검토하고 보완합니다.']]
    },
    sop: {
      time: '1시간 45분', audience: '생산 설비 담당 기능직 및 정비 전임자',
      points: [['표준작업 지침 설계 로직','안전한 작업 순서를 누구나 동일하게 실행할 수 있도록 구조화합니다.'],['비정상 및 변경 상황 식별','표준에서 벗어난 조건을 발견하고 작업중지와 보고 기준을 확인합니다.'],['ONOFF 실시간 연동 이행 기록','절차 수행 결과와 변경 이력을 플랫폼 기록으로 연결합니다.']]
    },
    tbm: {
      time: '1시간', audience: '현장 모든 반장, 팀장 및 소그룹 근로자',
      actions: [['도입','Introduction','상태 및 컨디션 점검, 보호구 상호 체결 검사'],['위험지적','Identify','당일 고위험 요인을 브리핑하고 피하는 대책 주지'],['확인','Commitment','조치 사항 복창, 슬로건 합창 및 안전 서명']],
      points: [['TBM 10분 미팅 주도 리더십','매일 아침 팀원들과 함께 위험 요인을 10분 이내로 효율적으로 공유하는 소통 비법을 익힙니다.'],['오늘의 주의사항 시각 공유','스마트 기기나 현장 모니터를 활용해 교대 근무자에게 당일 위험사항을 명확히 고지합니다.'],['개인 보호구와 피지컬 체크','서로의 컨디션과 보건 안전 수준을 직접 피드백하고 준비 상태를 교차 검증합니다.']]
    },
    special: {
      themes: [
        ['special-robot-work','01','Robot Safety','산업용 로봇 작업','로봇의 위험구역과 정비·티칭 작업 시 정지 및 안전확인 절차를 학습합니다.','assets/special/chapter-06/robot-work-source.png'],
        ['special-live-work-75v','02','Electrical Safety','전기작업','전원 차단, LOTO, 무전압 확인과 감전 예방 행동수칙을 학습합니다.','assets/special/chapter-04/electrical-work-source.png'],
        ['special-hazardous-chemicals','03','Chemical Safety','유해물질 취급','SDS 확인, 환기, 보호구 착용과 안전한 보관 기준을 학습합니다.','assets/special/chapter-05/chemical-handling-source.png'],
        ['special-cargo-handling','04','Material Handling','중량물 취급·운반','운반장비 점검, 이동경로 통제와 화물 낙하 예방수칙을 학습합니다.','assets/special/chapter-03/material-handling-source.png']
      ]
    }
  };
  const renderDesktopCourseHeader = () => `<header class="figma-course-global-header"><a href="#home"><i>O</i><strong>ONOFF Academy</strong></a><div><a href="#home">← 아카데미 홈으로 돌아가기</a><span class="user-context"><i aria-hidden="true"></i>홍길동 작업자</span></div></header>`;
  const renderDesktopCourseHero = (course) => {
    const primaryLabel = course.id === 'practical' ? '실습 템플릿 열기 (Start Practice)' : '학습 시작하기 (Start Learning)';
    const descriptionBreaks = {
      platform: '설계 사상과',
      risk: '위험성을 결정하여',
      practical: '직접 열어보고',
      sop: '안전수칙을 명확히 정의하고',
      tbm: '현장에서 직접 소통하는',
      special: '유해물질, 중량물 등'
    };
    const breakAfter = descriptionBreaks[course.id];
    const heroDescription = breakAfter ? course.description.replace(breakAfter, `${breakAfter}<br>`) : course.description;
    const artwork = course.id === 'platform'
      ? `<div class="figma-platform-hero-artwork" aria-hidden="true"><img class="figma-platform-art-image" src="${course.hero}" alt=""><span class="figma-platform-art-multiply"></span><span class="figma-platform-art-color"></span><span class="figma-platform-art-left"></span><img class="figma-platform-art-top" src="assets/course-heroes/platform-gradient-top.png" alt=""><img class="figma-platform-art-bottom" src="assets/course-heroes/platform-gradient-bottom.png" alt=""><span class="figma-platform-art-right"></span></div>`
      : `<div class="academy-course-hero-artwork" aria-hidden="true"><img src="${course.finalHero}" alt=""></div>`;
    const secondary = course.id === 'practical' ? '' : '<span>교안 PDF 다운로드</span>';
    return `<section class="academy-course-hero figma-course-hero" style="--course-art:url('${course.hero}')">${artwork}<div class="figma-course-hero-copy"><div class="figma-course-module"><b>${course.number}</b><span><small>COURSE MODULE</small>${course.tag}</span><em>${course.tag}</em></div><div class="figma-course-title-group"><h1>${course.title}</h1><strong>${heroDescription}</strong></div><div class="figma-course-hero-actions"><a href="#${course.chapters[0][0]}" data-course-continue data-hero-fixed-label>${primaryLabel}</a>${secondary}</div></div></section>`;
  };
  const renderDesktopLearningPoints = (data) => `<section class="academy-course-section academy-course-learning-points figma-course-intro"><h2>${data.pointsTitle || '무엇을 배우게 되나요? <small>(What You Will Learn)</small>'}</h2><div>${data.points.map(([title,description],index) => `<article><span>${String(index+1).padStart(2,'0')}</span><div><strong>${title}</strong><p>${description}</p></div></article>`).join('')}</div></section>`;
  const renderDesktopCurriculum = (course) => {
    const chapters = course.landingChapters || course.chapters;
    return `<section class="academy-course-section academy-course-curriculum figma-course-curriculum"><header><h2>커리큘럼 및 학습 목차</h2><span data-course-progress>0% · 0/${course.chapters.length} 완료</span></header><ol>${chapters.map(([route,title,description],index) => { const introduction = course.id === 'tbm' && route === 'tbm-purpose'; const label = introduction ? 'INTRO' : String(course.id === 'tbm' ? index : index + 1).padStart(2,'0'); return `<li class="is-not-started${introduction?' is-introduction':''}"${introduction?'':' data-progress-learning="'+route+'"'}><a href="#${route}"><span>${label}</span><div><strong>${introduction?'INTRO':'학습 '+label} — ${title}</strong><p>${description}</p></div><em${introduction?'':' data-learning-state'}>${introduction?'과정 소개':'미진입'}</em></a></li>`; }).join('')}</ol></section>`;
  };
  const renderDesktopCourseInfo = (course,data) => `<aside class="academy-course-info figma-course-info"><small>COURSE INFORMATION</small><dl><div><dt>권장 학습시간</dt><dd>${data.time}</dd></div><div><dt>대상자</dt><dd>${data.audience}</dd></div><div><dt>진행 상태</dt><dd data-course-state>대기중</dd></div></dl><div><strong>필수 안전 점검 과정</strong><p>이수 기준: ${course.standard}</p></div><a href="#${course.chapters[0][0]}" data-course-continue>바로 학습하기 <i>→</i></a></aside>`;
  const renderDesktopCourseBody = (course,data) => {
    const actions = data.actions ? `<section class="figma-tbm-actions" aria-labelledby="tbm-actions-title"><h2 id="tbm-actions-title">TBM 핵심 3단계 ACTION</h2><div>${data.actions.map(([title,en,description],index) => `<article><span>${index+1}</span><div><strong>${title} <small>${en}</small></strong><p>${description}</p></div></article>`).join('')}</div></section>` : '';
    const workflow = course.id === 'practical' ? `<section class="figma-practical-workflow"><div><small>FIELD DOCUMENT WORKFLOW</small><h2>FORM 기반 위험성평가 작성 흐름</h2><ol><li><b>01</b><span>위험요인 분류</span></li><li><b>02</b><span>빈도 × 강도</span></li><li><b>03</b><span>감소대책 수립</span></li><li><b>04</b><span>완료 확인</span></li></ol></div><figure><img src="assets/risk-practical/forms/form-04.png" alt="FORM-04 유해·위험요인 파악 실제 양식"><figcaption>FORM-04 · 유해·위험요인 파악</figcaption></figure></section>` : '';
    return `<section class="academy-course-layout figma-course-body"><main class="academy-course-main figma-course-main">${workflow}${actions}${renderDesktopLearningPoints(data)}${renderDesktopCurriculum(course)}</main>${renderDesktopCourseInfo(course,data)}</section>`;
  };
  const renderDesktopSpecialThemes = (course,data) => `<section class="academy-course-special-themes figma-special-themes"><header><small>SPECIALIZED SAFETY TRAINING</small><h2>고위험 작업 분야별 4대 전문 학습 테마</h2><p>현장의 고위험 작업 유형을 선택해 분야별 핵심 행동수칙을 학습합니다.</p></header><div>${data.themes.map(([route,number,en,title,description,image]) => `<article data-progress-learning="${route}"><img src="${image}" alt=""><div><span>${number}</span><small>${en}</small><h3>${title}</h3><p>${description}</p></div><a href="#${route}">이 분야 전문 수칙 시작하기 <i>→</i></a></article>`).join('')}</div></section>`;
  const renderCourseLanding = (course) => {
    const section = document.createElement('section');
    section.className = `book-home academy-desktop-course figma-course-landing${course.accent ? ` is-${course.accent}` : ''}`;
    section.dataset.progressCourse = course.id;
    section.id = course.view;
    section.hidden = true;
    const desktopData = desktopLandingCatalog[course.id];
    section.innerHTML = `${renderDesktopCourseHeader()}${renderDesktopCourseHero(course)}${course.id === 'special' ? renderDesktopSpecialThemes(course,desktopData) : renderDesktopCourseBody(course,desktopData)}`;
    const mobile = mobileLandingCatalog[course.id];
    const mobileRows = course.chapters.map(([route,title,description],index) => {
      const [duration] = mobile.rows[index];
      const content = `<span><small>학습</small>${String(index+1).padStart(2,'0')}</span><div><strong>${title}</strong><p>${description}</p></div><aside><small>${duration}</small><em data-learning-state>미진입</em></aside>`;
      return `<li class="is-not-started" data-progress-learning="${route}"><a href="#${route}">${content}</a></li>`;
    }).join('');
    section.insertAdjacentHTML('afterbegin', `<article class="figma-mobile-course-landing${course.id === 'practical' ? ' is-light' : ''}${course.id === 'special' ? ' is-special' : ''}"><header><a href="#home">← <span>ONOFF Home</span></a><strong>${mobile.header}</strong></header><section><div><small>${mobile.tag}</small><em data-course-state>대기중</em></div><h1>${mobile.title || course.title}</h1><p>${mobile.description}</p></section><dl>${mobile.metrics.map(([icon,label,value]) => `<div><span>${icon}</span><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="figma-mobile-curriculum"><h2>${mobile.section}</h2><ol>${mobileRows}</ol></div><footer><small data-course-progress>0% · 0/${course.chapters.length} 완료</small><a href="#${mobile.ctaRoute}" data-course-continue>시작하기</a></footer></article>`);
    homeSection?.append(section);
  };
  entryCourseCatalog.forEach(renderCourseLanding);
  const riskPracticalLearning = [
    {
      id: 'risk-practical-01', number: '01', title: '작업 확인과 위험요인 파악', description: '실제 양식 작성의 첫 단계로 무엇을 평가할지 정하고 어디에 위험이 있는지 찾습니다.',
      forms: ['02','03','04'],
      sections: [
        ['STEP 01','작업 및 안전보건정보 확인','평가 대상 작업을 선정하고 현장 설비 현황, 사용 물질, 과거 사고와 아차사고 이력을 취합합니다.'],
        ['STEP 02','유해·위험요인 파악','위험요인을 기계·물질·작업환경 영역에서 찾고 대분류, 중분류, 소분류로 구체적으로 기록합니다.']
      ],
      practice: { question: "Q1. 위험성평가 양식 작성 시 가장 표준적이고 올바르게 기술된 '유해·위험요인 파악' 문구는 무엇입니까?", answer: 'B', choices: [['A','서보 모터 주변 작업은 모터가 뜨겁고 무거우므로 기계 손상이 우려됨'],['B','도어 시운전 중 정비 문을 열고 내부 조작 시 실린더 불시 작동으로 구동부 틈새에 손가락이 끼임'],['C','현장 제어 라인이 복잡하므로 특별 안전교육을 철저히 실시할 것']], explanation: '작업 상황, 위험원과 예상 재해가 구체적으로 연결된 문구를 작성합니다.' }
    },
    {
      id: 'risk-practical-02', number: '02', title: '최초 위험성과 안전조치', description: '위험의 크기를 판단하고 현재 어떤 조치를 통해 관리하고 있는지 확인합니다.',
      forms: ['01','05'],
      sections: [
        ['STEP 03','가능성과 중대성 판단','가능성 4단계와 중대성 5단계를 조합하여 위험의 크기를 객관적으로 판단합니다.'],
        ['STEP 04','최초 위험성 결정','가능성(빈도) = (사고이력 + 작업빈도) ÷ 2, 위험성 = 가능성 × 중대성 공식으로 안전조치 전 최초 위험등급을 산정합니다.'],
        ['STEP 05–06','현재 안전조치와 잔여위험','제거·대체, 공학적 제어, 관리적 제어, 개인보호구 순으로 현재 조치를 확인하고 잔여위험을 다시 산정합니다.']
      ],
      practice: { question: 'Q. 고소작업 위험을 줄이기 위해 우선 검토할 공학적 조치는 무엇입니까?', answer: 'C', choices: [['A','구두 경고와 팀 안전교육'],['B','접근 통제 유도 라인 설치'],['C','법적 규격에 맞는 고정형 표준 안전난간대 설치']], explanation: '사람의 주의보다 설비와 구조로 위험을 통제하는 공학적 조치를 우선 검토합니다.' }
    },
    {
      id: 'risk-practical-03', number: '03', title: '감소대책과 재평가', description: '추가 개선이 필요한 경우 더 근본적인 대책을 세우고 위험이 실제로 낮아졌는지 다시 확인합니다.',
      forms: ['05','06'],
      sections: [
        ['STEP 07','개선대상 여부 판단','허용 가능, 조건부 허용, 허용 불가 기준으로 개선이 필요한 위험을 구분합니다.'],
        ['STEP 08','감소대책 수립','본질적 대책, 공학적 제어, 관리적 제어, 개인보호구 순으로 더 효과적인 대책을 선택합니다.'],
        ['STEP 09','개선 후 위험성 재평가','대책 적용 후 가능성과 중대성을 다시 산정하여 위험수준이 실제로 낮아졌는지 확인합니다.'],
        ['CASE','Before vs After 비교','시운전 중 위험구역 접근 사례에서 관리적 대책보다 조작방식과 설비 구조를 개선하는 공학적 대책을 우선 검토하고 잔여위험 변화를 확인합니다.']
      ],
      practice: { question: 'Q. 위험성평가 감소대책을 수립할 때 가장 기본적이고 최우선적인 태도는 무엇입니까?', answer: 'C', choices: [['A','안전수칙 경고 표지판을 여러 곳에 부착한다'],['B','비용을 줄이기 위해 가상 평점만 낮춘다'],['C','물리적 센서나 안전 연동 기구 등 공학적인 보호수단을 우선 설계한다']], explanation: '주의 표지나 규정에 앞서 위험을 구조적으로 줄이는 본질적·공학적 대책을 우선 검토합니다.' }
    },
    {
      id: 'risk-practical-04', number: '04', title: '개선 실행과 완료 확인', description: '승인된 대책을 현장에 적용하고 완료 근거와 담당자 확인까지 기록합니다.',
      forms: ['07'],
      sections: [
        ['FLOW','감소대책 실행 사이클','감소대책 수립 → 현장 적용 → 개선 후 위험성 재평가 → 개선 완료 확인 → 결과 반영 순서로 진행합니다.'],
        ['STEP 10','감소대책 실행과 완료 확인','대책 실행내용, 개선완료일, 담당자, 완료 확인자와 사진·도면 등 개선완료 근거를 기록합니다.'],
        ['SUMMARY','위험성평가 10단계 완결','작업 확인, 위험요인 파악, 가능성·중대성 판단, 최초·현재 등급 산출, 개선대상 판단, 감소대책, 재평가와 실행 완료 확인까지 하나의 흐름으로 마무리합니다.']
      ],
      practices: [
        { question: "Q1. 4×5 Matrix에서 '최종 위험성 등급'을 결정하는 원리는 무엇입니까?", answer: 'B', choices: [['A','가능성과 중대성의 덧셈'],['B','가능성과 중대성의 곱셈'],['C','과거 사고 건수의 통계적 편차']], explanation: '최종 위험성은 가능성 등급과 중대성 등급을 곱하여 산정합니다.' },
        { question: 'Q2. 감소대책 우선순위에서 가장 마지막으로 검토할 조치는 무엇입니까?', answer: 'A', choices: [['A','개인보호구 지급 및 착용 강화'],['B','관리감독자의 일일 구두 교육'],['C','원천 제거를 위한 설계 변경']], explanation: '개인보호구는 위험원을 제거하지 못하므로 제거·대체와 공학적·관리적 조치 뒤에 검토합니다.' }
      ]
    }
  ];
  const renderRiskPracticalPractice = (practice) => `<section class="risk-practical-practice" data-answer="${practice.answer}"><b>PRACTICE</b><h2>실무 작성 자가진단</h2><p class="risk-practical-question">${practice.question}</p><div>${practice.choices.map(([value,label]) => `<button type="button" data-risk-practical-answer="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-risk-practical-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>정답: ${practice.answer}</p><p>${practice.explanation}</p><button type="button" data-risk-practical-retry>다시 풀기</button></aside></section>`;
  const renderRiskPracticalL01Ready = () => `
    <article class="risk-practical-ready risk-practical-ready-l01" data-figma-source="208:514" data-ready-inventory="sidebar|hero|step-01|form-03|step-02|form-04|practice|bottom-navigation" aria-labelledby="risk-practical-ready-l01-title">
      <aside class="risk-practical-ready-sidebar" aria-label="위험성평가 실무 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>위험성평가 실무</small>${[['01','작업 확인과 위험요인 파악','risk-practical-01-learning'],['02','최초 위험성과 안전조치','risk-practical-02-learning'],['03','감소대책과 재평가','risk-practical-03-learning'],['04','개선 실행과 완료 확인','risk-practical-04-learning']].map(([number,title,route],index)=>`<a href="#${route}"${index===0?' class="is-active" aria-current="page"':''}><span>${number}</span>${title}</a>`).join('')}<small>LIBRARY</small><a href="#risk-practical-course">양식 자료실</a></aside>
      <div class="risk-practical-ready-workspace">
        <header class="risk-practical-ready-hero"><div><p><strong>01</strong><span><b>PART 01 · 위험성평가 실무 작성</b><small>학습 01 / 04</small></span></p><h1 id="risk-practical-ready-l01-title">작업 확인과 위험요인 파악</h1><h2>작성의 첫 단계 - 무엇을 평가할지 정하고, 어디에 위험이 있는지 찾습니다.</h2></div><aside><b>이번 학습에서 작성할 양식</b><p><span>1</span>FORM-03 안전보건정보조사표</p><p><span>2</span>FORM-04 유해위험요인파악 양식</p></aside></header>
        <section class="risk-practical-ready-step is-white" data-ready-section="step-01"><header><b>STEP 01</b><h2><span>01</span>작업 및 안전보건정보 확인</h2><p>평가 대상 작업을 선정하고 안전보건공단 가이드 및 현장 설비 현황, 과거 발생한 사고 이력을 취합하여 실무 작성 준비 단계를 완성합니다.</p></header><div class="risk-practical-ready-cards"><article><h3>작업 확인 필수 핵심 항목</h3>${[['작업명 및 작업내용','구체적 공정의 이름과 실제 기계 조작 및 동선을 규정'],['관련 물질 및 사용 설비','공정에 투입되는 화학 물질(MSDS 확인) 및 정밀 기계 명세 확보'],['과거 아차사고 및 재해이력','최근 3개년 동안 동일/유사 현장에서 발생했던 부상 및 사고 기록 분석']].map(([title,text])=>`<p><i></i><span><b>${title}</b><small>${text}</small></span></p>`).join('')}</article><article class="is-tip"><h3>실무 작성 노하우 (TIP)</h3><p>“많은 실무자들이 이 단계를 형식적으로 넘어가지만, 평가 대상과 범위를 아주 협소하고 명확하게 규정할수록 구체적이고 현실성 있는 유해위험요인을 찾아낼 수 있습니다.”</p><strong>💡 범위 명확화</strong><small>광범위한 ‘제조 공정’이 아니라 ‘자동화 라인 시운전 작업’처럼 구체적으로 지정하세요.</small></article></div><figure class="risk-practical-ready-form"><figcaption>📋 실제 양식 - FORM-03 안전보건정보조사표</figcaption><img src="assets/risk-practical/forms/form-03.png" alt="FORM-03 안전보건정보조사표" loading="lazy"><p>평가 대상 작업의 기본 정보와 관련 안전보건정보를 이 영역에 기록합니다.</p><strong>✍ 양식 기입 순서</strong><small>작업명 → 관련 물질/설비 → 과거 이력 순으로 빠짐없이 채워야 유해위험요인 파악의 토대가 완성됩니다.</small></figure></section>
        <section class="risk-practical-ready-step" data-ready-section="step-02"><header><b>STEP 02</b><h2><span>02</span>유해·위험요인 파악</h2><p>현장의 잠재된 유해·위험요인(Hazard)을 인적, 물적, 작업환경적 영역에서 구조화된 체계에 따라 빠짐없이 파악하여 기록합니다.</p></header><article class="risk-practical-ready-classification"><h3>계층적 위험 파악 분류 체계</h3><div><span><small>대분류</small><b>기계 및 물리적 요소</b></span><i>→</i><span><small>중분류</small><b>자동화 설비 군</b></span><i>→</i><span><small>소분류</small><b>시운전 시 위험구역 접근</b></span></div><p>💡 <strong>실무 매뉴얼:</strong> 위험요인을 기록할 때는 단순 “기계 조심”과 같이 모호하게 쓰지 않고, “누가 어떤 작업을 하다가 어떤 설비의 어떤 동작 원인에 의해 끼이거나 추락함”과 같이 행위 중심의 명확한 문장형태로 기록해야 합니다.</p></article><figure class="risk-practical-ready-form"><figcaption>📋 실제 양식 - FORM-04 유해위험요인파악 양식</figcaption><img src="assets/risk-practical/forms/form-04.png" alt="FORM-04 유해위험요인파악 양식" loading="lazy"><p>파악된 유해·위험요인을 대분류-중분류-소분류로 구체적으로 기록합니다.</p><strong>✍ 기록 원칙</strong><small>‘기계 조심’처럼 모호하게 쓰지 않고, 행위·설비·재해 형태를 모두 포함한 문장형으로 기록해야 합니다.</small></figure></section>
        <section class="risk-practical-ready-practice risk-practical-practice" data-ready-section="practice" data-answer="B"><b>PRACTICE</b><h2>실무 작성 자가진단</h2><p>실무 양식 기입 원칙을 바탕으로 아래 적절한 유해위험요인 작성 방식을 고르세요.</p><article><h3>Q1. 위험성평가 양식 작성 시 가장 표준적이고 올바르게 기술된 ‘유해·위험요인 파악’ 문구는 무엇입니까?</h3><div>${[['A','서보 모터 주변에서 작업 시 모터가 뜨겁고 무거우므로 부상을 입을 수 있어 기계 손상 우려됨.'],['B','도어 시운전 중, 정비 문을 열고 내부 조작 시 실린더 불시 작동으로 구동부 틈새에 손가락이 끼임'],['C','현장 제어 라인이 복잡하고 난잡하므로 특별 안전교육을 통해 철저하게 대책을 세워 보완할 것.']].map(([value,label])=>`<button type="button" data-risk-practical-answer="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-risk-practical-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>작업 상황, 위험원과 예상 재해가 구체적으로 연결된 문구를 작성합니다.</p><button type="button" data-risk-practical-retry>다시 풀기</button></aside></article></section>
        <nav class="risk-practical-ready-nav" aria-label="학습 이동"><a href="#risk-practical-course">학습 목록</a><a href="#risk-practical-02-learning" data-complete-on-navigation="risk-practical-01">다음 학습 →</a></nav>
      </div>
    </article>`;
  const renderRiskPracticalL02Ready = () => {
    const matrixRows = [['1','미미',[1,2,3,4]],['2','경미',[2,4,6,8]],['3','중간',[3,6,9,12]],['4','중대',[4,8,12,16]],['5','대재해',[5,10,15,20]]];
    return `
    <article class="risk-practical-ready risk-practical-ready-l02" data-figma-source="208:688" data-ready-inventory="sidebar|hero|step-04|form-01|step-03|step-05|form-05|step-06|practice|bottom-navigation" aria-labelledby="risk-practical-ready-l02-title">
      <aside class="risk-practical-ready-sidebar" aria-label="위험성평가 실무 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>위험성평가 실무</small>${[['01','작업 확인과 위험요인 파악','risk-practical-01-learning'],['02','최초 위험성과 안전조치','risk-practical-02-learning'],['03','감소대책과 재평가','risk-practical-03-learning'],['04','개선 실행과 완료 확인','risk-practical-04-learning']].map(([number,title,route],index)=>`<a href="#${route}"${index===1?' class="is-active" aria-current="page"':''}><span>${number}</span>${title}</a>`).join('')}<small>LIBRARY</small><a href="#risk-practical-course">양식 자료실</a></aside>
      <div class="risk-practical-ready-workspace risk-practical-ready-l02-workspace">
        <header class="risk-practical-ready-hero risk-practical-ready-l02-hero"><div><p><strong>02</strong><span><b>PART 01 · 위험성평가 실무 작성</b><small>학습 02 / 04</small></span></p><h1 id="risk-practical-ready-l02-title">최초 위험성과 안전조치</h1><h2>위험의 크기를 판단하고, 현재 무엇으로 관리하고 있는지 확인합니다.</h2></div><aside><b>이번 학습에서 작성할 양식</b><p><span>1</span>FORM-01 위험성 결정 4×5 Matrix</p><p><span>2</span>FORM-05 위험성 결정 최초/현재 대조표</p></aside></header>
        <main class="risk-practical-ready-l02-content">
          <section class="risk-practical-ready-step risk-practical-l02-step04" data-ready-section="step-04"><header><b>STEP 04</b><h2><span>04</span>최초 위험성 결정</h2><p>빈도와 강도를 곱하여 최종 위험 등급(1~20)을 결정합니다. 안전 조치가 마련되지 않은 최초 상태에서의 평가입니다.</p></header><div class="risk-practical-l02-block"><h3>최초 위험성 결정</h3><p>빈도와 강도를 곱하여 최종 위험 등급(1~20)을 결정합니다.</p><div class="risk-practical-l02-matrix"><div class="matrix-head"><span>중대성 ↓ / 빈도 →</span>${[['1','매우낮음'],['2','낮음'],['3','있음'],['4','높음']].map(([n,t])=>`<b>${n}<small>${t}</small></b>`).join('')}</div>${matrixRows.map(([n,t,values])=>`<div class="matrix-row"><span>${n}<small>${t}</small></span>${values.map(value=>`<b data-risk-level="${value}">${value}</b>`).join('')}</div>`).join('')}<div class="matrix-legend"><span>1~3<small>수용가능</small></span><span>4~5<small>허용가능</small></span><span>6~11<small>조건부 허용가능</small></span><span>12~20<small>허용불가</small></span></div></div></div><div class="risk-practical-l02-block"><h3>위험성은 어떻게 계산할까요?</h3><p>두 단계 공식으로 위험성을 객관적으로 산정합니다.</p><div class="risk-practical-l02-formula"><article><b>STEP 1 · 가능성(빈도) 계산</b><div><span><small>사고이력</small>4</span><i>+</i><span><small>작업빈도</small>4</span></div><i>↓</i><em>÷ 2</em><i>↓</i><strong><small>가능성(빈도)</small>4</strong><p>(사고이력 + 작업빈도) ÷ 2</p></article><article><b>STEP 2 · 위험성 최종 산정</b><div><span><small>가능성</small>4</span><i>×</i><span><small>중대성</small>1</span></div><i>↓</i><strong class="is-safe"><small>위험성</small>4</strong><i>↓</i><em class="is-safe">허용가능 ✓</em><p>가능성 × 중대성 = 위험성</p></article></div></div><figure class="risk-practical-l02-form" data-ready-section="form-01"><figcaption><strong>실제 양식 - 위험성 수준 판단기준 (4×5 매트릭스)</strong><b>FORM-01</b></figcaption><img src="assets/risk-practical/forms/form-01.png" alt="FORM-01 위험성 수준 판단기준 4×5 매트릭스" loading="lazy"><p>가능성(4단계)과 중대성(5단계)을 교차하여 위험성 값(1~20)을 결정합니다. 위 Matrix와 동일한 구조입니다.</p><aside><h3>이 양식에서 확인할 핵심 포인트</h3>${[['01','가로축 = 가능성(빈도) 4단계','빈도 등급 1~4가 열 방향으로 배치됩니다.'],['02','세로축 = 중대성(강도) 5단계','강도 등급 1~5가 행 방향으로 배치됩니다.'],['03','교차 셀 = 위험성 값 (빈도 × 강도)','교차점 숫자가 최종 위험 등급(1~20)이며 색상으로 수준을 구분합니다.'],['04','색상 코딩으로 즉각적인 위험 수준 판단 가능','녹색(안전)→황록색(허용)→주황(조건부)→적색(불가) 순서입니다.']].map(([n,t,d])=>`<p><span>${n}</span><b>${t}</b><small>${d}</small></p>`).join('')}</aside></figure></section>
          <section class="risk-practical-ready-step is-white risk-practical-l02-step03" data-ready-section="step-03"><header><b>STEP 03</b><h2><span>03</span>가능성과 중대성 판단</h2><p>사고가 일어날 빈도를 의미하는 ‘가능성’과 사고 발생 시 치명도를 의미하는 ‘중대성’을 회사 표준 등급 가이드에 준거해 객관적으로 평가합니다.</p></header><div class="risk-practical-l02-ratings"><article><h3>가능성 (빈도) - 4단계</h3>${[['1등급','매우 낮음','사고 발생 가능성 극히 희박'],['2등급','낮음','사고가 과거에 간헐적으로 발생함'],['3등급','있음','안전조치가 미흡하여 발생 예상'],['4등급','높음','안전장치가 거의 없고 빈도가 잦음']].map(row=>`<p>${row.map((item,index)=>index===0?`<b>${item}</b>`:`<span>${item}</span>`).join('')}</p>`).join('')}</article><article><h3>중대성 (강도) - 5단계</h3>${[['1등급','미미','아주 경미한 치료로 복귀 가능'],['2등급','경미','경미한 상해 발생 (휴업 3일 미만)'],['3등급','중간','상해 또는 질병 유발 (휴업 3일 이상)'],['4등급','중대','영구 장애 또는 치명적인 골절 발생'],['5등급','대재해','현장 사망 또는 극단적 중대사고']].map(row=>`<p>${row.map((item,index)=>index===0?`<b>${item}</b>`:`<span>${item}</span>`).join('')}</p>`).join('')}</article></div></section>
          <section class="risk-practical-ready-step risk-practical-l02-step05" data-ready-section="step-05"><header><b>STEP 05</b><h2><span>05</span>현재 안전조치 확인</h2><p>위험한 공정에 대응해 현재 어떤 안전 차단막이 구축되어 있는지, 5단계 조치 우선순위 모델에 근거해 실무적으로 정확히 분류하고 가중치를 인지합니다.</p></header><ol class="risk-practical-l02-controls">${[['1단계','원천 제거 (Elimination)','위험 작업 공정을 생략하도록 공학 설계를 근본적으로 다시 구축'],['2단계','대체 (Substitution)','인화성 화학 용제를 수성 친환경 성분으로 변경'],['3단계','공학적 제어 (Engineering)','안전 센서 펜스, 비상 연동 조작 정지 장치 설치'],['4단계','관리적 제어 (Administrative)','작업 특별 승인 수칙(LOTO, SOP) 수립 및 작업자 지속 교육'],['5단계','개인보호구 (PPE)','보안경, 방진마스크, 보호 안전화 및 안전대 현장 상시 착용 조치']].map(([n,t,d])=>`<li><span>${n}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol></section>
          <section class="risk-practical-l02-form-bridge" data-ready-section="form-05"><header><span>05</span><div><b>위험성 결정 양식 — 최초 & 현재 대조</b><p>최초 위험성을 평가한 뒤, 현재 적용 중인 안전조치를 반영하여 현재 위험성을 다시 판단합니다.</p></div></header><figure><figcaption>📋 실제 양식 — 위험성 결정 (최초/현재)</figcaption><img src="assets/risk-practical/forms/form-05.png" alt="FORM-05 위험성 결정 최초 현재 대조표" loading="lazy"><p>최초 위험성과 현재 안전조치를 반영한 현재 위험성을 이 영역에 기록합니다.</p></figure></section>
          <section class="risk-practical-ready-step risk-practical-l02-step06" data-ready-section="step-06"><header><b>STEP 06</b><h2><span>06</span>현재 위험등급 산출</h2><p>현재 적용된 안전 장치들을 모두 감안했을 때, 실제 잔여 가능성과 중대성을 반영하여 현실적인 현재의 위험 수준을 판단합니다.</p></header><blockquote><strong>실무 의사결정 프로세스</strong><p>현재의 안전 수준을 반영했음에도 등급이 여전히 허용 수준(4 이하)을 초과한다면, 다음 학습에서 다룰 추가 감소대책 수립 프로세스(STEP 07) 단계로 반드시 넘어가야 합니다.</p></blockquote><article class="risk-practical-l02-current"><header><b>실제 양식 영역 시각화</b><span>FORM-05 위험성 결정 대조표 (현재 부분)</span></header><h3>[최초 대비 현재 안전조치 반영 후 잔여위험 산출]</h3><p>※ 아래 점선 테두리 항목을 순서대로 양식에 기입합니다.</p><div>${[['안전조치 적용사항','수동 도어 연동센서 및 다인수 정위치 조작장치 적용'],['조치 후 가능성','2 (낮음)'],['조치 후 중대성','3 (유지)'],['최종 현재 위험도','6 (조건부 허용 - 계획 수립 필요)']].map(([t,d])=>`<span><small>${t}</small><b>${d}</b></span>`).join('')}</div></article></section>
          <section class="risk-practical-ready-practice risk-practical-practice" data-ready-section="practice" data-answer="C"><b>PRACTICE</b><h2>실무 적용 지식 점검</h2><p>위험 통제 최우선의 원칙을 제대로 적용했는지 검토해 보시기 바랍니다.</p><article><h3>Q2. 2m 이상 고소 부위에 난간 미설치로 인해 추락 위험이 존재하여 조치 전 최초 위험성이 허용 불가능한 ‘12등급’으로 산정되었습니다. 실무적으로 적용 가능한 대책 중 우선순위가 가장 높고 근본적인 안전 조치는 무엇입니까?</h3><div>${[['A','고소 작업 시 가급적 조심해서 작업하도록 구두 경고 및 팀 안전 교육 전개'],['B','작업 장소에 접근을 차단하기 위한 통제 유도 라인을 가설하고 펜스를 우회하게 변경'],['C','도장 발판 가장자리에 법적 규격에 합치하는 고정형 표준 안전 난간대 설치']].map(([value,label])=>`<button type="button" data-risk-practical-answer="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-risk-practical-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>사람의 주의보다 설비와 구조로 위험을 통제하는 공학적 조치를 우선 검토합니다.</p><button type="button" data-risk-practical-retry>다시 풀기</button></aside></article></section>
          <nav class="risk-practical-ready-nav" aria-label="학습 이동"><a href="#risk-practical-01-learning">← 이전 학습</a><a href="#risk-practical-course">학습 목록</a><a href="#risk-practical-03-learning" data-complete-on-navigation="risk-practical-02">다음 학습 →</a></nav>
        </main>
      </div>
    </article>`;
  };
  const renderRiskPracticalL03Ready = () => `
    <article class="risk-practical-ready risk-practical-ready-l03" data-figma-source="208:940" data-ready-inventory="sidebar|hero|step-07|step-08|form-06|step-09|form-05|practice|bottom-navigation" aria-labelledby="risk-practical-ready-l03-title">
      <aside class="risk-practical-ready-sidebar" aria-label="위험성평가 실무 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>위험성평가 실무</small>${[['01','작업 확인과 위험요인 파악','risk-practical-01-learning'],['02','최초 위험성과 안전조치','risk-practical-02-learning'],['03','감소대책과 재평가','risk-practical-03-learning'],['04','개선 실행과 완료 확인','risk-practical-04-learning']].map(([number,title,route],index)=>`<a href="#${route}"${index===2?' class="is-active" aria-current="page"':''}><span>${number}</span>${title}</a>`).join('')}<small>LIBRARY</small><a href="#risk-practical-course">양식 자료실</a></aside>
      <div class="risk-practical-ready-workspace risk-practical-ready-l03-workspace">
        <header class="risk-practical-ready-hero risk-practical-ready-l03-hero"><div><p><strong>03</strong><span><b>PART 01 · 위험성평가 실무 작성</b><small>학습 03 / 04</small></span></p><h1 id="risk-practical-ready-l03-title">감소대책과 재평가</h1><h2>추가 개선이 필요한 경우, 더 근본적인 대책을 세우고 위험이 실제로 낮아졌는지 다시 확인합니다.</h2></div><aside><b>이번 학습에서 작성할 양식</b><p><span>1</span>FORM-06 감소대책수립 조사표</p><p><span>2</span>FORM-05 위험성 결정 최초/현재/개선후 대조표</p></aside></header>
        <main class="risk-practical-ready-l03-content">
          <section class="risk-practical-ready-step risk-practical-l03-step07" data-ready-section="step-07"><header><b>STEP 07</b><h2><span>07</span>위험 감소대책 수립 대상 선정</h2><p>현재 위험등급이 안전 기준을 초과하면 정식 개선 대상이 됩니다. 무조건 새로운 대책을 억지로 수립하는 비효율을 방지하고 합리적인 등급 가이드에 준거해 자원을 배분합니다.</p></header><div class="risk-practical-l03-two"><article><h3>위험수준별 통제 및 개선 원칙</h3>${[['허용 가능 (1~5등급)','현재 안전 장치가 충분함. 추가 대책 필요 없이 현 수준 유지 관리'],['조건부 허용 가능 (6~11등급)','개선 계획을 수립하고 모니터링을 거쳐 제한적 승인 하에 작업 진행'],['허용 불가 (12~20등급)','즉시 작업을 중지하고 위험 감소를 위한 근본 대책 수립 필수']].map(([t,d])=>`<p><i></i><span><b>${t}</b><small>${d}</small></span></p>`).join('')}</article><article class="is-key"><h3>실무 적용 핵심 포인트 (KEY)</h3><p>“현장에서 가장 흔히 저지르는 실수가 모든 자잘한 위험에 새로운 장치를 도입해 작업 생산성을 저해하는 것입니다. 합리적인 등급을 기준으로 선택과 집중에 초점을 맞추어야 안전 실무가 지속 가능합니다.”</p><strong>✓ 합리적인 위험등급 기준 적용</strong></article></div></section>
          <section class="risk-practical-ready-step is-white risk-practical-l03-step08" data-ready-section="step-08"><header><b>STEP 08</b><h2><span>08</span>본질적·공학적 감소대책 수립</h2><p>우선순위에 입각하여 위험 요인을 경감할 최적의 방안을 강구합니다. 단순한 '작업자 교육 철저'가 아닌 기술적 차단막을 마련합니다.</p></header><div class="risk-practical-l03-block"><h3>감소대책은 어떻게 반영할까요?</h3><p>현재 위험성이 개선대상이라면 위험을 더 낮추기 위한 감소대책을 수립합니다. 가능하면 사람의 주의에만 의존하기보다 더 근본적인 대책부터 검토합니다.</p></div><div class="risk-practical-l03-block"><h3>감소대책의 종류와 우선순위</h3><p>실제 양식 기준으로 4가지 대책 유형과 가중치를 확인합니다.</p><div class="risk-practical-l03-control-cards">${[['최우선','본질적 대책','제거 / 대체','위험요인 자체를 없애거나 더 안전한 방법으로 변경하는 대책'],['가중치 0.5','공학적 제어','방호시설 · 경보·감지장치 · 제어장치','설비·장치·구조적인 방법으로 위험을 줄이는 대책'],['가중치 0.2','관리적 제어','교육 및 훈련 · 점검활동 · 현장작업 관리','작업방법과 관리체계를 통해 위험을 줄이는 대책'],['가중치 0.1','개인보호구','개인보호구','개인보호구를 통해 작업자를 보호하는 대책']].map(([w,t,k,d],i)=>`<article class="control-${i+1}"><em>${w}</em><h4>${t}</h4><b>${k}</b><p>${d}</p></article>`).join('')}</div></div><figure class="risk-practical-l03-form form-06" data-ready-section="form-06"><figcaption><strong>실제 양식 - 감소대책 수립 (FORM-06)</strong><b>FORM-06</b></figcaption><img src="assets/risk-practical/forms/form-06.png" alt="FORM-06 감소대책 수립 조사표" loading="lazy"><p>실제 양식에서 본질적 대책·공학적 제어·관리적 제어·개인보호구 열을 구분하여 각 대책 내용을 기록합니다.</p><aside><h3>양식에서 확인할 핵심 포인트</h3>${[['01','본질적 대책','제거·대체를 가장 먼저 검토합니다.'],['02','공학적 제어','설비와 구조로 위험을 낮춥니다.'],['03','관리적 제어','작업방법과 관리체계를 보완합니다.'],['04','개인보호구','마지막 방어수단으로 적용합니다.']].map(([n,t,d])=>`<p><span>${n}</span><b>${t}</b><small>${d}</small></p>`).join('')}</aside></figure><div class="risk-practical-l03-flow"><h3>대책 선택이 위험성 재평가로 이어지는 흐름</h3><p>선택한 대책 유형에는 실제 양식 기준의 가중치가 부여되며, 이를 적용한 후 위험성을 재평가합니다.</p><div><span><small>감소대책 선택</small><b>공학적 0.5 · 관리적 0.2 · 보호구 0.1</b></span><i>→</i><span><small>대책 적용</small><b>실행</b></span><i>→</i><span><small>③ 개선 후 위험등급</small><b>위험성 재평가</b></span><i>→</i><span><small>수용 가능 여부</small><b>✓</b></span></div></div><div class="risk-practical-l03-recheck"><h3>③ 개선 후 위험등급 재평가</h3><p>감소대책을 세우는 것으로 끝나지 않습니다. 대책을 적용한 뒤 위험성을 다시 평가하여 실제로 위험수준이 낮아졌는지 확인합니다.</p><div>${[['1','중대성','개선 후 피해 규모 재산정'],['2','가능성','개선 후 발생 빈도 재산정'],['3','위험등급','가능성 × 중대성 재계산'],['4','위험성 결정','수용 가능 여부 최종 판단']].map(([n,t,d])=>`<span><b>${n}</b><strong>${t}</strong><small>${d}</small></span>`).join('')}</div></div><div class="risk-practical-l03-execution"><h3>대책 실행과 완료 확인</h3><p>평가 → 개선 → 실행 → 확인의 흐름으로 완결됩니다.</p><div>${[['📝','대책 실행내용'],['📅','개선완료일'],['👤','개선 담당자'],['✅','완료 확인자'],['📎','개선완료 근거']].map(([icon,t],i)=>`${i?'<i>→</i>':''}<span><b>${icon}</b><small>${t}</small></span>`).join('')}</div></div><article class="risk-practical-l03-case"><h3>실무 적용 사례</h3><p>DS제어팀 사례로 감소대책 선택 흐름을 확인합니다.</p><strong>🔍 위험 상황: 시운전 중 작업자 위험구역 접근</strong><div><span><small>관리적 대책 (초기 검토)</small><b>교육 / 작업자 관리</b><em>가중치 0.2 - 사람 주의에 의존</em></span><i>→</i><span><small>공학적 대책 (근본 검토)</small><b>조작방식 또는 설비 구조 개선</b><em>가중치 0.5 - 설비 메커니즘 변경</em></span><i>→</i><span><small>대책 적용 후</small><b>위험성 재평가</b><em>수용 가능 여부 최종 확인</em></span></div><blockquote>💡 사람의 주의에 의존하는 관리적 대책보다, 설비 메커니즘을 변경하는 공학적 대책이 더 높은 위험 방지 효과를 발휘합니다. 가능한 한 본질적·공학적 대책을 우선 검토하세요.</blockquote></article></section>
          <section class="risk-practical-ready-step risk-practical-l03-step09" data-ready-section="step-09"><header><b>STEP 09</b><h2><span>09</span>개선 후 위험등급 재평가</h2><p>대책 수립에 그치지 않고, 가상으로 그 조치가 가설 완료되었다는 전제하에 위험도가 어떻게 변화할지 2차 산출합니다.</p></header><article class="risk-practical-l03-before-after"><h3>위험성 변화 비교 (Before vs After)</h3><div><span><small>조치 전 (최초 위험수준)</small><b>12등급 (허용 불가)</b><em>가동 빈도 높고 (4) 골절 사고 가능성 상존 (3)</em></span><span><small>조치 후 (잔여 위험수준)</small><b>2등급 (수용 가능)</b><em>2인 정위치 조작으로 오인 기동 불가 (빈도 1, 강도 2)</em></span></div></article><div class="risk-practical-l03-form-focus"><header><b>실제 양식 영역 시각화 (FORM-05 개선후 부분)</b><span>FORM-05 위험성대조 대장</span></header><div>${[['대책 후 빈도','1 (극히 낮음)'],['대책 후 강도','2 (경미 상해)'],['개선 후 잔여위험','2등급 (수용가능)']].map(([t,d])=>`<span><small>${t}</small><b>${d}</b></span>`).join('')}</div></div><figure class="risk-practical-l03-form form-05" data-ready-section="form-05"><figcaption><strong>📋 실제 양식 — 개선 후 위험성 재평가</strong><small>감소대책 적용 후 가능성과 중대성을 재산출하여 위험이 실제로 낮아졌는지 확인합니다.</small></figcaption><img src="assets/risk-practical/forms/form-05.png" alt="FORM-05 개선 후 위험성 재평가 영역" loading="lazy"><p>📌 재평가 핵심 원칙 — 개선 후 잔여위험 등급이 허용 기준 이내인지 반드시 확인하고, 미달 시 추가 대책을 재수립합니다.</p></figure></section>
          <section class="risk-practical-ready-practice risk-practical-practice" data-ready-section="practice" data-answer="C"><b>PRACTICE</b><h2>실무 작성 자가진단</h2><p>감소대책의 수립 방향과 잔여위험 재평가의 핵심 원리를 온전히 파악했는지 확인해 보세요.</p><article><h3>Q. 위험성평가 감소대책을 수립할 때, 실무자들이 취해야 할 가장 기본적이고 최우선적인 태도는 무엇입니까?</h3><div>${[['A','작업 오류가 없도록 안전 수칙 경고 표지판을 도어 곳곳에 중복해서 밀도 높게 부착한다.'],['B','설비 개선에는 시간과 비용이 소요되므로, 수용가능한 수준으로 가상 평점만 낮추어 마무리한다.'],['C','주의 표지나 규정 신설보다는, 물리적 센서나 안전 연동 기구 등 공학적인 보호 격벽을 우선적으로 설계한다.']].map(([value,label])=>`<button type="button" data-risk-practical-answer="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-risk-practical-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>사람의 주의에 의존하기보다 위험원 제거와 설비·구조 개선을 우선하고, 적용 후 잔여위험을 재평가합니다.</p><button type="button" data-risk-practical-retry>다시 풀기</button></aside></article></section>
          <nav class="risk-practical-ready-nav" aria-label="학습 이동"><a href="#risk-practical-02-learning">← 이전 학습</a><a href="#risk-practical-course">학습 목록</a><a href="#risk-practical-04-learning" data-complete-on-navigation="risk-practical-03">다음 학습 →</a></nav>
        </main>
      </div>
    </article>`;
  const renderRiskPracticalL04Ready = () => `
    <article class="risk-practical-ready risk-practical-ready-l04" data-figma-source="208:1120" data-ready-inventory="sidebar|hero|reduction-action|step-10|form-07|sprint-summary|practice-01|practice-02|course-complete|bottom-navigation" aria-labelledby="risk-practical-ready-l04-title">
      <aside class="risk-practical-ready-sidebar" aria-label="위험성평가 실무 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>위험성평가 실무</small>${[['01','작업 확인과 위험요인 파악','risk-practical-01-learning'],['02','최초 위험성과 안전조치','risk-practical-02-learning'],['03','감소대책과 재평가','risk-practical-03-learning'],['04','개선 실행과 완료 확인','risk-practical-04-learning']].map(([number,title,route],index)=>`<a href="#${route}"${index===3?' class="is-active" aria-current="page"':''}><span>${number}</span>${title}</a>`).join('')}<small>LIBRARY</small><a href="#risk-practical-course">양식 자료실</a></aside>
      <div class="risk-practical-ready-workspace risk-practical-ready-l04-workspace">
        <header class="risk-practical-ready-hero risk-practical-ready-l04-hero"><div><p><strong>04</strong><span><b>PART 01 · 위험성평가 실무 작성</b><small>학습 04 / 04</small></span></p><h1 id="risk-practical-ready-l04-title">개선 실행과 완료 확인</h1><h2>감소대책의 수립에서 끝나지 않습니다. 실행을 추적하고, 현장을 확인하고, 문서로써 증적을 확고히 남깁니다.</h2></div><aside><b>이번 학습에서 작성할 양식</b><p><span>1</span>FORM-07 감소대책 개선실행 대장</p></aside></header>
        <main class="risk-practical-ready-l04-content">
          <section class="risk-practical-l04-cycle" data-ready-section="reduction-action"><header><b>감소대책 실행 사이클</b><h2><span>10</span>감소대책은 실행과 확인까지 이어집니다</h2><p>감소대책은 작성하는 것으로 끝나지 않습니다. 실제 현장에 적용하고, 적용 결과를 다시 평가한 뒤 완료 근거까지 확인해야 합니다.</p></header><article class="risk-practical-l04-key"><b>핵심 학습 포인트</b><strong>① 감소대책은 작성하는 것으로 끝나지 않습니다.</strong><p>실제 현장에 적용하고, 적용 결과를 다시 평가한 뒤 완료 근거까지 확인해야 합니다.</p></article><div class="risk-practical-l04-cycle-grid">${[['01','PLAN','감소대책 수립','무엇을 개선할지 결정합니다. 제거/대체 → 공학적 제어 → 관리적 제어 → 개인보호구 순으로 우선 검토.','제거/대체 · 공학적 제어 · 관리적 제어 · 개인보호구'],['02','EXECUTE','현장 적용','결정한 감소대책을 실제 작업/설비에 반영합니다.','설비 개선 · 작업 절차 변경'],['03','RE-ASSESS','개선 후 위험성 재평가','대책 적용 뒤 위험성을 다시 평가합니다. ③ 개선 후 위험등급: 중대성 + 가능성 → 위험등급 → 위험성 결정','중대성 · 가능성 · 위험등급'],['04','VERIFY','개선 완료 확인','실제 적용 여부를 확인합니다. 대책 실행내용 · 개선완료일 · 개선 담당자 · 완료 확인자','실행 내용 · 완료일 · 담당자 · 확인자'],['05','EVIDENCE','결과 반영','개선 완료 근거를 남깁니다. 감소대책 수립 및 실행결과 · 관련 개선자료/링크','도면 · 사진 · 링크']].map(([n,en,t,d,tags])=>`<article><header><span>${n}</span><div><small>${en}</small><b>${t}</b></div></header><p>${d}</p><em>${tags}</em></article>`).join('')}</div><article class="risk-practical-l04-case"><strong>🔍 DS 사례: 시운전 중 작업자 위험구역 접근</strong><div>${[['BEFORE','위험상황','시운전 중 작업자가 설비 위험구역에 접근 가능성'],['ACTION','근본적 대책','조작방식 개선 등 근본적 감소대책 적용'],['RESULT','완료 확인','개선 후 위험성 재평가 → 완료 확인 → 근거 기록']].map(([s,t,d])=>`<span><small>${s}</small><b>${t}</b><em>${d}</em></span>`).join('')}</div></article><div class="risk-practical-l04-form-cta"><b>실제 양식에서는 어디에 기록할까요? ↓</b><span>STEP 10: 개선 실행 및 완료 확인　↓</span></div></section>
          <section class="risk-practical-ready-step risk-practical-l04-step10" data-ready-section="step-10"><header><b>STEP 10</b><h2><span>10</span>개선 실행 및 완료 확인</h2><p>최종 수립된 대책의 실체적인 구현 여부를 실무 담당자가 직접 검토하여 사진, 도면 등의 증빙을 기록물에 매핑시킵니다.</p></header><article class="risk-practical-l04-key"><b>핵심 학습 포인트</b><strong>감소대책은 수립하는 것으로 끝나지 않습니다.</strong><p>실행 후 위험성을 다시 평가하고, 개선이 완료되었는지 근거와 함께 확인합니다.</p></article><div class="risk-practical-l04-guide">${[['01','대책 수립','무엇을 개선할지 결정'],['02','실행','결정한 감소대책 적용'],['03','재평가','③ 개선 후 위험등급 확인'],['04','완료 확인','완료일·담당자·확인자 기록'],['05','근거','실행결과 및 개선자료 연결']].map(([n,t,d])=>`<span><b>${n}</b><strong>${t}</strong><small>${d}</small></span>`).join('')}</div><figure class="risk-practical-l04-form" data-ready-section="form-07"><figcaption><strong>실제 양식 영역 시각화 (FORM-07)</strong><b>FORM-07 개선실행 대장</b></figcaption><img src="assets/risk-practical/forms/form-07.png" alt="FORM-07 감소대책 개선실행 대장" loading="lazy"><p>감소대책의 실행내용, 개선완료일, 담당자, 완료 확인, 개선완료 근거를 이 영역에 기록합니다.</p><aside><h3>양식 작성 핵심 포인트</h3>${[['①','실행내용 기재','수립된 감소대책을 구체적인 실행 내용으로 기재하고 관련 도면·사진을 첨부합니다.'],['②','개선완료일 및 담당자 확인','실제 완료된 날짜와 담당자 서명을 명기하여 실행 책임을 명확히 합니다.'],['③','안전부서 최종 승인','현장 확인 후 안전담당 부서의 완료 승인 서명을 받아 문서를 완결합니다.']].map(([n,t,d])=>`<p><span>${n}</span><b>${t}</b><small>${d}</small></p>`).join('')}</aside></figure></section>
          <section class="risk-practical-l04-summary" data-ready-section="sprint-summary"><header><h2>위험성평가 10단계 실무 프로세스 요약</h2><p>우리가 학습한 실무 작성 10단계 흐름을 시각적으로 도식화하여 머릿속에 각인시킵니다.</p></header><div>${[['01','작업 확인'],['02','위험요인 파악'],['03','빈도·강도 판단'],['04','최초 등급 산출'],['05','안전조치 확인'],['06','현재 등급 산출'],['07','개선대상 판단'],['08','감소대책 수립'],['09','개선후 재평가'],['10','실행 완료 확인']].map(([n,t])=>`<span${n==='10'?' class="is-current"':''}><small>STEP ${n}</small><b>${t}</b></span>`).join('')}<blockquote>📌 <strong>실무자 슬로건:</strong> 위험성평가는 등급을 매기는 것으로 끝나지 않으며, 궁극적으로 개선 대책이 현장에 실제로 실행되었는지(Step 10) 확인하고 완결지을 때 마침내 완벽해집니다.</blockquote></div></section>
          <section class="risk-practical-l04-practices"><header><b>COMPREHENSIVE TEST</b><h2>과정 완료 종합 점검</h2><p>위험성평가 작성의 전 단계를 아우르는 실무 이론 지식을 총망라해 평가합니다.</p></header><section class="risk-practical-ready-practice risk-practical-practice" data-ready-section="practice-01" data-answer="B"><article><h3>Q1. 위험성평가 4×5 Matrix 기법에서 '최종 위험성 등급'을 규명하는 수학적 결합 원리는 무엇입니까?</h3><div>${[['A','사고 발생 가능성(빈도) 수치와 사고 발생 시 치명도(중대성) 수치의 단순 덧셈 결합'],['B','사고 발생 빈도(가능성) 등급값과 사고 발생 강도(중대성) 등급값의 기하학적 곱셈법'],['C','과거 3개년 동안 실제로 발생했던 아차사고 건수를 활용한 통계적 편차의 산출']].map(([v,t])=>`<button type="button" data-risk-practical-answer="${v}"><span>${v}</span>${t}</button>`).join('')}</div><button type="button" data-risk-practical-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>가능성 등급과 중대성 등급을 곱하여 최종 위험성 등급을 산출합니다.</p><button type="button" data-risk-practical-retry>다시 풀기</button></aside></article></section><section class="risk-practical-ready-practice risk-practical-practice" data-ready-section="practice-02" data-answer="A"><article><h3>Q2. 감소 대책의 5단계 조치 우선순위 수립 원칙 중 가장 마지막으로 검토되어야 하는 가장 수동적인 조치는 무엇입니까?</h3><div>${[['A','개인보호구(PPE) 지급 및 착용 강화'],['B','관리 감독자에 의한 수동적인 일일 구두 안전 훈계'],['C','원천 제거를 위한 전반적인 설계 리스크 회피 설계 변경']].map(([v,t])=>`<button type="button" data-risk-practical-answer="${v}"><span>${v}</span>${t}</button>`).join('')}</div><button type="button" data-risk-practical-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>개인보호구는 위험원을 제거하지 못하는 마지막 방어수단입니다.</p><button type="button" data-risk-practical-retry>다시 풀기</button></aside></article></section></section>
          <section class="risk-practical-l04-complete" data-ready-section="course-complete"><h2>과정 완료</h2><strong>위험성평가 실무 작성 교육 완료</strong><p>축하합니다! 위험 요인 확인부터 현장 개선 완료 승인 증빙 확보까지, 실무 조사표를 규격대로 정확히 기입하기 위한 모든 훈련을 성공적으로 마쳤습니다.</p></section>
          <nav class="risk-practical-ready-nav" aria-label="학습 이동"><a href="#risk-practical-03-learning">← 이전 학습</a><a href="#risk-practical-course">학습 목록</a><a href="#risk-practical-course" data-complete-on-navigation="risk-practical-04">목차 전체 완료 ✓</a></nav>
        </main>
      </div>
    </article>`;
  const documentRoot = document.querySelector('.document');
  riskPracticalLearning.forEach((learning) => {
    const section = document.createElement('section');
    section.className = 'manual-section risk-practical-learning';
    section.id = learning.id;
    section.hidden = true;
    section.innerHTML = `<section class="risk-practical-content"><header class="risk-practical-hero"><p>COURSE 03 · RISK PRACTICAL · 학습 ${learning.number}</p><strong>${learning.number}</strong><h2>${learning.title}</h2><span>${learning.description}</span><div><small>진행률 ${Number(learning.number) * 25}%</small><small>학습 ${learning.number} / 04</small></div></header><div class="risk-practical-sections">${learning.sections.map(([tag,title,body]) => `<section><b>${tag}</b><h2>${title}</h2><p>${body}</p></section>`).join('')}</div><section class="risk-practical-forms"><header><b>ACTUAL FORM</b><h2>실제 양식에서 확인하기</h2><p>확대하여 실제 작성 영역과 항목을 확인합니다.</p></header><div>${learning.forms.map((form) => `<figure><img src="assets/risk-practical/forms/form-${form}.png" alt="FORM-${form} 위험성평가 실무 양식" loading="lazy"><figcaption>FORM-${form}</figcaption></figure>`).join('')}</div></section>${(learning.practices || [learning.practice]).map(renderRiskPracticalPractice).join('')}${learning.number === '04' ? '<section class="risk-practical-course-complete"><b>COURSE COMPLETE</b><h2>위험성평가 실무 작성 교육 완료</h2><p>위험요인 확인부터 현장 개선 완료 증빙까지 실무 작성의 전체 흐름을 확인했습니다.</p></section>' : ''}</section><nav class="chapter-reading-nav" aria-label="학습 이동"></nav>${learning.id === 'risk-practical-01' ? renderRiskPracticalL01Ready() : learning.id === 'risk-practical-02' ? renderRiskPracticalL02Ready() : learning.id === 'risk-practical-03' ? renderRiskPracticalL03Ready() : learning.id === 'risk-practical-04' ? renderRiskPracticalL04Ready() : ''}`;
    documentRoot?.append(section);
    chapters.push(section);
    chapterIndex.push({ id: learning.id, title: learning.title, description: learning.description });
    section.querySelectorAll('.risk-practical-practice').forEach((practiceRoot) => {
      const choices = [...practiceRoot.querySelectorAll('[data-risk-practical-answer]')];
      const check = practiceRoot.querySelector('[data-risk-practical-check]');
      const result = practiceRoot.querySelector('aside');
      choices.forEach((choice) => choice.addEventListener('click', () => { choices.forEach((item) => item.classList.toggle('is-selected', item === choice)); check.disabled = false; }));
      check.addEventListener('click', () => { const selected = choices.find((item) => item.classList.contains('is-selected')); if (!selected) return; const correct = selected.dataset.riskPracticalAnswer === practiceRoot.dataset.answer; choices.forEach((item) => { item.disabled = true; item.classList.remove('is-selected'); item.classList.toggle('is-correct', item.dataset.riskPracticalAnswer === practiceRoot.dataset.answer); item.classList.toggle('is-incorrect', item === selected && !correct); }); check.disabled = true; result.hidden = false; result.querySelector('strong').textContent = correct ? 'Correct' : practiceRoot.closest('.risk-practical-ready') ? 'Incorrect · Hint를 확인하고 다시 시도하세요.' : 'Incorrect'; });
      practiceRoot.querySelector('[data-risk-practical-retry]').addEventListener('click', () => { choices.forEach((item) => { item.disabled = false; item.classList.remove('is-selected','is-correct','is-incorrect'); }); check.disabled = true; result.hidden = true; choices[0]?.focus(); });
    });
  });
  const academyImageViewer = document.createElement('dialog');
  academyImageViewer.className = 'academy-image-viewer';
  academyImageViewer.setAttribute('aria-labelledby', 'academy-image-viewer-title');
  academyImageViewer.innerHTML = `<header class="academy-image-viewer-toolbar"><button type="button" data-image-viewer-back><span>←</span> 돌아가기</button><h2 id="academy-image-viewer-title">학습 이미지</h2><div><small>ESC</small><button type="button" data-image-viewer-close>닫기 <span>✕</span></button></div></header><div class="academy-image-viewer-separator"></div><div class="academy-image-viewer-canvas"><img alt=""></div>`;
  document.body.append(academyImageViewer);
  const academyViewerImage = academyImageViewer.querySelector('img');
  const academyViewerTitle = academyImageViewer.querySelector('h2');
  let academyViewerTrigger = null;
  let academyViewerHistoryActive = false;
  let academyViewerScrollY = 0;
  const closeAcademyImageViewer = ({ fromHistory = false } = {}) => {
    if (!academyImageViewer.open) return;
    academyImageViewer.close();
    document.body.classList.remove('is-academy-image-viewer-open');
    if (!fromHistory && academyViewerHistoryActive) history.back();
    academyViewerHistoryActive = false;
    window.scrollTo({ top: academyViewerScrollY, behavior: 'auto' });
    academyViewerTrigger?.focus({ preventScroll: true });
  };
  const openAcademyImageViewer = ({ src, alt, title, trigger }) => {
    if (!src || !academyViewerImage || !academyViewerTitle) return;
    academyViewerTrigger = trigger;
    academyViewerScrollY = window.scrollY;
    academyViewerImage.src = src;
    academyViewerImage.alt = alt || title || '확대된 학습 이미지';
    academyViewerTitle.textContent = title || alt || '학습 이미지';
    document.body.classList.add('is-academy-image-viewer-open');
    academyImageViewer.showModal();
    history.pushState({ academyImageViewer: true }, '');
    academyViewerHistoryActive = true;
  };
  academyImageViewer.querySelector('[data-image-viewer-back]').addEventListener('click', () => closeAcademyImageViewer());
  academyImageViewer.querySelector('[data-image-viewer-close]').addEventListener('click', () => closeAcademyImageViewer());
  academyImageViewer.addEventListener('cancel', (event) => { event.preventDefault(); closeAcademyImageViewer(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && academyImageViewer.open) closeAcademyImageViewer(); });
  window.addEventListener('popstate', () => { if (academyImageViewer.open) closeAcademyImageViewer({ fromHistory: true }); });
  document.querySelectorAll('.manual-section figure img, figure img[data-viewer-title]').forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `${image.alt || '학습 이미지'} 확대 보기`);
  });
  const openLearningFigure = (image) => openAcademyImageViewer({ src: image.currentSrc || image.src, alt: image.alt, title: image.closest('figure')?.querySelector('figcaption')?.textContent.trim() || image.alt, trigger: image });
  document.addEventListener('click', (event) => {
    const image = event.target.closest?.('.manual-section figure img, figure img[data-viewer-title]');
    if (image) openLearningFigure(image);
  });
  document.addEventListener('keydown', (event) => {
    const image = event.target.closest?.('.manual-section figure img, figure img[data-viewer-title]');
    if (image && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openLearningFigure(image); }
  });
  const bookChapterForm = [
    { id: 'philosophy', book: 'platform', part: '01', partTitle: 'Platform', chapter: '01', title: 'ONOFF의 안전철학과 Platform 구조', next: 'workflow' },
    { id: 'workflow', book: 'platform', chapter: '02', title: '전체 Workflow', previous: 'philosophy', next: 'daily-work' },
    { id: 'daily-work', book: 'platform', part: '02', partTitle: 'Daily Safety', chapter: '03', title: "Today's Work", previous: 'workflow', next: 'safety-report' },
    { id: 'safety-report', book: 'platform', part: '03', partTitle: 'Safety Operation', chapter: '04', title: 'Safety Report', previous: 'daily-work' },
    { id: 'tbm-purpose', book: 'tbm', chapter: '01', title: 'TBM의 목적과 기본 원칙' },
    { id: 'tbm-nine-steps', book: 'tbm', chapter: '02', title: 'TBM 진행 9단계' },
    { id: 'tbm-scenario', book: 'tbm', chapter: '03', title: 'TBM 진행 시나리오' },
    { id: 'tbm-life-rules', book: 'tbm', chapter: '04', title: '생명안전수칙 10' },
    { id: 'sop-purpose', book: 'sop', chapter: '01', title: 'SOP의 목적과 핵심 구조', progressTotal: 4 },
    { id: 'sop-reading', book: 'sop', chapter: '02', title: 'SOP 읽는 방법', progressTotal: 4 },
    { id: 'sop-structure', book: 'sop', chapter: '03', title: 'SOP 구성과 작성 구조', progressTotal: 4 },
    { id: 'sop-practice', book: 'sop', chapter: 'PRACTICE', label: 'PRACTICE 01', title: '작업순서와 Safety Step 찾아보기', progressTotal: 4, countInProgress: false },
    { id: 'sop-platform', book: 'sop', part: '2', chapter: '04', title: 'Platform에서 SOP 활용', progressTotal: 4 },
    { id: 'risk-assessment-purpose', book: 'risk', part: '1', chapter: '01', title: '위험성평가의 목적과 기본 원칙', progressTotal: 4 },
    { id: 'risk-assessment-structure', book: 'risk', part: '1', chapter: '02', title: '위험성평가 구성 이해', progressTotal: 5 },
    { id: 'risk-assessment-stra', book: 'risk', part: '1', chapter: '03', title: 'S-TRA 위험성 판단 이해', progressTotal: 5 },
    { id: 'risk-assessment-daily-safety', book: 'risk', part: '2', chapter: '04', title: 'Daily Safety', progressTotal: 5 },
    { id: 'risk-assessment-platform', book: 'risk', part: '2', chapter: '05', title: 'Platform에서 위험성평가 활용', progressTotal: 5 }
    ,{ id: 'special-education-intro', book: 'special', chapter: '01', title: '특별안전교육이란?', progressTotal: 7 }
    ,{ id: 'special-common-training', book: 'special', chapter: '02', title: '공통교육', progressTotal: 7 }
    ,{ id: 'special-cargo-handling', book: 'special', chapter: '03', title: '13번 · 운반·하역기계 작업', progressTotal: 7 }
    ,{ id: 'special-live-work-75v', book: 'special', chapter: '04', title: '17번 · 전압 75V 이상 정전·활선 작업', progressTotal: 7 }
    ,{ id: 'special-hazardous-chemicals', book: 'special', chapter: '05', title: '35번 · 유해물질 제조·취급 작업', progressTotal: 7 }
    ,{ id: 'special-robot-work', book: 'special', chapter: '06', title: '36번 · 로봇작업', progressTotal: 7 }
    ,{ id: 'special-daily-work', book: 'special', part: '02', chapter: '07', title: 'Daily Work 연계', progressTotal: 7 }
    ,{ id: 'risk-practical-01', book: 'practical', part: '1', chapter: '01', title: '작업 확인과 위험요인 파악', progressTotal: 4 }
    ,{ id: 'risk-practical-02', book: 'practical', part: '1', chapter: '02', title: '최초 위험성과 안전조치', progressTotal: 4 }
    ,{ id: 'risk-practical-03', book: 'practical', part: '2', chapter: '03', title: '감소대책과 재평가', progressTotal: 4 }
    ,{ id: 'risk-practical-04', book: 'practical', part: '2', chapter: '04', title: '개선 실행과 완료 확인', progressTotal: 4 }
  ];
  bookChapterForm.forEach((item) => {
    const chapter = document.getElementById(item.id);
    if (!chapter) return;
    chapter.classList.add('book-chapter-reading');
    chapter.dataset.chapter = item.chapter;
    const sourceHeading = chapter.querySelector('.section-heading, .chapter-header');
    const description = sourceHeading?.querySelector('p:last-child')?.textContent.trim() || '이 학습의 핵심 Workflow를 확인합니다.';
    const start = document.createElement('header');
    start.className = 'book-chapter-start';
    const chapterLabel = item.label || (item.part ? `PART ${item.part} · 학습 ${item.chapter}` : `학습 ${item.chapter}`);
    start.innerHTML = `<p>${chapterLabel}</p><h1>${item.title}</h1><span>${description}</span>`;
    chapter.insertAdjacentElement('afterbegin', start);
  });

  const desktopLearningCatalog = {
    platform: { number: '01', label: 'PLATFORM', sequence: [['philosophy','01','ONOFF Safety Platform 이해','31:4'],['workflow','02','오늘 작업과 Daily Safety','48:5'],['daily-work','03','Safety Start','78:4'],['safety-report','04','작업 중과 작업 종료','103:2']] },
    risk: { number: '02', label: 'RISK ASSESSMENT', sequence: [['risk-assessment-purpose','01','위험성평가의 이해','174:4'],['risk-assessment-structure','02','위험성 판단과 감소대책','174:332'],['risk-assessment-stra','03','현장 실행과 지속 관리','174:658'],['risk-assessment-platform','04','ONOFF Platform 연결','174:999']] },
    practical: { number: '03', label: 'RISK PRACTICAL', sequence: [['risk-practical-01','01','작업 확인과 위험요인 파악','208:514'],['risk-practical-02','02','최초 위험성과 안전조치','208:688'],['risk-practical-03','03','감소대책과 재평가','208:940'],['risk-practical-04','04','개선 실행과 완료 확인','208:1120']] },
    sop: { number: '04', label: 'SOP', sequence: [['sop-purpose','01','SOP의 이해','190:117'],['sop-reading','02','작업 준비와 실행','190:414'],['sop-structure','03','변경과 비정상 상황','190:650'],['sop-platform','04','ONOFF Platform 연결','191:117']] },
    tbm: { number: '05', label: 'TBM', sequence: [['tbm-purpose','INTRO','TBM Intro','243:575'],['tbm-nine-steps','01','사람 확인과 준비','243:576'],['tbm-scenario','02','위험 공유와 사고사례','243:577'],['tbm-life-rules','03','대응 준비와 작업 시작','243:578']] },
    special: { number: '06', label: 'SPECIAL SAFETY', sequence: [['special-education-intro','INTRO','특별안전교육 공통 Intro','236:437'],['special-robot-work','01','Robot Safety','236:438'],['special-live-work-75v','02','Electrical Safety','236:439'],['special-hazardous-chemicals','03','Chemical Safety','236:440'],['special-cargo-handling','04','Material Handling','236:441'],['special-daily-work','COMPLETE','Course Complete','236:442']] }
  };
  Object.entries(desktopLearningCatalog).forEach(([courseId,course]) => course.sequence.forEach(([chapterId,learningNumber,title],index) => {
    const chapter = document.getElementById(chapterId);
    const legacyStart = chapter?.querySelector('.book-chapter-start');
    if (!chapter || !legacyStart || chapter.querySelector('.desktop-learning-hero')) return;
    const intro = legacyStart.querySelector('span')?.textContent.trim() || '이 학습의 핵심 안전행동과 현장 적용 기준을 확인합니다.';
    const hero = document.createElement('header');
    hero.className = 'desktop-learning-hero';
    hero.dataset.desktopCourse = courseId;
    hero.innerHTML = `<div class="desktop-learning-hero-grid"><div class="desktop-learning-hero-copy"><p>COURSE ${course.number} · ${course.label}</p><h1>${learningNumber === 'INTRO' || learningNumber === 'COMPLETE' ? title : `학습 ${learningNumber} · ${title}`}</h1><span>${intro}</span><div class="desktop-learning-position"><small>현재 학습</small><strong>${index + 1} / ${course.sequence.length}</strong></div></div><aside><small>${learningNumber === 'COMPLETE' ? 'COURSE COMPLETE' : 'LEARNING FOCUS'}</small><strong>${title}</strong><p>${learningNumber === 'COMPLETE' ? '학습 내용을 현장 안전행동과 연결하고 완료 상태를 확인합니다.' : '교육 내용을 읽고 Visual, Practice와 완료 단계를 순서대로 확인합니다.'}</p></aside></div></header>`;
    legacyStart.insertAdjacentElement('afterend', hero);
    if (!chapter.querySelector('.chapter-reading-nav')) chapter.insertAdjacentHTML('beforeend', '<nav class="chapter-reading-nav" aria-label="학습 이동"></nav>');
  }));

  const philosophyChapter = document.getElementById('philosophy');
  if (philosophyChapter && !philosophyChapter.querySelector('.figma-ready-desktop-learning')) {
    philosophyChapter.insertAdjacentHTML('beforeend', `
      <article class="figma-ready-desktop-learning platform-ready-01" data-figma-source="31:4" data-ready-inventory="understand|philosophy|brand-story|direction|key-point-roles|key-point-structure|complete" aria-labelledby="figma-ready-philosophy-title">
        <aside class="platform-ready-01-sidebar" aria-label="Platform 학습 목록">
          <a href="#platform-course">← 과정 홈</a>
          <p>COURSE 01</p><h2>ONOFF Safety Platform</h2>
          <nav>
            <a class="is-active" href="#philosophy" aria-current="page"><b>01</b><span>Platform 이해</span></a>
            <a href="#workflow"><b>02</b><span>Safety Start</span></a>
            <a href="#daily-work"><b>03</b><span>Daily Safety</span></a>
            <a href="#safety-report"><b>04</b><span>작업 중 · 종료</span></a>
          </nav>
        </aside>
        <main class="platform-ready-01-workspace">
        <header class="ready-learning-header">
          <nav aria-label="현재 위치"><span>Academy</span><i>›</i><span>Platform</span><i>›</i><strong>학습 01</strong></nav>
          <p>PART 01 · PLATFORM 이해</p>
          <h1 id="figma-ready-philosophy-title">ONOFF Safety Platform 이해</h1>
          <div class="ready-learning-subtitle">안전자료를 보관하는 시스템을 넘어,<br>오늘의 작업과 필요한 안전을 연결합니다.</div>
          <div class="ready-learning-progress" data-platform-l01-progress><span aria-hidden="true">▣</span><strong>학습 진행</strong><em>학습 01 / 04</em><b data-platform-l01-percent>0%</b><i><span data-platform-l01-bar></span></i></div>
        </header>

        <section class="ready-learning-section ready-editorial" data-ready-section="understand">
          <b class="ready-section-tag">UNDERSTAND</b><h2>왜 안전 플랫폼이 필요한가</h2>
          <p>안전자료가 없어서 사고가 발생하는 것은 아닙니다.</p><p>위험성평가도 있고, SOP도 있고, TBM도 하고, 교육도 합니다.</p>
          <p>문제는 그 많은 안전정보가 오늘 내가 하는 작업과 연결되어 있는가입니다.</p>
          <p>위험성평가는 Drive에 있고, SOP는 다른 폴더에 있고, TBM은 별도로 진행하고, 교육기록은 또 다른 곳에 존재할 수 있습니다.</p>
          <p>각각의 자료는 존재하지만 작업자는 작업을 시작하는 순간 스스로 판단해야 합니다.</p>
          <blockquote>“오늘 나는 무엇을 확인해야 하지?”</blockquote>
          <p>ONOFF Safety Platform은 여기서 출발합니다.</p>
          <aside class="ready-key-message"><strong>안전자료를 더 많이 만드는 것이 아니라,</strong><strong>필요한 안전을 필요한 순간에 연결하는 것.</strong></aside>
        </section>

        <section class="ready-learning-section ready-editorial" data-ready-section="philosophy">
          <header><b>OUR PHILOSOPHY</b><h2>우리가 생각하는 안전</h2></header>
          <p>안전은 서류를 완성하는 순간 시작되는 것이 아닙니다.</p>
          <p>작업자가 오늘의 작업을 알고, 위험을 확인하고, 필요한 절차를 이해하고, 스스로 확인한 뒤 작업을 시작할 때 비로소 안전은 현장에서 작동합니다.</p>
          <blockquote class="ready-manifesto">기록을 위한 안전에서,<br><strong>행동으로 이어지는 안전으로.</strong></blockquote>
        </section>

        <section class="ready-learning-section" data-ready-section="brand-story">
          <div class="ready-editorial"><header><b>BRAND STORY</b><h2>ONOFF에 담은 생각</h2></header><small>WHY ONOFF</small><h3>왜 ‘ONOFF’인가</h3>
          <p>작업에는 시작과 끝이 있습니다. 하지만 안전은 작업 시작 버튼을 누르는 순간 갑자기 생기는 것이 아닙니다.</p>
          <aside class="ready-accent-block"><strong>작업을 ON 하기 전에 안전이 먼저 ON 되어야 합니다.</strong><span>작업을 OFF 하기 전에는 놓친 위험이나 남겨야 할 기록이 없는지 다시 확인합니다.</span></aside></div>
          <div class="ready-life-cycle"><b>ONOFF Life Cycle</b><div>${[['PRE-WORK','SAFETY ON'],['START','WORK ON'],['END','WORK OFF'],['ARCHIVE','SAFETY RECORD']].map(([a,b]) => `<article><small>${a}</small><strong>${b}</strong></article>`).join('<i>→</i>')}</div></div>
        </section>

        <section class="ready-learning-section" data-ready-section="direction">
          <div class="ready-editorial"><header><b>OUR DIRECTION</b><h2>우리가 만들고자 하는 안전</h2></header><p>ONOFF는 작업자에게 더 많은 버튼을 누르게 만드는 것을 목표로 하지 않습니다. 필요한 순간에 필요한 확인만 남기고, 이미 확인한 정보는 다시 찾기 쉽게 만들고, 작업자는 안전하게 행동하고, 관리자는 그 흐름을 확인할 수 있게 합니다.</p></div>
          <div class="ready-direction-grid"><article><b>SAFETY PLATFORM</b><strong>행동을 연결합니다.</strong><span>오늘 무엇을 해야 하는가.</span></article><article><b>ONOFF ACADEMY</b><strong>지식을 연결합니다.</strong><span>왜 그렇게 해야 하는가.</span></article></div>
          <p class="ready-progression">알고 하는 안전 → 확인하고 하는 안전 → 기록으로 남는 안전</p>
        </section>

        <section class="ready-learning-section ready-editorial" data-ready-section="key-point-roles">
          <b class="ready-section-tag">KEY POINT ①</b><h2>Safety Platform은 어떻게 움직이는가</h2><p>Platform의 운영 원리를 이해하기 위해 세 가지 역할을 알아야 합니다.</p>
          <div class="ready-role-stack">${[['WORKER','작업을 수행합니다.'],['SUPERVISOR','작업과 안전 운영을 관리합니다.'],['ADMINISTRATOR','Platform System을 관리합니다.']].map(([role,text]) => `<article><b>${role}</b><span>${text}</span></article>`).join('')}</div>
          <div class="ready-concept-grid"><article><small>CONCEPT 01</small><strong>ROLE</strong><span>누가 어떤 책임을 가지는가</span></article><article><small>CONCEPT 02</small><strong>MODE</strong><span>지금 어떤 행동을 하려는가</span></article></div>
          <aside class="ready-summary-callout">• Role은 책임을 정의하고, Mode는 지금 하려는 행동을 정의합니다.</aside>
        </section>

        <section class="ready-learning-section" data-ready-section="key-point-structure">
          <div class="ready-editorial"><b class="ready-section-tag">KEY POINT ②</b><h2>ONOFF 전체 구조</h2></div>
          <div class="ready-ecosystem"><header><small>ONOFF SAFETY ECOSYSTEM</small><strong>ONOFF 안전 생태계</strong></header><b>ONOFF</b>
            <div class="ready-ecosystem-branches"><article><strong>SAFETY PLATFORM</strong><small>오늘 안전하게 일하기</small><ul>${['Daily Safety','Project & Work','Safety Start','Electronic Documents','Safety Report'].map(item => `<li>${item}</li>`).join('')}</ul></article><article><strong>ONOFF ACADEMY</strong><small>이해하고 배우기</small><ul>${['Platform','TBM','SOP','위험성평가','특별안전교육','설비안전','비상대응','사고사례'].map(item => `<li>${item}</li>`).join('')}</ul></article></div>
            <i>⌄</i><footer>현장의 안전<br><strong>SAFETY IN THE FIELD</strong></footer>
          </div>
        </section>

        <section class="ready-learning-complete" data-ready-section="complete">
          <div class="ready-editorial"><b>COMPLETE</b><h2>ONOFF Safety Platform 이해</h2><ol>${['안전자료를 더 만드는 것이 아니라 필요한 순간에 연결합니다.','작업을 ON 하기 전에 안전이 먼저 ON 되어야 합니다.','Platform은 행동을 연결하고, Academy는 지식을 연결합니다.'].map((item) => `<li><strong aria-hidden="true">✓</strong><span>${item}</span></li>`).join('')}</ol></div>
          <nav class="ready-bottom-navigation" aria-label="학습 이동"><span aria-disabled="true">← 이전 학습</span><a href="#platform-course">학습 목록</a><a href="#workflow" data-complete-on-navigation="philosophy">다음 학습 →</a></nav>
        </section>
        </main>
      </article>`);
  }

  const renderSopReadySidebar = (active) => `<aside class="sop-ready-sidebar" aria-label="SOP 표준작업절차서 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>SOP 표준작업절차서</small>${[['01','표준작업절차서(SOP)의 이해','sop-purpose'],['02','작업 준비와 실행','sop-reading'],['03','변경과 비정상 상황','sop-structure'],['04','ONOFF Platform 연결','sop-platform']].map(([number,title,route],index)=>`<a href="#${route}"${index===active?' class="is-active" aria-current="page"':''}><span>${number}</span>${title}</a>`).join('')}<small>LIBRARY</small><a href="#sop-course">양식 자료실</a></aside>`;

  const renderTbmReadySidebar = (active) => `<aside class="tbm-ready-sidebar" aria-label="TBM 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>TBM</small>${[['TBM 소개','tbm-purpose'],['01 · 사람 확인과 준비','tbm-nine-steps'],['02 · 위험 공유와 사고사례','tbm-scenario'],['03 · 대응 준비와 작업 시작','tbm-life-rules']].map(([title,route],index)=>`<a href="#${route}"${index===active?' class="is-active" aria-current="page"':''}>${title}</a>`).join('')}<small>LIBRARY</small><a href="#tbm-course">양식 자료실</a></aside>`;

  const renderSpecialReadySidebar = (active) => `<aside class="special-ready-sidebar" aria-label="특별안전교육 학습 목록"><small>HOME</small><a href="#home">학습 홈</a><small>특별안전교육</small>${[['특별안전교육 소개','special-education-intro'],['01 · 로봇 작업','special-robot-work'],['02 · 전기 작업','special-live-work-75v'],['03 · 화학물질 취급','special-hazardous-chemicals'],['04 · 운반·하역 작업','special-cargo-handling'],['수료','special-daily-work']].map(([title,route],index)=>`<a href="#${route}"${index===active?' class="is-active" aria-current="page"':''}>${title}</a>`).join('')}<small>LIBRARY</small><a href="#special-course">과정 목록</a></aside>`;

  const specialReadySectionHeader = (tag,title,description) => `<header class="special-ready-section-header"><b>${tag}</b><h2>${title}</h2><p>${description}</p></header>`;
  const mountExactSpecialDesktopLearning = () => {
    if (!desktopHomeMedia.matches) return;
    const intro = document.getElementById('special-education-intro');
    if (intro && !intro.querySelector(':scope > .special-ready-desktop-learning')) intro.insertAdjacentHTML('beforeend', `
      <article class="special-ready-desktop-learning special-ready-intro" data-figma-source="236:437" data-ready-inventory="hero|why|learning-path|connection|course-map|navigation" aria-labelledby="special-ready-intro-title">
        ${renderSpecialReadySidebar(0)}<main class="special-ready-workspace">
          <header class="special-ready-hero"><div><p><strong>00</strong><span><b>SPECIAL SAFETY EDUCATION</b><small>INTRODUCTION · 공통 안내</small></span></p><h1 id="special-ready-intro-title">SPECIAL SAFETY 특별안전교육</h1><h2>위험성이 높은 특정 작업을 수행하기 전에 해당 작업의 주요 위험요인과 필요한 안전사항을 이해하기 위한 교육입니다.</h2></div><aside><h3>이 교육에서 다루는 4가지 주제</h3><div>${[['intro-robot.svg','Robot'],['intro-electrical.svg','Electrical'],['intro-chemical.svg','Chemical'],['intro-material.svg','Material']].map(([icon,title])=>`<span><img src="assets/special/figma-ready/${icon}" alt=""><b>${title}</b></span>`).join('')}</div></aside></header>
          <section class="special-ready-section is-white" data-ready-section="why">${specialReadySectionHeader('WHY','왜 특별안전교육이 필요한가','작업의 위험성은 작업의 특성에 따라 크게 달라집니다. 작업자들이 각 작업의 고유 위험요인을 미리 이해하지 않으면, 사전 예방이 어려워집니다.')}<div class="special-ready-points"><article><span>01</span><p><b>고위험 작업에는 작업별 안전기준이 필요합니다.</b><small>작업 특성에 맞는 위험요인과 안전조치를 작업 전에 이해합니다.</small></p></article><article><span>02</span><p><b>교육은 현장 행동으로 이어져야 합니다.</b><small>작업 전 확인과 안전거리, 접근제어, 비상조치를 실제 작업에 적용합니다.</small></p></article></div></section>
          <section class="special-ready-section" data-ready-section="learning-path">${specialReadySectionHeader('LEARNING PATH','이 Course에서 학습할 4가지 주제','각 주제별로 주요 위험요인과 안전조치 기준을 이해합니다.')}<div class="special-ready-card-grid">${[['01','ROBOT SAFETY','산업용 로봇 작업','설비 동작 가능성과 작업자 위치를 중심으로 안전 거리와 접근 제어를 학습합니다.'],['02','ELECTRICAL SAFETY','전기작업','전원 상태 확인과 작업 안전조치(LOTO 등)를 중심으로 전기 위험을 관리하는 방법을 학습합니다.'],['03','CHEMICAL SAFETY','유해물질 취급','사용물질 확인과 취급 주의사항을 학습하여 유해물질 노출 위험을 예방합니다.'],['04','MATERIAL HANDLING','중량물 취급·운반','중량물 지지·고정·이동 과정을 중심으로 안전운반 기준을 학습합니다.']].map(([n,k,t,d])=>`<article><p><span>${n}</span><b>${k}</b></p><h3>${t}</h3><small>${d}</small></article>`).join('')}</div></section>
          <section class="special-ready-section is-white" data-ready-section="connection">${specialReadySectionHeader('CONNECTION','교육 후 실제 작업의 위험요인 확인으로 이어져야 합니다','학습 → 이해 → 현장 적용의 흐름을 통해 위험요인 파악의 토대를 구축합니다.')}<div class="special-ready-flow">${[['학습','주제별 위험요인 이해'],['이해','작업 특성 구조화'],['현장 적용','위험요인 확인 및 대책']].map(([t,d],i)=>`${i?'<i>→</i>':''}<article><strong>${t}</strong><small>${d}</small></article>`).join('')}</div></section>
          <section class="special-ready-section" data-ready-section="course-map">${specialReadySectionHeader('COURSE MAP','전체 Course 흐름도','Intro에서 시작하여 각 주제별로 학습을 진행한 뒤, 완료 단계까지 이어집니다.')}<ol class="special-ready-course-map">${[['INTRO','SPECIAL SAFETY'],['01','ROBOT'],['02','ELECTRICAL'],['03','CHEMICAL'],['04','MATERIAL'],['COMPLETE','COURSE COMPLETE']].map(([n,t])=>`<li><small>${n}</small><strong>${t}</strong></li>`).join('')}</ol></section>
          <nav class="special-ready-nav" aria-label="학습 이동"><span aria-disabled="true">← 이전 학습</span><a href="#special-course">학습 목록</a><a href="#special-robot-work" data-complete-on-navigation="special-education-intro">다음: 교육 01 Robot Safety →</a></nav>
        </main></article>`);

    const robot = document.getElementById('special-robot-work');
    if (robot && !robot.querySelector(':scope > .special-ready-desktop-learning')) robot.insertAdjacentHTML('beforeend', `
      <article class="special-ready-desktop-learning special-ready-robot" data-figma-source="236:438" data-ready-inventory="hero|situation|hazard|check|field-point|practice|navigation" aria-labelledby="special-ready-robot-title">
        ${renderSpecialReadySidebar(1)}<main class="special-ready-workspace">
          <header class="special-ready-hero"><div><p><strong>01</strong><span><b>교육 01 · ROBOT SAFETY</b><small>SPECIAL SAFETY EDUCATION · 산업용 로봇 작업</small></span></p><h1 id="special-ready-robot-title">ROBOT SAFETY 산업용 로봇 작업</h1><h2>DS제어팀 업무와 연관성이 높은 핵심 특별안전교육 주제입니다. 작업자 접근과 설비 동작 가능성을 중심으로 위험요인을 구조화합니다.</h2></div><aside><h3>이 교육에서 학습할 핵심</h3>${['로봇 동작 가능성과 작업자 접근 위험','안전거리/접근제어/비상정지 체크리스트','현장 상황에서 안전조치 판단'].map((t,i)=>`<p><span>0${i+1}</span>${t}</p>`).join('')}</aside></header>
          <section class="special-ready-section is-white" data-ready-section="situation">${specialReadySectionHeader('SITUATION','우리 업무에서 언제 발생하는가','DS제어팀의 업무 상황을 중심으로 로봇 작업의 위험요인이 발생하는 시점을 구조화합니다.')}<div class="special-ready-card-grid is-three">${[['1','로봇 제어 프로그래밍 중 확인 동작','프로그래밍 테스트 시 로봇의 예상 동작 범위를 확인하는 과정에서 작업자가 동작구역에 접근할 수 있습니다.'],['2','설비 점검 시 동작구역 내 작업','정비/점검 시 로봇의 동작 가능성과 작업자 위치를 동시에 확인해야 합니다.'],['3','시운전 중 예상치 못한 동작','프로그래밍 오류나 센서 이상으로 예상치 못한 동작이 발생할 수 있습니다.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div><div class="special-ready-visual"><h3>작업자 위치 vs 설비 동작 범위 (Visual Diagram)</h3><div><article><img src="assets/special/figma-ready/robot.svg" alt=""><b>로봇 동작 범위</b><small>작업자 접근 제한 구역</small></article><img src="assets/special/figma-ready/arrow-right.svg" alt=""><article><img src="assets/special/figma-ready/worker.svg" alt=""><b>작업자 접근 위치</b><small>안전거리 유지 필수</small></article></div></div></section>
          <section class="special-ready-section" data-ready-section="hazard">${specialReadySectionHeader('HAZARD','무엇이 위험한가','충돌/협착, 끼임, 예상치 못한 기동 등 로봇의 동작 특성에 따른 위험을 구조화합니다.')}<div class="special-ready-card-grid is-three">${[['1','충돌/협착','로봇의 고속 동작으로 인해 작업자가 충돌하거나 협착구역에 끼임.'],['2','끼임','로봇의 부속품과 설비 구조물 사이에서 작업자가 끼이는 사고.'],['3','예상치 못한 기동','프로그래밍 오류 또는 센서 이상으로 예상치 못한 동작이 발생.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div><div class="special-ready-zones"><article><small>SAFE ZONE</small><strong>작업자 접근 금지</strong></article><i>→</i><article><small>DANGER ZONE</small><strong>로봇 동작 범위</strong></article></div></section>
          <section class="special-ready-section is-white" data-ready-section="check">${specialReadySectionHeader('CHECK','작업 전 무엇을 확인해야 하는가','작업 전 체크리스트를 통해 안전 상태를 확인합니다.')}<div class="special-ready-card-grid is-three">${[['1','설비 동작 상태 확인','전원 공급 상태, 비상정지 버튼 작동, LOTO 적용 여부 확인.'],['2','작업 위치와 동작 범위 확인','작업자가 동작구역에 접근하지 않는지, 안전거리 유지 여부 확인.'],['3','비상정지 장치 확인','비상정지 버튼, 정지 스위치, 감지 센서 등 작동 여부 확인.'],['4','안전가드/울타리 상태','접근 제한 울타리, 감지 센서, 경고등 작동 여부 확인.'],['5','프로그래밍/설비 상태 확인','로봇의 동작 범위와 프로그래밍 테스트 시나리오 확인.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div></section>
          <section class="special-ready-section" data-ready-section="field-point">${specialReadySectionHeader('FIELD POINT','현장에서 놓치기 쉬운 것은 무엇인가','DS Field Scenario: 자동화설비 시운전 중 작업자가 설비 동작구역에 접근')}<div class="special-ready-scenario"><article><b>BEFORE: 어떤 위험이 존재하는가?</b><p>작업자가 동작구역에 접근한 상태에서 비상정지 장치가 작동하지 않거나, 안전가드 울타리가 열린 채로 시운전을 진행할 경우 충돌/끼임 사고의 위험이 매우 높아집니다.</p></article><article><b>ACTION: 작업자는 무엇을 확인해야 하는가?</b><p>작업자는 접근 전 비상정지 버튼을 눌러 전원 공급이 완전히 차단되었는지 확인하고, 안전가드 울타리가 완전히 닫혀 있는지 확인해야 합니다.</p><strong>LOTO 적용 여부와 잔류 동력까지 확인합니다.</strong></article><article><b>RESULT: 사람의 주의에만 의존하지 않고 설비/조작방식에서 근본적으로 위험을 줄일 수 있는가?</b><p>예. 작업자 접근 시 자동 감지 센서가 작동하여 로봇 동작을 중단하도록 설비를 구성하거나, 작업자 위치를 완전히 분리하는 안전가드 설계를 통해 위험을 근본적으로 줄일 수 있습니다.</p></article></div></section>
          <section class="special-ready-section is-white special-ready-practice" data-ready-section="practice">${specialReadySectionHeader('PRACTICE','실무 작성 자가진단','시운전 중 작업자가 동작구역에 접근한 상황에서 안전 조치를 확인하는 절차를 선택하세요.')}<div class="special-ready-question" data-special-answer="B"><h3>Q1. 로봇 시운전 중 작업자가 동작구역에 접근해야 할 때, 가장 먼저 확인해야 하는 안전 조치는 무엇입니까?</h3>${[['A','작업자에게 주의하도록 말하고 바로 접근한다'],['B','로봇을 정지하고 전원 차단 및 비상정지 상태를 확인한다'],['C','로봇 속도만 낮춘 뒤 작업을 계속한다'],['D','안전가드가 열려 있어도 감시자를 배치한다']].map(([v,t])=>`<button type="button" data-special-choice="${v}"><span>${v}</span>${t}</button>`).join('')}<button type="button" data-special-check disabled>정답 확인</button><aside hidden><strong></strong><p>작업자 접근 전 로봇 정지와 전원 차단, 비상정지 상태를 먼저 확인합니다.</p><button type="button" data-special-retry>다시 풀기</button></aside></div><div class="special-ready-question" data-special-answer="C"><h3>Q2. 작업자 접근 시 로봇의 예상치 못한 동작을 방지하기 위해 가장 효과적인 설비 구성은 무엇입니까?</h3>${[['A','경고 문구를 더 크게 부착한다'],['B','작업자에게 반복해서 주의를 준다'],['C','접근 감지 시 로봇이 자동 정지하도록 인터록을 구성한다'],['D','작업 속도를 평소보다 낮춘다']].map(([v,t])=>`<button type="button" data-special-choice="${v}"><span>${v}</span>${t}</button>`).join('')}<button type="button" data-special-check disabled>정답 확인</button><aside hidden><strong></strong><p>사람의 주의가 아니라 접근 감지와 자동 정지 구조로 위험을 줄여야 합니다.</p><button type="button" data-special-retry>다시 풀기</button></aside></div><div class="special-ready-education-complete" hidden><b>EDUCATION COMPLETE</b><h2>Robot Safety 교육을 완료했습니다.</h2></div></section>
          <nav class="special-ready-nav" aria-label="학습 이동"><a href="#special-education-intro">← Intro</a><a href="#special-course">학습 목록</a><a href="#special-live-work-75v" data-complete-on-navigation="special-robot-work">다음: 교육 02 Electrical Safety →</a></nav>
        </main></article>`);

    const electrical = document.getElementById('special-live-work-75v');
    if (electrical && !electrical.querySelector(':scope > .special-ready-desktop-learning')) electrical.insertAdjacentHTML('beforeend', `
      <article class="special-ready-desktop-learning special-ready-electrical" data-figma-source="236:439" data-ready-inventory="hero|why|situation|hazard|check|field-point|practice|navigation" aria-labelledby="special-ready-electrical-title">
        ${renderSpecialReadySidebar(2)}<main class="special-ready-workspace">
          <header class="special-ready-hero"><div><p><strong>02</strong><span><b>교육 02 · ELECTRICAL SAFETY</b><small>SPECIAL SAFETY EDUCATION · 전기작업</small></span></p><h1 id="special-ready-electrical-title">ELECTRICAL SAFETY 전기작업</h1><h2>DS제어팀의 실제 전장업무를 중심으로 구성합니다. 전원 상태, 통전 가능성, 설비 점검을 체계적으로 구조화합니다.</h2></div><aside><h3>이 교육에서 학습할 핵심</h3>${['전기작업의 다양한 위험 요소 (감전, 아크, 화재)','전원 상태 확인과 LOTO 적용 절차','현장에서 놓치기 쉬운 통전 가능성 대응'].map((t,i)=>`<p><span>0${i+1}</span>${t}</p>`).join('')}<div class="special-ready-depth"><span><small>PROGRESS</small><b>02 / 04</b></span><span><small>DEPTH</small><b>DETAILED</b></span></div></aside></header>
          <section class="special-ready-section is-white" data-ready-section="why">${specialReadySectionHeader('WHY','왜 위험한가','전기작업은 단순히 감전 위험만이 아니라, 아크/단락, 잔류 전압, 화재 등 다양한 형태의 위험을 내포합니다. 작업 전 확인이 가장 핵심입니다.')}<div class="special-ready-card-grid"><article><h3>전기작업의 위험성</h3><ul><li>감전 위험 (직접/간접 접촉)</li><li>아크/단락 발생</li><li>잔류 전압 확인의 중요성</li></ul></article><article><h3>KEY LEARNING POINT</h3><p>전기작업의 위험성을 단순히 감전될 수 있다로 끝내지 않습니다. 작업 전 작업대상, 전원 상태, 작업범위, 필요한 안전조치를 확인해야 합니다.</p><strong>작업 전 확인이 전기 위험관리의 시작입니다.</strong></article></div></section>
          <section class="special-ready-section" data-ready-section="situation">${specialReadySectionHeader('SITUATION','우리 업무에서 언제 발생하는가','DS제어팀의 전장 점검 및 전기 조치 상황을 중심으로 위험요인이 발생하는 시점을 구조화합니다.')}<div class="special-ready-card-grid is-three">${[['1','제어반 점검 및 전장 작업','제어반 내부 전선 점검, 접속부 확인 시 전원 상태를 확인해야 합니다.'],['2','설비 전원 관련 조치','전원 차단, LOTO 적용, 비상정지 확인이 필수입니다.'],['3','전기 계통 확인 및 수리','전기 계통의 단락 가능성과 잔류 전압을 확인합니다.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div><div class="special-ready-visual special-ready-electrical-flow"><h3>작업 전 확인 순서 (Visual Diagram)</h3><div>${[['작업대상 확인','작업 범위 및 전원 공급 경로'],['전원 상태 확인','LOTO 적용 및 비상정지'],['작업범위 확인','접촉 가능성 및 통전 위험'],['안전조치 확인','개인보호구 및 절연도구']].map(([t,d],i)=>`${i?'<img src="assets/special/figma-ready/electrical-arrow.svg" alt="">':''}<article><b>${t}</b><small>${d}</small></article>`).join('')}</div></div></section>
          <section class="special-ready-section is-white" data-ready-section="hazard">${specialReadySectionHeader('HAZARD','무엇이 위험한가','감전 위험, 아크/단락, 잔류 전압 등 전기 특성에 따른 위험을 구조화합니다.')}<div class="special-ready-card-grid is-three">${[['1','감전 위험','직/간접 접촉으로 인한 전기 충격.'],['2','아크/단락','고온 아크 발생으로 인한 화상 및 화재.'],['3','잔류 전압','전원 차단 후에도 유지되는 위험 전압.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div><div class="special-ready-zones"><article><small>DE-ENERGIZED</small><strong>전원 차단 상태</strong></article><i>→</i><article><small>VERIFIED SAFE</small><strong>잔류 전압 확인 완료</strong></article></div></section>
          <section class="special-ready-section" data-ready-section="check">${specialReadySectionHeader('CHECK','작업 전 무엇을 확인해야 하는가','작업 전 체크리스트를 통해 안전 상태를 확인합니다. 전기 안전절차는 기존 Academy Source에서 확인되는 범위만 사용합니다.')}<div class="special-ready-card-grid is-three">${[['1','작업대상 확인','작업 범위 및 전원 공급 경로를 명확히 확인합니다.'],['2','전원 상태 확인','LOTO 적용 여부, 비상정지 버튼 작동 여부 확인.'],['3','작업범위 확인','접촉 가능성 및 통전 위험을 확인합니다.'],['4','안전조치 확인','개인보호구 및 절연도구 사용 여부 확인.'],['5','잔류 전압 확인','전원 차단 후에도 유지되는 위험 전압 확인.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div></section>
          <section class="special-ready-section is-white" data-ready-section="field-point">${specialReadySectionHeader('FIELD POINT','현장에서 놓치기 쉬운 것','전장 점검 전 전원 상태 확인이 불충분한 상황과 통전 가능성을 간과하는 경우를 주의합니다.')}<div class="special-ready-scenario"><article><b>BEFORE: 어떤 위험이 존재하는가?</b><p>전원 상태를 확인하지 않고 전장 점검을 시작하거나, 접촉 가능성이 있는 부위를 방치할 경우 감전 사고의 위험이 매우 높아집니다.</p></article><article><b>ACTION: 작업자는 무엇을 확인해야 하는가?</b><p>작업자는 접촉 전 전원 공급이 완전히 차단되었는지 확인하고, 잔류 전압을 측정해야 합니다.</p></article><article><b>RESULT: 사람의 주의에만 의존하지 않고 설비/조작방식에서 근본적으로 위험을 줄일 수 있는가?</b><p>예. LOTO 적용을 표준화하고, 작업자 접근 구역에 절연 방호를 설치하거나, 전원 공급을 완전히 분리하는 설계를 통해 위험을 근본적으로 줄일 수 있습니다.</p></article></div></section>
          <section class="special-ready-section special-ready-practice" data-ready-section="practice">${specialReadySectionHeader('PRACTICE','실무 작성 자가진단','전장 점검 전 전원 상태 확인 시나리오에서 안전 조치를 확인하는 절차를 선택하세요.')}<div class="special-ready-question" data-special-answer="A"><h3>Q1. 전장 점검 전 가장 먼저 확인해야 하는 안전 조치는 무엇입니까?</h3>${[['A','전원 공급이 완전히 차단되었는지 확인한다.'],['B','작업 범위 내의 접촉 가능성을 확인한다.'],['C','개인보호구 착용 여부를 확인한다.'],['D','설비 점검 기록을 확인한다.']].map(([v,t])=>`<button type="button" data-special-choice="${v}"><span>${v}</span>${t}</button>`).join('')}<button type="button" data-special-check disabled>정답 확인</button><aside hidden><strong></strong><p>전장 점검 전에는 전원 공급이 완전히 차단되었는지 먼저 확인합니다.</p><button type="button" data-special-retry>다시 풀기</button></aside></div><div class="special-ready-question" data-special-answer="A"><h3>Q2. 전원 상태 확인 시 가장 중요한 절차는 무엇입니까?</h3>${[['A','LOTO 적용 여부와 비상정지 버튼 작동 여부를 확인한다.'],['B','전원 공급 경로를 확인한다.'],['C','잔류 전압을 측정한다.'],['D','안전교육을 반복한다.']].map(([v,t])=>`<button type="button" data-special-choice="${v}"><span>${v}</span>${t}</button>`).join('')}<button type="button" data-special-check disabled>정답 확인</button><aside hidden><strong></strong><p>LOTO 적용 여부와 비상정지 버튼 작동 여부를 확인합니다.</p><button type="button" data-special-retry>다시 풀기</button></aside></div><div class="special-ready-education-complete" hidden><b>EDUCATION COMPLETE</b><h2>Electrical Safety 교육을 완료했습니다.</h2><p>50% · 2/4 완료</p></div></section>
          <nav class="special-ready-nav" aria-label="학습 이동"><a href="#special-robot-work">← 교육 01 Robot Safety</a><a href="#special-course">학습 목록</a><a href="#special-hazardous-chemicals" data-complete-on-navigation="special-live-work-75v">교육 03 Chemical Safety →</a></nav>
        </main></article>`);

    const chemical = document.getElementById('special-hazardous-chemicals');
    if (chemical && !chemical.querySelector(':scope > .special-ready-desktop-learning')) chemical.insertAdjacentHTML('beforeend', `
      <article class="special-ready-desktop-learning special-ready-chemical" data-figma-source="236:440" data-ready-inventory="hero|material|risk|check|practice|navigation" aria-labelledby="special-ready-chemical-title">${renderSpecialReadySidebar(3)}<main class="special-ready-workspace">
        <header class="special-ready-hero"><div><p><strong>03</strong><span><b>CHEMICAL SAFETY</b><small>SPECIAL SAFETY EDUCATION · 유해물질 취급</small></span></p><h1 id="special-ready-chemical-title">CHEMICAL SAFETY 유해물질 취급</h1><h2>DS제어팀에서 가장 자주 사용하는 그리스, 록타이트, 에탄올을 중심으로 위험요인을 구조화합니다.</h2></div><aside><h3>이 교육에서 학습할 핵심</h3>${['그리스, 록타이트, 에탄올의 사용 목적과 위험요인','피부 접촉, 흡입, 눈 접촉 위험 확인','취급 전 확인사항과 사용 후 관리 절차'].map((t,i)=>`<p><span>0${i+1}</span>${t}</p>`).join('')}<div class="special-ready-depth"><span><small>PROGRESS</small><b>03 / 04</b></span><span><small>DEPTH</small><b>COMPACT</b></span></div></aside></header>
        <section class="special-ready-section is-white" data-ready-section="material">${specialReadySectionHeader('MATERIAL','우리가 사용하는 물질','DS제어팀에서 자주 사용하는 3종의 유해물질을 중심으로 어떤 작업에서 사용하는지 확인합니다.')}<div class="special-ready-card-grid is-three">${[['1','그리스 (윤활)','베어링, 가이드 등 마찰 부위의 윤활을 위해 사용합니다.'],['2','록타이트 (고정/밀봉)','볼트/나사 고정 및 기계부 밀봉을 위해 사용합니다.'],['3','에탄올 (세정)','설비 표면의 기름/오일 제거 및 세정을 위해 사용합니다.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div></section>
        <section class="special-ready-section" data-ready-section="risk">${specialReadySectionHeader('RISK','어떤 위험을 확인해야 하는가','유해물질의 취급은 피부 접촉, 흡입, 눈 접촉 등 다양한 경로로 위험을 유발할 수 있습니다.')}<div class="special-ready-list"><h3>주요 위험요인</h3><ul><li>피부 접촉: 피부 자극, 염증, 알레르기 반응</li><li>흡입: 호흡기 자극, 두통, 어지러움</li><li>눈 접촉: 눈 자극, 결막염, 시력 장애</li></ul><strong>물질의 사용 목적과 노출 경로를 함께 확인합니다.</strong></div></section>
        <section class="special-ready-section is-white" data-ready-section="check">${specialReadySectionHeader('CHECK','취급 전 확인사항','작업 전 MSDS 확인, 보호구 착용, 환기 상태 확인 등 절차를 준수합니다.')}<div class="special-ready-list"><h3>확인 체크리스트</h3><ul><li>물질 확인: MSDS 및 라벨을 확인하여 사용 목적과 위험을 파악</li><li>보호구 착용: 장갑, 안면보호구, 안전안경 착용</li><li>환기 확인: 밀폐 공간 작업 시 환기 상태를 확인</li><li>사용 후 관리: 사용 후 손 세정 및 폐기물 처리 절차 준수</li></ul></div></section>
        <section class="special-ready-section special-ready-practice" data-ready-section="practice">${specialReadySectionHeader('PRACTICE','실무 작성 자가진단','물질 확인 없이 사용하는 상황을 선택하세요.')}<div class="special-ready-question" data-special-answer="A"><h3>Q. 다음 중 안전 기준에 맞지 않는 유해물질 취급 방법은 무엇입니까?</h3>${[['A','MSDS를 확인하지 않고, 라벨만 보고 사용합니다.'],['B','장갑과 안면보호구를 착용하고 작업합니다.'],['C','밀폐 공간에서 환기 없이 작업합니다.']].map(([v,t])=>`<button type="button" data-special-choice="${v}"><span>${v}</span>${t}</button>`).join('')}<button type="button" data-special-check disabled>정답 확인</button><aside hidden><strong></strong><p>물질은 라벨만 보지 않고 MSDS까지 확인해야 합니다.</p><button type="button" data-special-retry>다시 풀기</button></aside></div><div class="special-ready-education-complete" hidden><b>EDUCATION COMPLETE</b><h2>Chemical Safety 교육을 완료했습니다.</h2><p>75% · 3/4 완료</p></div></section>
        <nav class="special-ready-nav" aria-label="학습 이동"><a href="#special-live-work-75v">← 교육 02 Electrical Safety</a><a href="#special-course">학습 목록</a><a href="#special-cargo-handling" data-complete-on-navigation="special-hazardous-chemicals">교육 04 Material Handling →</a></nav>
      </main></article>`);

    const material = document.getElementById('special-cargo-handling');
    if (material && !material.querySelector(':scope > .special-ready-desktop-learning')) material.insertAdjacentHTML('beforeend', `
      <article class="special-ready-desktop-learning special-ready-material" data-figma-source="236:441" data-ready-inventory="hero|scenario|hazard|check|practice|navigation" aria-labelledby="special-ready-material-title">${renderSpecialReadySidebar(4)}<main class="special-ready-workspace">
        <header class="special-ready-hero"><div><p><strong>04</strong><span><b>교육 04 · MATERIAL HANDLING</b><small>SPECIAL SAFETY EDUCATION · 중량물 취급·운반</small></span></p><h1 id="special-ready-material-title">MATERIAL HANDLING 중량물 취급·운반</h1><h2>DS제어팀의 MTL Maintenance 작업 시나리오를 중심으로 중량물의 지지/고정, 낙하, 협착, 작업자 위치, 임시 적재, 이동 위험을 구조화합니다.</h2></div><aside><h3>이 교육에서 학습할 핵심</h3>${['중량물 지지/고정 불안정','임시 적재 상태 위험','협착구역/충돌 위험'].map((t,i)=>`<p><span>0${i+1}</span>${t}</p>`).join('')}<div class="special-ready-depth"><span><small>PROGRESS</small><b>04 / 04</b></span><span><small>DEPTH</small><b>FIELD FOCUSED</b></span></div></aside></header>
        <section class="special-ready-section is-white" data-ready-section="scenario">${specialReadySectionHeader('SCENARIO','DS 작업 시나리오','OHS 설비 → MTL Maintenance 구간 작업 → 관련 기구/부품 탈거 → 대차에 일시 적재 → 필요한 위치로 이동/보관')}<div class="special-ready-card-grid"><article><h3>시나리오 시각화</h3><ol class="special-ready-number-list">${['OHS 설비 MTL Maintenance','기구/부품 탈거','대차 일시 적재','이동/보관'].map((t,i)=>`<li><span>${i+1}</span>${t}</li>`).join('')}</ol></article><article><h3>각 단계에서 발생할 수 있는 위험</h3><ul><li>탈거 중 부품 낙하 위험</li><li>대차 적재 불안정 (지지/고정)</li><li>협착구역 통행 중 충돌</li><li>작업자 위치와 중량물 간 간섭</li></ul></article></div></section>
        <section class="special-ready-section" data-ready-section="hazard">${specialReadySectionHeader('HAZARD','무엇이 위험한가','중량물의 지지/고정 불안정, 낙하, 협착구역 통행, 충돌, 작업자 위치 간섭 등 위험을 구조화합니다.')}<div class="special-ready-card-grid is-three">${[['1','낙하','부품 탈거 시 지지/고정 불안정으로 인해 작업자에게 낙하할 수 있습니다.'],['2','협착/충돌','협착구역 통행 중 중량물이 설비 구조물과 충돌하거나 작업자가 끼임.'],['3','임시 적재 상태','대차 적재 시 고정 불충분으로 인해 이동 중 중량물이 떨어질 수 있습니다.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div></section>
        <section class="special-ready-section is-white" data-ready-section="check">${specialReadySectionHeader('CHECK','작업 전/중 확인사항','중량 확인, 고정 상태, 이동 경로, 작업자 위치를 체크리스트로 구조화합니다.')}<div class="special-ready-card-grid is-three">${[['1','중량 확인','작업 부품의 중량을 확인하고 적재 가능 중량을 초과하지 않는지 확인.'],['2','고정 상태','대차 적재 시 고정 밴드/체인 상태를 확인하고, 작업 중 이동 시에도 고정 유지.'],['3','이동 경로','협착구역과 작업자 위치를 피하는 경로를 사전 확인하고, 통행 중 안전거리 유지.']].map(([n,t,d])=>`<article><p><span>${n}</span><b>${t}</b></p><small>${d}</small></article>`).join('')}</div></section>
        <section class="special-ready-section special-ready-practice" data-ready-section="practice">${specialReadySectionHeader('PRACTICE','실무 작성 자가진단','중량부품 고정 불충분 상태에서 후속 작업 상황을 선택하세요.')}<div class="special-ready-question" data-special-answer="B"><h3>Q1. 대차에 중량부품을 일시 적재한 상태에서 작업자가 후속 작업을 진행해야 할 때, 가장 먼저 확인해야 하는 항목은 무엇입니까?</h3>${[['A','이동 경로의 최단 거리'],['B','중량부품의 지지·고정 상태'],['C','후속 작업의 예상 소요시간']].map(([v,t])=>`<button type="button" data-special-choice="${v}"><span>${v}</span>${t}</button>`).join('')}<button type="button" data-special-check disabled>정답 확인</button><aside hidden><strong></strong><p>후속 작업 전에 중량부품의 지지·고정 상태를 먼저 확인해야 합니다.</p><button type="button" data-special-retry>다시 풀기</button></aside></div><div class="special-ready-education-complete" hidden><b>EDUCATION COMPLETE</b><h2>Material Handling 교육을 완료했습니다.</h2><p>100% · 4/4 완료</p></div></section>
        <nav class="special-ready-nav" aria-label="학습 이동"><a href="#special-hazardous-chemicals">← 교육 03</a><a href="#special-course">학습 목록</a><a href="#special-daily-work" data-complete-on-navigation="special-cargo-handling">수료 →</a></nav>
      </main></article>`);

    const complete = document.getElementById('special-daily-work');
    if (complete && !complete.querySelector(':scope > .special-ready-desktop-learning')) complete.insertAdjacentHTML('beforeend', `
      <article class="special-ready-desktop-learning special-ready-course-complete" data-figma-source="236:442" data-ready-inventory="completion|summary|connection|navigation" aria-labelledby="special-ready-complete-title">${renderSpecialReadySidebar(5)}<main class="special-ready-workspace">
        <section class="special-ready-complete-content"><header><span aria-hidden="true">✓</span><b>COURSE COMPLETE</b><h1 id="special-ready-complete-title">특별안전교육을 완료했습니다</h1><p>4가지 주제의 핵심 안전요인을 정리했습니다.</p></header><div class="special-ready-summary-grid">${[['ROBOT','Robot Safety','동작 가능성과 작업자 위치','로봇의 동작 범위와 작업자의 접근 가능성을 확인하여 안전 거리를 유지하는 기준을 학습했습니다.'],['ELECTRICAL','Electrical Safety','전원과 작업상태','전원 공급 상태와 작업 진행 상태를 확인하여 LOTO(락아웃/태그아웃) 절차를 안전하게 수행하는 방법을 학습했습니다.'],['CHEMICAL','Chemical Safety','사용물질과 취급상태','사용하는 유해물질의 종류와 취급 시 주의사항을 확인하여 개인보호장구 착용과 노출 예방을 학습했습니다.'],['MATERIAL','Material Handling','중량물의 지지·고정·이동','중량물의 적재 상태, 고정 방법, 이동 경로를 확인하여 사고 예방 기준을 학습했습니다.']].map(([k,s,t,d])=>`<article><p><b>${k}</b><small>${s}</small></p><h2>${t}</h2><p>${d}</p></article>`).join('')}</div><aside><b>PLATFORM CONNECTION</b><p>배운 안전내용이 ONOFF의 작업 전 안전확인과 연결됩니다. 현장에서 체크리스트로 바로 적용할 수 있습니다.</p></aside></section>
        <nav class="special-ready-nav special-ready-complete-nav" aria-label="과정 완료 이동"><a href="#special-cargo-handling">← 교육 04 | 목차로 돌아가기</a><a href="#special-course">다음 과정으로 이동 →</a></nav>
      </main></article>`);
    document.querySelectorAll('.special-ready-question').forEach((question) => {
      question.querySelectorAll('[data-special-choice]').forEach((choice) => choice.addEventListener('click',()=>{ question.querySelectorAll('[data-special-choice]').forEach((item)=>item.classList.toggle('is-selected',item===choice)); question.querySelector('[data-special-check]').disabled=false; }));
      question.querySelector('[data-special-check]')?.addEventListener('click',()=>{ const selected=question.querySelector('[data-special-choice].is-selected'); if(!selected)return; const correct=selected.dataset.specialChoice===question.dataset.specialAnswer; question.querySelectorAll('[data-special-choice]').forEach((item)=>{item.disabled=true;item.classList.toggle('is-correct',item.dataset.specialChoice===question.dataset.specialAnswer);item.classList.toggle('is-incorrect',item===selected&&!correct);}); const result=question.querySelector('aside'); result.hidden=false; result.querySelector('strong').textContent=correct?'Correct':'Incorrect · Hint를 확인하고 다시 시도하세요.'; const presentation=question.closest('.special-ready-desktop-learning'); if(correct&&[...presentation.querySelectorAll('.special-ready-question')].every((item)=>item.querySelector('[data-special-choice].is-correct'))) presentation.querySelector('.special-ready-education-complete').hidden=false; });
      question.querySelector('[data-special-retry]')?.addEventListener('click',()=>{question.querySelectorAll('[data-special-choice]').forEach((item)=>{item.disabled=false;item.classList.remove('is-selected','is-correct','is-incorrect');});question.querySelector('[data-special-check]').disabled=true;question.querySelector('aside').hidden=true;});
    });
  };

  const mountExactTbmDesktopLearning = () => {
    if (!desktopHomeMedia.matches) return;
    const intro = document.getElementById('tbm-purpose');
    if (intro && !intro.querySelector(':scope > .tbm-ready-desktop-learning')) intro.insertAdjacentHTML('beforeend', `
      <article class="tbm-ready-desktop-learning tbm-ready-intro" data-figma-source="243:575" data-ready-inventory="why|tbm-flow|start|bottom-navigation" aria-labelledby="tbm-ready-intro-title">
        ${renderTbmReadySidebar(0)}
        <main class="tbm-ready-workspace">
          <header class="tbm-ready-hero"><div><p><strong>00</strong><span><b>INTRODUCTION</b><small>TBM · 공통 안내</small></span></p><h1 id="tbm-ready-intro-title">TBM이란 무엇인가</h1><h2>작업 전에 함께 확인하는 참여형 안전활동</h2></div><aside><h3>TBM의 핵심</h3>${[['1','함께 확인합니다'],['2','오늘의 위험을 공유합니다'],['3','준비된 상태에서 작업을 시작합니다']].map(([n,t])=>`<p><span>${n}</span>${t}</p>`).join('')}</aside></header>
          <section class="tbm-ready-section is-white tbm-ready-why" data-ready-section="why"><header><b>WHY</b><h2>왜 TBM이 필요한가</h2><p>작업은 매일 같아 보여도, 작업내용, 작업자, 설비상태, 주변환경, 위험요인은 달라질 수 있습니다. 따라서 작업 시작 전에 오늘의 상태를 함께 확인합니다.</p></header><aside><span>01</span><p><b>TBM은 한 사람이 읽는 시간이 아니라 오늘 작업을 함께 확인하는 시간입니다.</b><small>모든 참여자가 동일한 안전 기준을 공유하는 것이 목표입니다.</small></p></aside></section>
          <section class="tbm-ready-section tbm-ready-flow" data-ready-section="tbm-flow"><header><b>TBM VISUAL FLOW</b><h2>9가지 TBM Action 전체 흐름</h2><p>PEOPLE, PREPARE, SHARE, START, READY의 5단계로 구성된 TBM의 전체 구조를 한눈에 확인합니다.</p></header><div><h3>9 STEPS OF TBM</h3>${[['PEOPLE',[['01','인원 확인','작업에 참여하는 모든 인원을 확인합니다.'],['02','건강상태 확인','작업자들의 건강 상태를 확인합니다.']]],['PREPARE',[['03','준비체조','작업 전 신체 준비를 합니다.'],['04','안전보호구 점검','필요한 보호구를 착용했는지 확인합니다.']]],['SHARE',[['05','참여형 유해·위험 포인트 발표','오늘의 작업에서 예상되는 위험요인을 발표합니다.'],['06','주요 사고사례 공유','최근 발생한 사례를 공유합니다.']]],['START',[['07','안전구호 실시','모든 확인을 마치고 안전구호를 실시합니다.']]],['READY',[['08','비상대피로 확인 및 비상연락체계 공유','대피 경로와 비상연락체계를 확인합니다.'],['09','작업 간 역할 발표','각 작업자의 역할을 명확히 합니다.']]]].map(([group,items])=>`<section><b>${group}</b><div>${items.map(([n,t,d])=>`<article><span>${n}</span><strong>${t}</strong><small>${d}</small></article>`).join('')}</div></section>`).join('')}</div></section>
          <section class="tbm-ready-start" data-ready-section="start"><h2>이제 시작합니다</h2><p>9개 TBM Action을 하나씩 실제로 어떻게 진행하는지 학습합니다. 다음 학습부터는 PEOPLE &amp; PREPARE를 시작합니다.</p></section>
          <nav class="tbm-ready-nav" aria-label="학습 이동"><span></span><a href="#tbm-course">학습 목록</a><a href="#tbm-nine-steps">다음 학습 →</a></nav>
        </main>
      </article>`);

    const learning01 = document.getElementById('tbm-nine-steps');
    if (learning01 && !learning01.querySelector(':scope > .tbm-ready-desktop-learning')) learning01.insertAdjacentHTML('beforeend', `
      <article class="tbm-ready-desktop-learning tbm-ready-l01" data-figma-source="243:576" data-ready-inventory="action-01|action-02|action-03|action-04|summary|bottom-navigation" aria-labelledby="tbm-ready-l01-title">
        ${renderTbmReadySidebar(1)}
        <main class="tbm-ready-workspace">
          <header class="tbm-ready-hero tbm-ready-l01-hero"><div><p><strong>01</strong><span><b>PEOPLE &amp; PREPARE</b><small>학습 01 / 03</small></span></p><h1 id="tbm-ready-l01-title">사람 확인과 준비</h1><h2>오늘 함께 작업하는 사람을 확인하고 몸과 보호구를 준비합니다</h2><p>안전자료가 없어서 사고가 발생하는 것은 아닙니다. 위험성평가도 있고, SOP도 있고, TBM도 합니다. 하지만 가장 먼저 확인해야 할 것은 ‘이 작업에 누가 참여하는가’입니다. TBM은 한 사람이 읽는 시간이 아니라 오늘 작업을 함께 확인하는 시간입니다.</p></div><aside><h3>이번 학습에서 배울 내용</h3>${['인원 확인','건강상태 확인','준비체조','안전보호구 점검'].map((t,i)=>`<p><span>0${i+1}</span>${t}</p>`).join('')}</aside></header>
          ${[
            ['action-01','PEOPLE','01','인원 확인','WHAT: TBM 참여 인원을 확인합니다.','단순 숫자 확인이 아니라, 오늘 함께 작업하는 사람이 누구인지, 작업 참여자가 모두 있는지 확인하는 시작 단계입니다. 작업의 책임과 역할을 명확히 하기 위해 필수적입니다.','HOW: 작업 시작 전 TBM 현장에서 참석자 확인을 진행합니다. 이름과 직책을 확인하여 역할 분담이 명확한지 확인합니다.','함께 일하는 사람을 아는 것이 안전의 시작입니다','누가, 무엇을, 언제, 어디서 하는지 명확히 해야 합니다.','assets/tbm/figma-ready/l01-action-01.png'],
            ['action-02','PEOPLE','02','건강상태 확인','WHAT: 작업 전 작업자의 상태를 확인합니다.','형식적인 ‘이상 없습니까?’ 한 번이 아니라, 실제 작업 수행에 영향을 줄 수 있는 상태 확인입니다. 수면 부족, 컨디션, 약 복용 등이 작업 안전에 영향을 줄 수 있습니다.','HOW: 서로 확인하는 문화를 조성합니다. 의학적 진단이나 건강정보 수집으로 확장하지 않습니다. 단순히 오늘의 작업을 안전하게 수행할 수 있는지에 대한 확인입니다.','건강 자가진단이 아닌 서로 확인하는 문화','작업 수행에 영향을 줄 수 있는 요인을 공유합니다.','assets/tbm/figma-ready/l01-action-02.png'],
            ['action-03','PREPARE','03','준비체조','WHAT: 작업 시작 전 몸을 준비하는 과정','근골격계 부상 예방과 작업 집중도를 향상시키기 위해 필요합니다. 형식적 체조가 아닌, 오늘 작업에서 많이 사용하는 부위 중심으로 진행합니다.','HOW: 전신 스트레칭과 작업 부위 중심 체조를 진행합니다. 새로운 운동법을 임의로 창작하지 않습니다. 현장에서 일반적으로 사용되는 안전 스트레칭을 기준으로 합니다.','형식적 체조가 아닌, 오늘 작업에서 많이 사용하는 부위 중심','근골격계 부상 예방을 목표로 합니다.','assets/tbm/figma-ready/l01-action-03.png'],
            ['action-04','PREPARE','04','안전보호구 점검','WHAT: 오늘 작업에 필요한 보호구를 확인하고 착용상태를 점검','단순 ‘PPE 착용’이 아닌, 오늘 작업 → 필요한 보호구 → 착용/상태 확인의 관계를 이해합니다. DS제어팀 Context: 전장 점검 시 절연장갑, 로봇 작업 시 안전모/보안경 등이 필수입니다.','HOW: 안전모, 안전화, 보안경, 안전장갑 등 작업별 필수 보호구 확인을 진행합니다. 보호구 파손, 사이즈 부적합, 미착용 확인을 필수로 진행합니다.','오늘의 작업에 맞는 보호구를 착용했는지 확인합니다','보호구 파손, 사이즈 부적합, 미착용 확인을 필수로 진행합니다.','assets/tbm/figma-ready/l01-action-04.png']
          ].map(([section,group,number,title,what,body,how,point,detail,image],index)=>`<section class="tbm-ready-section tbm-ready-action${index%2?'':' is-white'}" data-ready-section="${section}"><header><b>${group}</b><p><span>${number}</span><strong>${title}</strong></p><h2>${title}</h2></header><div><article><h3>${what}</h3><p>${body}</p><p>${how}</p><aside><span>${number}</span><p><b>${point}</b><small>${detail}</small></p></aside></article><figure><img src="${image}" alt="${title} 현장 사진"><figcaption>${title}</figcaption></figure></div></section>`).join('')}
          <section class="tbm-ready-summary" data-ready-section="summary"><header><b>PEOPLE &amp; PREPARE 정리</b><h2>4개 Action을 간단히 요약하는 정리 카드</h2></header><div>${[['01','인원 확인: 함께 일하는 사람 확인'],['02','건강상태: 서로의 상태 확인'],['03','준비체조: 몸 준비'],['04','보호구 점검: 오늘 작업에 맞는 보호구']].map(([n,t])=>`<p><span>${n}</span>${t}</p>`).join('')}</div></section>
          <nav class="tbm-ready-nav" aria-label="학습 이동"><a href="#tbm-purpose">← 이전 학습</a><a href="#tbm-course">학습 목록</a><a href="#tbm-scenario" data-complete-on-navigation="tbm-nine-steps">다음 학습 →</a></nav>
        </main>
      </article>`);

    const learning02 = document.getElementById('tbm-scenario');
    if (learning02 && !learning02.querySelector(':scope > .tbm-ready-desktop-learning')) learning02.insertAdjacentHTML('beforeend', `
      <article class="tbm-ready-desktop-learning tbm-ready-l02" data-figma-source="243:577" data-ready-inventory="action-05|action-06|share-summary|bottom-navigation" aria-labelledby="tbm-ready-l02-title">
        ${renderTbmReadySidebar(2)}
        <main class="tbm-ready-workspace">
          <header class="tbm-ready-hero tbm-ready-l02-hero"><div><p><strong>02</strong><span><b>SHARE — TBM ACTION 05–06</b><small>TBM Course에서 가장 중요한 2개 Action</small></span></p><h1 id="tbm-ready-l02-title">위험 공유와 사고사례</h1><h2>오늘의 작업 위험을 함께 발표하고, 사고사례에서 교훈을 얻습니다</h2><p>안전교육의 핵심은 문서를 읽는 것이 아니라 현장에서 발생할 수 있는 위험을 함께 인식하는 것입니다. TBM Action 05와 06은 작업자 스스로 위험을 발표하고, 사고사례를 오늘의 작업으로 연결하는 프로세스를 정립합니다.</p></div><aside><h3>이번 학습에서 배울 내용</h3><p><span>01</span>작업자가 직접 오늘 작업의 유해·위험 포인트를 발표</p><p><span>02</span>사고사례를 오늘 작업의 예방 기준으로 연결</p></aside></header>
          <section class="tbm-ready-section is-white tbm-ready-share" data-ready-section="action-05"><header><b>SHARE</b><p><span>05</span><strong>참여형 유해·위험 포인트 발표</strong></p><h2>참여형 유해·위험 포인트 발표</h2></header><div><article><h3>WHAT: 작업자가 직접 오늘 작업의 유해·위험 포인트를 발표</h3><p>관리자가 위험요인을 일방적으로 읽어주는 구조가 아닙니다. 작업자가 직접 ‘오늘 작업에서 무엇이 위험한가?’를 말하게 합니다. 이때의 핵심은 ‘듣기’가 아니라 ‘말하기’입니다.</p><p>HOW: ‘오늘 내 작업에서 가장 위험한 부분은 무엇입니까?’ — 작업자가 직접 발표. DS제어팀 Context: 전장 점검 시 잔류 전압, 시운전 시 구동부 접근, 기구설치 시 중량물 취급, 자동화설비 운전 중 작업자 접근 등.</p><aside><span>01</span><p><b>위험을 아는 것과 직접 말하는 것은 다릅니다</b><small>위험을 아는 것과 직접 말하는 것은 다릅니다. TBM에서 작업자가 직접 발표하는 이유입니다.</small></p></aside></article><aside class="tbm-ready-compare"><article><b>관리자 일방적 전달</b><p>듣기만 하면 내 작업과 연결하지 못함. 단순히 위험 요소를 열거하는 것에 그침.</p></article><article><b>참여형 발표</b><p>직접 말하면 내 작업의 위험을 인식하게 됨. 작업자 스스로 위험을 인지하고 대응합니다.</p></article></aside></div></section>
          <section class="tbm-ready-section tbm-ready-share" data-ready-section="action-06"><header><p><span>06</span><strong>주요 사고사례 공유</strong></p><h2>주요 사고사례 공유</h2></header><div class="tbm-ready-share-stack"><article><h3>WHAT: 오늘 작업과 관련된 주요 사고사례를 공유</h3><p>사고사례를 많이 보여주는 것이 목적이 아님. 핵심은 ‘오늘 작업에서 같은 일이 발생하지 않으려면 무엇을 확인해야 하는가?’입니다.</p><p>HOW: 관련 사고사례 소개 → 오늘 작업과의 연결점 확인 → 예방 행동 도출. 사고사례를 단순 정보로 끝내지 않고, ‘오늘 우리 작업에서는?’ 질문으로 연결합니다.</p><aside><span>01</span><p><b>사고사례는 과거의 기록이 아니라 오늘의 점검 기준입니다</b><small>사고사례는 과거의 기록이 아니라 오늘의 점검 기준입니다.</small></p></aside></article><article><h3>사례: S건설 중부 제3 물류센터 건립공사</h3><p>모바일 TBM 기능을 적극적으로 적용한 이후 안전 미조치 사항 보고가 일일 단위로 누락 없이 관리자의 데스크톱 대시보드에 즉시 안착되어 인가 전 무단 작업을 원천 차단하였습니다.</p><b>오늘 작업과의 연결점 확인 → 예방 행동 도출 →</b></article></div></section>
          <section class="tbm-ready-summary" data-ready-section="share-summary"><header><b>SHARE 정리</b><h2>Action 05와 06의 핵심 요약</h2></header><div><p><span>05</span>위험은 관리자가 읽는 것이 아니라 작업자가 직접 발표합니다</p><p><span>06</span>사고사례를 오늘 작업의 예방 기준으로 연결합니다</p></div></section>
          <nav class="tbm-ready-nav" aria-label="학습 이동"><a href="#tbm-nine-steps">← 이전 학습</a><a href="#tbm-course">학습 목록</a><a href="#tbm-life-rules" data-complete-on-navigation="tbm-scenario">다음 학습 →</a></nav>
        </main>
      </article>`);

    const learning03 = document.getElementById('tbm-life-rules');
    if (learning03 && !learning03.querySelector(':scope > .tbm-ready-desktop-learning')) learning03.insertAdjacentHTML('beforeend', `
      <article class="tbm-ready-desktop-learning tbm-ready-l03" data-figma-source="243:578" data-ready-inventory="action-07|action-08|action-09|practice|course-complete|bottom-navigation" aria-labelledby="tbm-ready-l03-title">
        ${renderTbmReadySidebar(3)}
        <main class="tbm-ready-workspace">
          <header class="tbm-ready-hero tbm-ready-l03-hero"><div><p><strong>03</strong><span><b>READY &amp; START — TBM ACTION 07–09</b><small>학습 03 / 03</small></span></p><h1 id="tbm-ready-l03-title">대응 준비와 작업 시작</h1><h2>비상상황 대비, 역할 확인, 그리고 함께 안전하게 시작합니다</h2><p>TBM은 단순히 위험을 공유하는 시간이 아닙니다. 비상 상황 발생 시 대피로와 연락체계를 확인하고, 작업자들이 각자의 역할을 명확히 발표하는 참여형 프로세스를 정립합니다. 마지막으로 안전구호를 통해 모든 확인이 완료되었음을 확인하고 작업을 시작합니다.</p></div><aside><h3>이번 학습에서 배울 내용</h3><p><span>01</span>비상 상황 발생 시 대피로와 연락체계를 확인</p><p><span>02</span>작업자 스스로 역할과 담당 범위를 발표</p><p><span>03</span>안전구호를 통해 작업 시작을 함께 확인</p></aside></header>
          ${[
            ['action-07','START','07','안전구호 실시','WHAT: 9개 확인을 마친 뒤, 오늘의 위험과 역할을 다시 인식하고 작업 시작을 함께 확인하는 마무리','안전구호는 TBM 전체를 마무리하는 행위입니다. 모든 확인이 완료되었다는 신호이며, 장식적인 행사로 표현하지 않습니다.','HOW: 전원이 함께 안전구호를 외치며 작업 시작. TBM이 끝나야 작업이 시작됨을 명확히 합니다.','TBM이 끝나야 작업이 시작됨을 명확히 합니다','TBM이 끝나야 작업이 시작됨을 명확히 합니다. 안전구호는 작업 시작의 공식적인 시작점입니다.','assets/tbm/figma-ready/l03-action-07.png'],
            ['action-08','READY','08','비상대피로 확인 및 비상연락체계 공유','WHAT: 비상상황 발생 시 어디로 이동하고 누구에게 연락하는지 확인','비상 상황은 예고 없이 발생합니다. 대피로와 연락체계를 사전에 확인하여 혼란을 방지하는 것이 중요합니다.','HOW: 비상대피로 위치 확인 + 비상연락체계 (현장 관리자, 안전관리자 등) 공유. 새로운 작업장이나 변경된 환경에서 특히 중요합니다.','새로운 작업장이나 변경된 환경에서 특히 중요합니다','새로운 작업장이나 변경된 환경에서 특히 중요합니다. 연락체계는 사전에 명확히 공유되어야 합니다.','assets/tbm/figma-ready/l03-action-08.png'],
            ['action-09','','09','작업 간 역할 발표','WHAT: 오늘 작업에서 누가 무엇을 어디까지 담당하는지 서로 확인','단순 작업지시가 아닌 참여형 역할 확인입니다. 작업자가 자기 역할을 직접 말함으로써 책임이 명확해집니다.','HOW: 각 작업자가 본인의 역할과 담당 범위를 발표. DS제어팀 Context: 시운전(제어반/현장 확인), 기구작업(인양/유도/안전 감시), 설비 조치(전원 차단/작업/확인) 등.','역할이 명확하면 책임이 명확합니다','역할이 명확하면 책임이 명확합니다. 모호한 역할이 사고를 만듭니다.','assets/tbm/figma-ready/l03-action-09.png']
          ].map(([section,group,number,title,what,body,how,point,detail,image],index)=>`<section class="tbm-ready-section tbm-ready-action${index%2?'':' is-white'}" data-ready-section="${section}"><header>${group?`<b>${group}</b>`:''}<p><span>${number}</span><strong>${title}</strong></p><h2>${title}</h2></header><div><article><h3>${what}</h3><p>${body}</p><p>${how}</p><aside><span>${number}</span><p><b>${point}</b><small>${detail}</small></p></aside></article><figure><img src="${image}" alt="${title} 현장 사진" data-viewer-title="${title}"><figcaption>${title}</figcaption></figure></div></section>`).join('')}
          <section class="tbm-ready-practice" data-ready-section="practice" data-tbm-practice><header><b>PRACTICE</b><h2>지식 자가 측정</h2><p>오늘 배운 대응 준비와 작업 시작 핵심을 복습해 보는 실전 문제입니다.</p></header>${[
            ['q1','Q1. TBM 중 관리자가 오늘 작업의 위험요인을 혼자 읽고 작업자들은 듣기만 했습니다. 가장 부족한 부분은?','B',[['A','인원 확인이 부족했다'],['B','작업자가 직접 유해·위험 포인트를 발표하고 공유하는 참여 과정이 부족했다'],['C','안전구호를 하지 않았다'],['D','준비체조 시간이 부족했다']],"TBM Action 05 ‘참여형 유해·위험 포인트 발표’는 작업자가 직접 오늘 작업의 위험을 발표하고 공유하는 활동입니다."],
            ['q2','Q2. 여러 작업자가 함께 시운전을 하지만 각자의 역할을 확인하지 않았습니다. 어떤 TBM Action이 부족한가?','C',[['A','05 참여형 유해·위험 포인트 발표'],['B','06 주요 사고사례 공유'],['C','08 작업 간 역할 발표'],['D','09 안전구호 실시']],"TBM Action 08 ‘작업 간 역할 발표’에서 누가 무엇을 담당하는지 서로 확인합니다."]
          ].map(([id,question,answer,choices,hint])=>`<fieldset data-tbm-question="${id}" data-answer="${answer}"><legend>${question}</legend><div>${choices.map(([letter,text])=>`<label><input type="radio" name="tbm-l03-${id}" value="${letter}"><span>${letter}</span>${text}</label>`).join('')}</div><button type="button" data-tbm-check>정답 확인</button><p data-tbm-feedback hidden aria-live="polite"></p><aside data-tbm-hint hidden>${hint}</aside><button type="button" data-tbm-retry hidden>재시도</button></fieldset>`).join('')}</section>
          <section class="tbm-ready-course-complete" data-ready-section="course-complete"><header><b>과정 완료</b><h2>TBM Course 01–09 학습 완료</h2></header><p><span>✓</span>사람을 확인하고 → 몸과 보호구를 준비하고 → 위험과 사고사례를 공유하고 → 비상대응과 역할을 확인하고 → 함께 안전하게 작업을 시작합니다.</p><aside><b>ONOFF CONNECTION</b><p>ONOFF에서는 관련 TBM 자료가 오늘 작업의 안전자료와 연결될 수 있습니다.</p></aside></section>
          <nav class="tbm-ready-nav" aria-label="학습 이동"><a href="#tbm-scenario">← 이전 학습</a><a href="#tbm-course">학습 목록</a><a class="is-locked" aria-disabled="true" data-learning-complete="tbm-life-rules">목차로 돌아가기 →</a></nav>
        </main>
      </article>`);

    const l03Practice = learning03?.querySelector('[data-tbm-practice]');
    if (l03Practice && !l03Practice.dataset.bound) {
      l03Practice.dataset.bound = 'true';
      const completedQuestions = new Set();
      const completeLink = learning03.querySelector('.tbm-ready-l03 .tbm-ready-nav [data-learning-complete]');
      l03Practice.addEventListener('change', (event) => {
        const fieldset = event.target.closest('[data-tbm-question]');
        fieldset?.querySelector('[data-tbm-check]')?.removeAttribute('disabled');
      });
      l03Practice.addEventListener('click', (event) => {
        const fieldset = event.target.closest('[data-tbm-question]');
        if (!fieldset) return;
        if (event.target.closest('[data-tbm-check]')) {
          const selected = fieldset.querySelector('input:checked');
          if (!selected) return;
          const correct = selected.value === fieldset.dataset.answer;
          const feedback = fieldset.querySelector('[data-tbm-feedback]');
          feedback.hidden = false;
          feedback.textContent = correct ? '정답입니다.' : '다시 확인해 보세요.';
          feedback.className = correct ? 'is-correct' : 'is-incorrect';
          fieldset.querySelector('[data-tbm-hint]').hidden = correct;
          fieldset.querySelector('[data-tbm-retry]').hidden = correct;
          fieldset.querySelectorAll('input').forEach((input) => { input.disabled = true; });
          if (correct) completedQuestions.add(fieldset.dataset.tbmQuestion);
          if (completedQuestions.size === 2) {
            completeLink.classList.remove('is-locked');
            completeLink.removeAttribute('aria-disabled');
            completeLink.href = '#tbm-course';
          }
        }
        if (event.target.closest('[data-tbm-retry]')) {
          fieldset.querySelectorAll('input').forEach((input) => { input.disabled = false; input.checked = false; });
          fieldset.querySelector('[data-tbm-feedback]').hidden = true;
          fieldset.querySelector('[data-tbm-hint]').hidden = true;
          fieldset.querySelector('[data-tbm-retry]').hidden = true;
          fieldset.querySelector('[data-tbm-check]').disabled = true;
        }
      });
      completeLink?.addEventListener('click', (event) => {
        if (completeLink.classList.contains('is-locked')) { event.preventDefault(); event.stopImmediatePropagation(); }
      });
    }
  };
  mountExactTbmDesktopLearning();

  const mountExactSopDesktopLearning = () => {
    if (!desktopHomeMedia.matches) return;
    const sop01 = document.getElementById('sop-purpose');
    if (sop01 && !sop01.querySelector(':scope > .sop-ready-desktop-learning')) sop01.insertAdjacentHTML('beforeend', `
      <article class="figma-ready-desktop-learning sop-ready-desktop-learning sop-ready-l01" data-figma-source="190:117" data-ready-inventory="why|read|concept|field-context|complete|bottom-navigation" aria-labelledby="sop-ready-l01-title">
        ${renderSopReadySidebar(0)}
        <main class="sop-ready-workspace">
          <header class="sop-ready-hero"><div><p><strong>01</strong><span><b>PART 01 · 표준작업의 시작</b><small>학습 01 / 04</small></span></p><h1 id="sop-ready-l01-title">표준작업절차서(SOP)의 이해</h1><h2>작업 순서의 단순한 나열을 넘어, 나와 동료를 지키는 가장 신뢰할 수 있는 가이드라인</h2><p>표준작업절차서(SOP)는 현장의 풍부한 지식과 안전 노하우가 결집된 행동 지침입니다. 이 장에서는 왜 SOP가 단순한 서류작업이 아닌 실질적인 약속인지, 그리고 실제 작업 전 무엇을 반드시 식별해야 하는지 배웁니다.</p></div><aside><b>이 장에서 중점적으로 다룰 내용</b>${['SOP가 현장의 무사고와 일관된 품질을 담보하는 원리','실무 절차서에서 즉시 식별해야 하는 8대 핵심 구조 영역','설비 변경 및 돌발 상황 등 SOP 준수가 극도로 중요해지는 변수','DS제어팀 특화 작업 환경별 핵심 SOP 예시'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="sop-ready-section sop-ready-why" data-ready-section="why"><header><b>WHY</b><h2>왜 SOP가 필요한가</h2><p>아무리 능숙한 기술자라도, 변화무쌍한 현장 상황 속에서 ‘나의 기억과 경험’에만 의존해 판단하는 순간 사각지대가 발생합니다.</p></header><div class="sop-ready-two-cards"><article class="is-danger"><h3>SOP 없이 또는 무시하고 작업할 때</h3><p>작업자마다 개인적 편의에 따라 진행 방식이 달라집니다. 필수 차단(LOTO) 프로세스가 누락될 확률이 높고, 돌발 상황 발생 시 체계적 복구 절차가 없어 더 큰 2차 재해로 직결됩니다.</p><strong>결과: 동일한 결함의 반복적 발생, 안전 점검 누락, 인적 재해 발생률 급증</strong></article><article class="is-safe"><h3>SOP 가이드라인을 철저히 준수할 때</h3><p>누가 현장에 투입되든 안전하고 예측 가능한 일관된 성과를 만듭니다. 공정별 유해 요인을 선제적으로 제거하고, 비정상 징후 발견 시 안전한 비상 정지 절차가 즉각 작동합니다.</p><strong>결과: 휴먼 에러 제로화, 유해 물질 및 기구 통제, 주도적 위험 회피 수립</strong></article></div><p class="sop-ready-statement">SOP는 작업 방식을 통제하기 위한 차가운 지침서가 아닙니다. 현장의 성공 사례와 안전 교훈을 결합하여, 단 한 번의 사소한 누락으로 인한 상해 없이 안전하게 퇴근할 수 있도록 보장하는 유기적인 프로세스입니다.</p></section>
          <section class="sop-ready-section is-white sop-ready-read" data-ready-section="read"><header><b>READ</b><h2>SOP에서 무엇을 확인하는가</h2><p>작업 투입 전, 전체 페이지를 겉으로 훑기만 하지 말고 다음 8대 핵심 구조 영역을 세부적으로 식별해야 합니다.</p></header><div class="sop-ready-read-grid"><article class="sop-ready-document"><header><strong>SOP-DS-041</strong><b>표준작업 지침서 (SOP)</b><small>Rev 2.4</small></header>${[['1. 목적 및 적용 범위 (Scope)','제어반 통전 상태 전장 점검 관련 일체 범위 규정'],['2. 작업 전 준비사항 (Pre-reqs)','회로도 확보 및 해당 파트 전기 배선 유무 교차 점검'],['3. 개인 보호구 소요 대장 (PPE)','절연장갑, 보안경, 절연화 및 비전도성 도구 구비'],['4. 단계별 안전 작업순서 (Sequence)','외함 상태 진단 → 제어반 도어 개방 → 회로 테스터 확인'],['5. 주요 잠재 위험요인 (Hazards)','통전 케이블 접촉 시 2차 충격 및 고전압 아크 위험'],['6. 핵심 주의 및 금지사항 (Prohibited)','허가받지 않은 임시 배선 가압 금지'],['7. 비정상 이상 상황 대응 (Abnormal)','쇼트 발생 시 주전원 즉시 차단 및 비상 대피'],['8. 작업 마무리 및 정리 (End Checklist)','잔류 전압 확인, 도어 폐쇄, 차단 표지판 회수']].map(([title,text],index)=>`<p${index<4?' class="is-focus"':''}><b>${title}</b><span>${text}</span></p>`).join('')}</article><article class="sop-ready-analysis"><h3>SOP Document 8대 필수 영역 분석</h3><p>절차서는 아무리 복잡해도 아래의 8개 뼈대로 요약됩니다.</p>${['작업 목적과 범위','작업 전 준비사항','필요한 보호구','작업순서','위험요인','주의·금지사항','비정상 대응','작업 후 정리'].map((item,index)=>`<p><b>0${index+1} ${item}</b><span>${['통제하는 장비와 대상을 먼저 인지합니다.','전원 차단과 LOTO 등 사전 정지 요건을 검토합니다.','절연·내화학 등 작업별 보호 장구를 확인합니다.','표준 공정 시퀀스와 안전 동선을 확인합니다.','예상되는 물리·화학적 위험을 식별합니다.','절대 생략하거나 임의 변경할 수 없는 사항입니다.','이상 징후 발견 시 정지·보고·대피 순서를 따릅니다.','잔류 에너지와 정리정돈 상태를 최종 확인합니다.'][index]}</span></p>`).join('')}</article></div></section>
          <section class="sop-ready-section sop-ready-concept" data-ready-section="concept"><header><b>CONCEPT</b><h2>SOP는 단순 문서가 아닙니다</h2><p>SOP는 가끔만 들여다보는 번거로운 규정이 아닙니다. 그것은 현장의 작업 기준과 안전 기준, 그리고 공정 변경 관리를 하나로 묶어 제공하는 확고한 안전의 세 개의 기둥입니다.</p></header><div>${[['01','작업 기준 (Work Standards)','누가 작업하더라도 동일한 고품질 시퀀스를 무조건 보장합니다. 일관된 세부 점검 속도를 약속하여 기술 전수 편차를 해소합니다.'],['02','안전 기준 (Safety Standards)','공정마다 예상될 수밖에 없는 각종 기구 및 전장 충격을 최소화합니다. 방어막과 보호 장구에 대한 한계치를 사전 규정하여 사고를 차단합니다.'],['03','변경 관리 기준 (MOC Standards)','설비 사양이나 공구 변경 시 새로운 위험요소를 가장 신속히 분석해냅니다. 항상 진화하는 살아있는 데이터로 현장을 제어합니다.']].map(([number,title,text])=>`<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div><aside><strong>현장의 치명적 오해: “늘상 하던 작업이라 SOP 안 봐도 다 기억합니다”</strong><p>바로 이 경험 기반의 교만이 재해의 숨겨진 원천입니다. 설비·작업조건·부품·작업범위 변경이 일어날 때는 반드시 최신 SOP 원문을 교차 조회해야 합니다.</p></aside></section>
          <section class="sop-ready-section is-white sop-ready-field" data-ready-section="field-context"><header><b>FIELD</b><h2>DS제어팀 작업환경에서의 SOP</h2><p>실제 반도체 및 물류 DS제어 시스템 현장에서 직면하게 되는 4대 대표 핵심 작업 범위와 이에 각각 유기적으로 부여된 표준 절차서 확인 관점을 학습합니다.</p></header><div>${[['01','전장 작업','전장 외함 통전 진단 시 절연 장갑과 비전도성 계측기 인입 여부를 규명하고, 타인 임의 전원 가압 금지 차단 잠금(LOTO)을 확인합니다.'],['02','시운전 작업','모터 및 구동부 회전 시 안전 거리, 복장 체크리스트, 실시간 제동 제어 버튼(E-Stop) 위치를 완벽하게 점검합니다.'],['03','기구 설치 및 조정','중량 장치 결합 중 끼임·낙하 방지를 위한 크레인과 거치대 정합 시퀀스를 준수하고 작업구간 하부 진입을 통제합니다.'],['04','설비 Trouble 및 BM','돌발 고장 시 임의 우회 배선을 금지하고 작업 중지권을 발동하여 복구 시퀀스 SOP를 확인한 후 움직입니다.']].map(([number,title,text])=>`<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>
          <section class="sop-ready-complete" data-ready-section="complete"><div><b>학습 완료</b><h2>학습 01 · 표준작업절차서(SOP)의 이해 학습 완료</h2>${['SOP의 정의와 이 지침이 나의 신체와 현장 신뢰도를 지키는 실질적인 생명선임을 완벽히 마스터하였습니다.','절차서상의 목적, PPE 보호구 대장, 비정상 대책 등 8개 핵심 영역을 시각적으로 신속하고 정량적으로 구별하는 방법을 학습하였습니다.','변수 상황(설비, 기후, 작업자 피로도) 변경에 대입해 고정된 지침서를 실시간 동적 안전 프로세스로서 바라보는 안목을 갖추었습니다.','DS제어팀 특유의 현장 범위(전장, 시운전, 기구 조정, Trouble)별 구체적인 작업 체크 실태를 비교 습득하였습니다.'].map(item=>`<p><span>✓</span>${item}</p>`).join('')}</div></section><nav class="sop-ready-nav" aria-label="학습 이동"><a href="#sop-course">학습 목록</a><a href="#sop-reading" data-complete-on-navigation="sop-purpose">다음 학습 →</a></nav>
        </main>
      </article>`);

    const sop02 = document.getElementById('sop-reading');
    if (sop02 && !sop02.querySelector(':scope > .sop-ready-desktop-learning')) sop02.insertAdjacentHTML('beforeend', `
      <article class="figma-ready-desktop-learning sop-ready-desktop-learning sop-ready-l02" data-figma-source="190:414" data-ready-inventory="prepare|checklist-panel|field-context|follow|warning|watch|hazard-cards|practice|complete|bottom-navigation" aria-labelledby="sop-ready-l02-title">
        ${renderSopReadySidebar(1)}
        <main class="sop-ready-workspace">
          <header class="sop-ready-hero"><div><p><strong>02</strong><span><b>PART 01 · 표준작업의 시작</b><small>학습 02 / 04</small></span></p><h1 id="sop-ready-l02-title">작업 준비와 실행</h1><h2>작업은 확인과 준비 없이 바로 시작할 수 없습니다.</h2><p>SOP를 기준으로 작업 전 준비사항과 표준 작업순서를 확인하고, 발생 가능한 위험과 주의사항을 이해합니다.</p></div><aside><b>이 장에서 중점적으로 다룰 내용</b>${['작업 시작 전 반드시 확인해야 하는 4대 준비 항목','SOP에 규정된 순서를 현장에서 확인하는 방법','임의 절차 생략 시 발생하는 리스크와 대표 재해 예방안'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="sop-ready-section sop-ready-prepare" data-ready-section="prepare"><header><b>PREPARE</b><h2>작업 전 무엇을 준비하는가</h2><p>완벽한 안전과 높은 무결성을 보장하기 위해 작업 개시 신호를 내리기 전 반드시 수립해야 하는 4대 방어 장벽입니다.</p></header><div class="sop-ready-prepare-grid"><article class="sop-ready-checklist" data-ready-section="checklist-panel"><h3>작업 시작 전 필수 4단계 체크리스트</h3>${[['01','최신 SOP 규정 확인','해당 설비 및 공정에 맞춰 공식 배포된 최신 개정판 가이드라인을 확인하고, 통전/차단 범위 및 특이 시퀀스를 교차 검증합니다.'],['02','작업 대상 유효 점검','작업 지시서상의 장비 일련번호 및 타겟 회로 구성을 대조하여, 엉뚱한 설비를 오동작시키는 인적 오류를 원천 예방합니다.'],['03','전용 개인 보호구 착용','고전압 아크 및 기구 충격 등 작업 위험에 맞춤화된 규격 보호구(절연장갑, 절연화, 방전복 등)의 상태와 유효 수명을 검증합니다.'],['04','작업 주변 환경 통제','접근 제한 가로막 수립, 바닥면 수분 제거, 고소 안전 통로 확보 등 잠재적인 보조 방해 요인들을 즉각 해소합니다.']].map(([number,title,text])=>`<p><span>${number}</span><b>${title}</b><small>${text}</small></p>`).join('')}</article><article class="sop-ready-field-panel" data-ready-section="field-context"><b>FIELD EXAMPLES</b><p>반도체 클린룸 내부나 역동적인 물류 제어 라인에서 진행되는 전장 제어반 작업 전에는 일반적인 육안 확인을 넘어선 고도의 집중 점검이 요구됩니다.</p><div><strong>1. 작업 대상 설비 통제 확인</strong><span>LOTO(Lock-Out Tag-Out) 장치의 결합 상태를 전수 확인하여 보수 중인 제어반에 타인이 임의로 전원을 연결하는 행위를 차단합니다.</span></div><div><strong>2. 계측 한계 도구 적합성 검증</strong><span>사용할 오실로스코프나 멀티미터기가 타겟 가압 전압 한계를 지원하는지, 리드선 피복에 균열이 가거나 찢긴 부분이 없는지 정밀 점검합니다.</span></div></article></div></section>
          <section class="sop-ready-section is-white sop-ready-follow" data-ready-section="follow"><header><b>FOLLOW</b><h2>작업순서를 어떻게 확인하는가</h2><p>절차서는 현장에서 누적된 모범 노하우와 안전 수칙이 결합된 가이드입니다.</p></header><div class="sop-ready-follow-grid"><article><h3>DS제어팀 시운전 표준 시퀀스</h3>${[['01','작업 범위 및 조건 확인','최신 가이드라인 대조'],['02','안전조치 확인','LOTO 설치 및 주변 구역 통제'],['03','설비 상태 확인','전원 무압화 및 인터락 검증'],['04','작업 실행','SOP 표준 공정 동선 엄수'],['05','완료 확인','정리정돈 및 잔류 통전 테스트']].map(([number,title,text])=>`<p><span>${number}</span><b>${title}</b><small>${text}</small></p>`).join('')}</article><aside data-ready-section="warning"><h3>임의 순서 생략: 사고의 근본적 단초</h3><p>“바쁜 일정 때문에 안전조치를 넘어뛰고 작업을 시작하자”는 판단은 방치된 가압 설비로 인한 중대사고를 초래합니다.</p><strong>시나리오: 인터락 우회 구동 시의 끼임 사고</strong><p>안전조치를 거치지 않고 설비 가교 라인을 구동하면 기구가 급출발하여 작업자의 신체가 끼일 수 있습니다.</p></aside></div></section>
          <section class="sop-ready-section sop-ready-watch" data-ready-section="watch"><header><b>WATCH</b><h2>어떤 위험과 주의사항을 확인하는가</h2><p>SOP에는 발생할 수 있는 세 가지 치명적 물리 위해 상황에 대한 극복 지침이 포함되어 있습니다.</p></header><div class="sop-ready-hazards" data-ready-section="hazard-cards">${[['전장 작업','01','전원 미차단 상태 전장 점검','통전 상태에서 절연 장비 없이 배선을 건드리면 감전과 2차 추락 위험이 있습니다.','LOTO 잔류 전압 제로 검사','상 (High Danger)'],['시운전 작업','02','구동부 동작 중 위험구역 접근','가동 중 울타리 내부로 진입하면 회전 기어와 모터에 신체가 말려들 수 있습니다.','인터락 안전 도어 잠금 스위치','최상 (Extreme)'],['기구 설치','03','중량부품 미고정 상태 조립','가고정 상태에서 조립하면 모듈 이탈과 낙하로 협착 상해가 발생할 수 있습니다.','지지대 이중 안전 와이어','중 (Medium)']].map(([tag,number,title,text,check,level])=>`<article><header><b>${tag}</b><span>${number}</span></header><h3>${title}</h3><p>${text}</p><small>핵심 체크: ${check}</small><strong>위험 등급: ${level}</strong></article>`).join('')}</div></section>
          <section class="sop-ready-practice ready-practice" data-ready-section="practice" data-ready-answer="B"><b>PRACTICE</b><h2>학습 확인</h2><p>이해도를 완벽하게 점검하기 위해 다음 시나리오 질문에 대해 올바른 SOP 중심 판단을 전개해 보십시오.</p><article><h3>Q. 자동화설비 시운전 SOP에 따르면 설비 구동 전 안전조치 확인(LOTO 완료 및 인터락 점검)이 전제되어야 합니다. 그러나 시운전 시작 예정 시간이 다 되었으나 LOTO 철회가 늦어져 현장에서 구두 확인만 하고 급히 구동을 전개하려고 합니다. 이때 가장 올바른 판단은 무엇입니까?</h3><div class="ready-practice-options">${[['A','숙련된 주임 작업자이므로 본인의 경험상 문제가 없을 것으로 신뢰하고 시운전을 개시한다.'],['B','시운전 시간을 지연시키더라도 생략된 LOTO 오프 및 실제 기구 안전 장벽을 정상 확인한 후에 개시한다.'],['C','시간 부족 압박에 맞춰 시운전 초기 모터 회전 속도를 30% 감쇄 통제하면서 안전하게 지시를 수행한다.'],['D','작업반장 및 안전 담당 관리자에게 사전에 전화 유선 합의를 획득한 후 빠른 속도로 구동을 이행한다.']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>정해진 안전조치와 실제 설비 상태를 모두 확인하기 전에는 작업을 시작하지 않습니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></article></section>
          <section class="sop-ready-complete" data-ready-section="complete"><div><b>학습 완료</b><h2>학습 02 · 작업 준비와 실행 학습 완료</h2>${['작업 직전 확인해야 할 SOP·대상·보호구·환경의 4대 통제 관점을 습득했습니다.','단계별 안전 작업순서의 정합 원리를 확인했습니다.','대표적 위해 사례와 예방 대책을 확인했습니다.'].map(item=>`<p><span>✓</span>${item}</p>`).join('')}</div></section><nav class="sop-ready-nav" aria-label="학습 이동"><a href="#sop-purpose">← 이전 학습</a><a href="#sop-course">학습 목록</a><a href="#sop-structure" data-complete-on-navigation="sop-reading">다음 학습 →</a></nav>
        </main>
      </article>`);

    const sop03 = document.getElementById('sop-structure');
    if (sop03 && !sop03.querySelector(':scope > .sop-ready-desktop-learning')) sop03.insertAdjacentHTML('beforeend', `
      <article class="figma-ready-desktop-learning sop-ready-desktop-learning sop-ready-l03" data-figma-source="190:650" data-ready-inventory="change|flow-visual|abnormal|mindset|result|practice|complete|bottom-navigation" aria-labelledby="sop-ready-l03-title">
        ${renderSopReadySidebar(2)}
        <main class="sop-ready-workspace">
          <header class="sop-ready-hero"><div><p><strong>03</strong><span><b>PART 01 · 표준작업의 시작</b><small>학습 03 / 04</small></span></p><h1 id="sop-ready-l03-title">변경과 비정상 상황</h1><h2>작업 조건이 달라졌을 때의 대처와 돌발적 비정상 시나리오 극복 가이드</h2><p>실제 현장에서는 설계 사양의 미세한 오차, 임시 부품 교체, 혹은 갑작스러운 기온과 전압 변화 등 수많은 변수가 발생합니다. 이번 단원에서는 익숙한 환경이 예기치 않게 변화하는 상황에서, 숙련자의 직관 대신 SOP에 내포된 안전 규칙을 이끌어내어 사고를 원천 봉쇄하는 구체적 대응 방침을 파악합니다.</p></div><aside><b>이 장에서 중점적으로 다룰 내용</b>${['작업조건 변경 시 SOP 재확인을 통한 위험요소 식별 프로세스','비정상 상황 발생 시 즉각 중지(STOP) 및 보고 체계 확립','경험치에 의존한 무단 우회작업의 한계와 휴먼에러 예방책','DS제어팀 돌발 시운전 상황별 등급 저감 시뮬레이션'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="sop-ready-section is-white sop-ready-change" data-ready-section="change"><header><b>CHANGE</b><h2>작업조건이 달라졌다면 어떻게 하는가</h2><p>설비, 조건, 부품, 범위 등 네 가지 핵심 작업 조건 중 단 하나라도 기존 기준과 일치하지 않는다면 새로운 잠재 위험이 개입한 것입니다.</p></header><div class="sop-ready-change-grid"><article class="sop-ready-flow" data-ready-section="flow-visual"><h3>변경 감지 시 5단계 행동 시퀀스</h3>${[['01','CHANGE DETECTED','이전 작업과 다른 설비, 부품, 범위 식별'],['02','IMMEDIATE STOP','동작 개시 보류 및 가압 차단 상태 유지'],['03','CHECK SOP','변경된 상황에 부합하는 최신 표준 절차 조회'],['04','RECONFIRM & APPROVE','관리자 교차 검증 및 안전장벽 재수립'],['05','SAFE PROCEED','승인된 절차 및 보강된 PPE 착용 후 진행']].map(([n,en,ko])=>`<p><b>${n} ${en}</b><span>${ko}</span></p>`).join('')}</article><article class="sop-ready-change-copy"><h3>시운전 실무에서의 적용 사례</h3><p>전장 점검 단계 중 <strong>‘설비가 완전히 정지된 상태’</strong>에서 <strong>‘설비가 실제 작동 중인 시운전 상태’</strong>로 공정이 이행될 때가 대표적입니다.</p><p>대상 설비 자체는 완벽하게 동일하지만, 회전체와 고전압 가압이라는 새로운 동적 작업조건이 추가됨에 따라 기존 정지상태용 SOP는 즉시 유효성을 상실합니다. 작업자는 반드시 가동 중 상태의 위험요인과 보강된 PPE 기준을 새롭게 대입해야 합니다.</p><aside><b>핵심 원칙: 작업조건 변경 → 위험요인 신규 개입 → 안전절차 재수립</b><span>기존 경험에 기반하여 “잠깐이니까 그대로 테스트해도 괜찮겠지” 하는 사소한 유도가 현장 협착 및 감전 사고의 시발점이 됩니다.</span></aside></article></div></section>
          <section class="sop-ready-section sop-ready-abnormal" data-ready-section="abnormal"><header><b>ABNORMAL</b><h2>비정상 상황에서는 어떻게 판단하는가</h2><p>정해진 절차를 따를 수 없거나 예상치 못한 경보음, 부품 오동작이 일어나는 순간이 비정상 상황입니다.</p></header><div class="sop-ready-two-cards"><article class="is-safe"><h3>NORMAL (정상 상태 작업)</h3><p>• SOP에 기재된 사양 및 정해진 동선 내에서 작업 진행<br>• 안전 차단 장치(LOTO)가 공식적으로 유지되어 안전 보장<br>• 예상된 제어반 극성 및 전압 범위 확인 하에 계측 진행</p><strong>결과: 휴먼에러 차단, 규격화된 고품질 제어 무결성 달성</strong></article><article class="is-danger"><h3>ABNORMAL (비정상/돌발 상태)</h3><p>• 가동 제어 중 타깃 배선 오차로 돌발 정지 또는 비정상 경보 작동<br>• 센서 위치 불일치로 인한 구동 기구 충돌 위험 및 잔류 가압 발생<br>• 일정 압박 속에서 비계획적 긴급 조치(BM) 투입 요구</p><strong>행동지침: STOP → CHECK → RECONFIRM</strong></article></div><aside class="sop-ready-editorial"><b>SOP 무단 바이패스(Bypass) 절대 금지</b><p>비정상적인 오작동 현상이 지속될 때, “신속한 가동 복구”라는 시간 압박 때문에 무단으로 배선 가교를 놓거나 안전 연동(인터락)을 수동으로 우회하는 시도는 대형 재해의 직격탄이 됩니다. 복구가 아무리 급하더라도 기입된 복구 시나리오 SOP의 통제를 받으십시오.</p></aside></section>
          <section class="sop-ready-section is-white sop-ready-mindset" data-ready-section="mindset"><header><b>MINDSET</b><h2>경험만으로 판단하지 않습니다</h2><p>작업자의 누적된 숙련도와 최신 규격 SOP의 절차 준수 확인은 결코 타협하거나 맞바꿀 수 있는 개념이 아닙니다.</p></header><aside class="sop-ready-danger"><b>현장의 심각한 고정관념: “백 번도 더 해본 제어반 작업이라 눈 감고도 외웁니다”</b><p>이러한 자만이 가장 안전해야 할 베테랑의 현장에서 불시의 감전과 기구 파손을 초래합니다. 수천 번 익숙하게 완료했던 작업이더라도, 다음에 대입되는 변경점 때문에 기억의 공백이 개입하는 것을 막기 위해 SOP 원문을 확인하십시오.</p></aside><div class="sop-ready-mindset-grid">${[['01','기억의 한계성 자각','인간의 단기 기억과 노하우는 신체 피로, 조도 변화, 타 파트 동시 소음 등 외부 조건의 개입에 의하여 순간적으로 오류를 일으킵니다.'],['02','미세 설계 변경의 덫','겉으로 보기에는 동일해 보이는 제어 기판과 터미널 블록도, 패치 버전 업데이트에 따라 내부 접지선 극성 및 LOTO 조건이 전혀 다를 수 있습니다.'],['03','법적 및 공식적 입증 보증','최신 SOP 확인과 승인 절차는 안전한 판단과 작업 이행을 객관적으로 입증하는 기준입니다.']].map(([n,t,d])=>`<article><span>${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div></section>
          <section class="sop-ready-section sop-ready-result" data-ready-section="result"><header><b>RESULT</b><h2>대책 적용 전후 비교</h2><p>SOP를 적극 준수하고 작업조건 변경에 보강책을 매칭했을 때, 실질적인 현장 잠재 위험 지수가 어떻게 저감되는지 시뮬레이션합니다.</p></header><div class="sop-ready-result-grid">${[['CASE 1 · 시운전 작업조건 변경 시','기존 정지상태 점검 SOP 무리하게 대입해 진행','위험 등급: 4등급 (심각 위험)','변경된 시운전 SOP 적용 및 안전장벽 가압 확인','위험 등급: 2등급 (허용 가능)'],['CASE 2 · 설비 Trouble 긴급 조치 시','가동 지연 우려로 현장 LOTO 생략 후 즉흥 점검','위험 등급: 5등급 (극대화 위협)','긴급 상황 시에도 핵심 LOTO 체계 및 SOP 동선 수립','위험 등급: 2등급 (허용 가능)']].map(([c,b,br,a,ar])=>`<article><h3>${c}</h3><div class="is-before"><b>[BEFORE] ${b}</b><span>${br}</span></div><div class="is-after"><b>[AFTER] ${a}</b><span>${ar}</span></div></article>`).join('')}</div></section>
          <section class="sop-ready-practice ready-practice" data-ready-section="practice" data-ready-answer="B"><b>PRACTICE</b><h2>학습 확인</h2><p>이해도를 면밀하게 검검하고 돌발 상황에서 표준 절차에 입각한 가장 명확한 판단 기준을 테스트하십시오.</p><article><h3>Q. 자동화설비 시운전을 준비하던 중, 현장 상황에서 기존 SOP에 명기되어 있던 작업조건과 실제 설비 정렬 상태 및 가압 수치가 서로 다른 것을 인지했습니다. 이때 가장 적절한 대책과 현장 조치는 무엇입니까?</h3><div class="ready-practice-options">${[['A','해당 장비 점검을 무수히 담당했던 숙련자이므로 자신의 주관적 감각과 노하우에 입각하여 기존 절차대로 작업을 속행한다.'],['B','즉시 작업을 대기하고 변경된 작업조건 및 신규 위험요인을 정밀 식별한 후, 적용 가능한 새로운 SOP 절차서를 재조회 및 공식 승인을 득하고 작업에 임한다.'],['C','가동 복구 일정 지연 및 압박을 최소화하기 위하여 설비 운전 속도를 임의로 50% 줄여 주의를 다하며 구동을 병행한다.'],['D','교대 투입 대기 중인 동료 주임 작업자에게 달라진 점을 구두로 전파하고 추가 전원 차단 장비 없이 기구를 즉시 구동한다.']].map(([v,l])=>`<button type="button" data-ready-choice="${v}"><span>${v}</span>${l}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>작업조건이 달라지면 즉시 멈추고 신규 위험요인을 식별한 뒤 최신 SOP와 승인을 다시 확인해야 합니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></article></section>
          <section class="sop-ready-complete" data-ready-section="complete"><div><b>학습 완료</b><h2>학습 03 · 변경과 비정상 상황 학습 완료</h2>${['작업조건 변경 시 발생할 수 있는 신규 위해 요소 유입 방어 장벽과 SOP 실시간 유효성 교차 대조 원리를 파악했습니다.','돌발 상황 유입 시 중지(STOP), 식별(CHECK), 보고승인(RECONFIRM) 시퀀스를 수립했습니다.','경험에만 귀속된 교만이 초래하는 휴먼 에러 위험성과 SOP 원문 확인의 중요성을 익혔습니다.','시운전 전장 및 비계획 고장 수리 시 LOTO 준용 전후의 실질 위험성 등급 감소 효율을 확인했습니다.'].map(item=>`<p><span>✓</span>${item}</p>`).join('')}</div></section><nav class="sop-ready-nav" aria-label="학습 이동"><a href="#sop-reading">← 이전 학습</a><a href="#sop-course">학습 목록</a><a href="#sop-platform" data-complete-on-navigation="sop-structure">다음 학습 →</a></nav>
        </main>
      </article>`);

    const sop04 = document.getElementById('sop-platform');
    if (sop04 && !sop04.querySelector(':scope > .sop-ready-desktop-learning')) sop04.insertAdjacentHTML('beforeend', `
      <article class="figma-ready-desktop-learning sop-ready-desktop-learning sop-ready-l04" data-figma-source="191:117" data-ready-inventory="onoff|platform-visual|practice|course-complete|bottom-navigation" aria-labelledby="sop-ready-l04-title">
        ${renderSopReadySidebar(3)}
        <main class="sop-ready-workspace">
          <header class="sop-ready-hero"><div><p><strong>04</strong><span><b>PART 01 · 표준작업의 시작</b><small>학습 04 / 04</small></span></p><h1 id="sop-ready-l04-title">ONOFF Platform 연결</h1><h2>현장의 표준작업절차서(SOP)를 ONOFF 안전 플랫폼과 유기적으로 연계하여 실시간 무결성을 달성하는 법</h2><p>SOP는 정적인 가이드북이 아닙니다. ONOFF Platform에 실시간으로 연결될 때 비로소 나와 현장을 실시간으로 통제하는 유동적인 방어막이 됩니다. 이 장에서는 작업 투입 직전 플랫폼 화면을 통해 SOP의 핵심 절차를 안전하게 검수 및 교차 확인하고, 변화된 조건에 맞추어 플랫폼 상에서 주도적으로 완성해 나갑니다.</p></div><aside><b>이 장에서 중점적으로 다룰 내용</b>${['ONOFF Safety Platform 내부 SOP 확인 뷰(View)의 정합성 식별','작업 전 핵심 절차 체크리스트의 단계적 점검 및 추적 관리','설비 또는 작업조건 변경 시 최신 SOP와 플랫폼 상의 동적 재승인 프로세스'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="sop-ready-section is-white sop-ready-onoff" data-ready-section="onoff"><header><b>ONOFF</b><h2>Platform에서 SOP를 어떻게 확인하는가</h2><p>작업 시작 신호 전, 현장에 배치된 디지털 키오스크 및 모바일 ONOFF Safety Platform에 로그인하여 실시간 SOP 세부 영역을 면밀히 교차 조회하고 안전 준수를 약속해야 합니다.</p></header><div class="sop-ready-onoff-grid"><figure data-ready-section="platform-visual"><img src="assets/sop/figma-ready/sop-l04-platform-visual.png" alt="ONOFF Platform SOP 확인 화면 및 디지털 승인 플로우" data-viewer-title="ONOFF Platform Screenshot"><figcaption>ONOFF Platform Screenshot</figcaption></figure><article><h3>ONOFF Safety Platform 활용의 핵심 구조</h3><p>플랫폼에 내장된 SOP 통합 모듈은 작업자가 기구 조작이나 가압을 개시하기 전에 반드시 관통해야 하는 3단계의 정밀 논리적 통제 체계를 구축합니다.</p>${[['01','작업 전 SOP 확인 화면','배정받은 제어 설비의 일련번호를 기반으로, 플랫폼 데이터베이스에 보관된 가장 최신의 승인된 SOP 지침을 실시간 호출하여 조회합니다.'],['02','SOP 핵심 절차 체크리스트','각 작업 스텝별 유해 인자, 필수 소요 보호구(PPE) 보유 상태, LOTO 차단 유무 등을 모바일 화면상에서 터치하여 정량적으로 검증하고 기록합니다.'],['03','작업조건 변경 시 재확인 프로세스','설비 구성이나 작업 범위에 미세 변수가 식별되었을 때 즉시 작업을 멈추고 플랫폼에 ‘SOP 변경’을 신고하여 최신 동적 가이드를 재적용받습니다.']].map(([n,t,d])=>`<div><span>${n}</span><p><b>${t}</b><small>${d}</small></p></div>`).join('')}<aside><b>유의사항: SOP 확인은 ‘행동의 성실 점검 지침’입니다</b><p>플랫폼상에서의 조회/체크 행위 자체가 법적 안전을 자동으로 대체 보증해 주거나 주관적 면죄부를 제공하는 것은 아닙니다. 작업자 스스로 실제 현장에서 SOP 규격을 엄밀하게 이행하는 자세가 본질입니다.</p></aside></article></div></section>
          <section class="sop-ready-practice ready-practice" data-ready-section="practice" data-ready-answer="A"><b>PRACTICE</b><h2>실전 평가</h2><p>학습한 내용을 바탕으로 ONOFF Platform 연계 상황에서의 올바른 안전 시퀀스를 진단해 보십시오.</p><article><h3>Q. DS제어팀에서 자동화설비 시운전을 앞두고 ONOFF Platform에서 해당 작업의 SOP를 확인하려 합니다. 가장 올바른 절차는 무엇입니까?</h3><div class="ready-practice-options">${[['A','SOP 목록에서 해당 작업을 찾아 핵심 절차와 안전기준을 확인한 후 작업을 준비한다'],['B','이전에 같은 작업을 했으므로 SOP 확인 없이 바로 작업을 시작한다'],['C','동료에게 구두로 절차를 확인하고 Platform 확인은 생략한다'],['D','SOP를 확인했지만 작업조건이 변경되어도 기존 절차 그대로 진행한다']].map(([v,l])=>`<button type="button" data-ready-choice="${v}"><span>${v}</span>${l}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>ONOFF Platform에서 SOP를 확인하는 것은 작업 전 핵심 절차와 안전기준을 체계적으로 점검하기 위한 과정입니다. 특히 조건 변경 시에는 승인된 절차서를 다시 대조해야 합니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></article></section>
          <section class="sop-ready-complete sop-ready-course-complete" data-ready-section="course-complete"><div><b>과정 완료</b><h2>SOP 과정 전체 학습 완료</h2><p class="sop-ready-complete-lead">표준작업의 이해부터 실전 플랫폼 연동까지, 안전한 현장을 지키는 핵심 이수 단계를 모두 통과하셨습니다.</p>${['학습 01: SOP의 이해 — 단순 나열을 넘은 나와 동료를 지키는 가장 신뢰할 수 있는 생명선 식별','학습 02: 작업 준비와 실행 — 사전 예방 통제를 실천하기 위한 4대 필수 체크 기준 수립','학습 03: 변경과 비정상 상황 — 조건 변경 감지 시 즉각 STOP 및 SOP 원문 대조 습관화','학습 04: ONOFF Platform 연결 — 현장의 표준작업절차서(SOP)와 안전 관리 시스템의 결합성 활용'].map(item=>`<p><span>✓</span>${item}</p>`).join('')}<aside><strong>SOP는 단순한 문서가 아니라, 현장의 안전을 지키는 유일한 실행 기준입니다.</strong><a href="#sop-course" data-complete-on-navigation="sop-platform">교육 과정 목록으로 돌아가기</a></aside></div></section><nav class="sop-ready-nav" aria-label="학습 이동"><a href="#sop-structure">← 이전 학습</a><span></span><a href="#sop-course" data-complete-on-navigation="sop-platform">전체 코스 평가 및 수료증 발급 →</a></nav>
        </main>
      </article>`);
    const sop04ViewerImage = sop04?.querySelector('[data-viewer-title]');
    if (sop04ViewerImage) {
      sop04ViewerImage.tabIndex = 0;
      sop04ViewerImage.setAttribute('role', 'button');
      sop04ViewerImage.setAttribute('aria-label', `${sop04ViewerImage.alt} 확대 보기`);
    }
  };
  mountExactSopDesktopLearning();
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.sop-ready-desktop-learning .ready-practice button');
    const practice = target?.closest('.ready-practice');
    if (!target || !practice) return;
    const choices = practice.querySelectorAll('[data-ready-choice]');
    const check = practice.querySelector('[data-ready-check]');
    const result = practice.querySelector('aside');
    if (target.matches('[data-ready-choice]')) {
      choices.forEach((choice) => choice.classList.toggle('is-selected', choice === target));
      if (check) check.disabled = false;
      return;
    }
    if (target.matches('[data-ready-check]')) {
      const selected = practice.querySelector('[data-ready-choice].is-selected');
      if (!selected || !result) return;
      const correct = selected.dataset.readyChoice === practice.dataset.readyAnswer;
      choices.forEach((choice) => {
        choice.disabled = true;
        choice.classList.remove('is-selected');
        choice.classList.toggle('is-correct', choice.dataset.readyChoice === practice.dataset.readyAnswer);
        choice.classList.toggle('is-incorrect', choice === selected && !correct);
      });
      check.disabled = true;
      result.hidden = false;
      result.querySelector('strong').textContent = correct ? 'Correct' : 'Incorrect · Hint를 확인하고 다시 시도하세요.';
      return;
    }
    if (target.matches('[data-ready-retry]')) {
      choices.forEach((choice) => { choice.disabled = false; choice.classList.remove('is-selected','is-correct','is-incorrect'); });
      if (check) check.disabled = true;
      if (result) result.hidden = true;
    }
  });

  const readySectionInventory = {
    '48:5': ['lesson-01','product-screen-01','why','product-screen-02','lesson-02','lesson-03','lesson-04','practice','complete'],
    '78:4': ['lesson-01','workflow-visual','lesson-02','product-screen-01','lesson-03','lesson-04','product-screen-02','lesson-05','product-screen-03','lesson-06','checklist','product-screen-04','practice','complete'],
    '103:2': ['lesson-01','product-screen-01','lesson-02','daily-work-flow','safety-report-branch','lesson-03','product-screen-02','lesson-04','product-screen-03','daily-safety-loop','practice','complete'],
    '174:4': ['why','what','definition','flow','find','example','method','chain-diagram','perspective','seven-step-flow','summary','practice','complete'],
    '174:332': ['visual-example','risk-matrix','decision-flow','step-matrix','rating-cards','scenarios','hierarchy-diagram','practice','complete'],
    '174:658': ['execution','key-concept','participation','documentation','change-management','trigger-cards','flow-diagram','continuous-cycle','step-summary','practice','complete'],
    '174:999': ['daily-safety','key-concept','flow-visualizer','path-a','path-b','summary','comparison-table','practice','course-complete'],
    '208:514': ['step-01','step-02','practice'],
    '208:688': ['step-04','form-01','step-03','step-05','form-05','step-06','practice'],
    '208:940': ['step-07','step-08','form','step-09','form-05','practice'],
    '208:1120': ['flow','form-cta','step-10','form-07','guide-points','sprint-summary','practice','course-complete'],
    '190:117': ['why','read','concept','field-context','complete'],
    '190:414': ['prepare','follow','warning','watch','hazard-cards','practice','complete'],
    '190:650': ['change','flow-visual','abnormal','mindset','result','practice','complete'],
    '191:117': ['onoff','platform-visual','practice','complete'],
    '243:575': ['why','tbm-flow','start','next'],
    '243:576': ['action-01','action-02','action-03','action-04','summary'],
    '243:577': ['action-05','action-06','share-summary','next'],
    '243:578': ['action-07','action-08','action-09','practice','complete','connection','next'],
    '236:437': ['why','learning-path','connection','course-map'],
    '236:438': ['why','situation','hazard','check','field-point','practice'],
    '236:439': ['why','situation','hazard','check','field-point','practice'],
    '236:440': ['risk','check','practice'],
    '236:441': ['scenario','hazard','check','practice'],
    '236:442': ['summary-robot','summary-electrical','summary-chemical','summary-material','connection']
  };

  const mountRemainingReadyDesktopLearning = () => {
    if (!desktopHomeMedia.matches) return;
    Object.entries(desktopLearningCatalog).forEach(([courseId,course]) => course.sequence.forEach(([chapterId,learningNumber,title,figmaNode],index) => {
      if (courseId === 'platform' || courseId === 'risk' || (courseId === 'special' && ['special-education-intro','special-robot-work','special-live-work-75v','special-hazardous-chemicals','special-cargo-handling','special-daily-work'].includes(chapterId)) || (courseId === 'tbm' && ['tbm-purpose','tbm-nine-steps','tbm-scenario','tbm-life-rules'].includes(chapterId)) || (courseId === 'sop' && ['sop-purpose','sop-reading','sop-structure','sop-platform'].includes(chapterId)) || (courseId === 'practical' && ['risk-practical-01','risk-practical-02','risk-practical-03','risk-practical-04'].includes(chapterId))) return;
      const chapter = document.getElementById(chapterId);
      const legacyStart = chapter?.querySelector(':scope > .book-chapter-start');
      if (!chapter || !legacyStart || chapter.querySelector(':scope > .figma-ready-desktop-learning')) return;
      const excludedClasses = ['platform-mobile-header','platform-mobile-route-hero','book-chapter-start','desktop-learning-hero','chapter-complete-label','chapter-reading-nav','platform-figma-mobile-chapter'];
      const contentNodes = [...chapter.children].filter((element) => !excludedClasses.some((className) => element.classList.contains(className)) && ![...element.classList].some((className) => className.startsWith('mobile-')));
      const inventory = readySectionInventory[figmaNode] || [];
      const ready = document.createElement('article');
      ready.className = 'figma-ready-desktop-learning ready-migrated-learning';
      ready.dataset.figmaSource = figmaNode;
      ready.dataset.readyCourse = courseId;
      ready.dataset.readyInventory = inventory.join('|');
      const intro = legacyStart.querySelector('span')?.textContent.trim() || '이 학습의 핵심 내용과 현장 적용 방법을 확인합니다.';
      const progress = learningNumber === 'INTRO' ? 0 : learningNumber === 'COMPLETE' ? 100 : Math.round(((index + 1) / course.sequence.length) * 100);
      ready.innerHTML = `<header class="ready-learning-header ready-course-hero"><nav aria-label="현재 위치"><span>Academy</span><i>›</i><span>${course.label}</span><i>›</i><strong>${learningNumber === 'INTRO' || learningNumber === 'COMPLETE' ? learningNumber : `Chapter ${learningNumber}`}</strong></nav><p>COURSE ${course.number} · ${course.label}</p><h1>${title}</h1><div class="ready-learning-subtitle">${intro}</div><div class="ready-learning-progress"><span aria-hidden="true">▣</span><strong>진도율 상태</strong><em>${learningNumber === 'INTRO' ? 'Course Intro' : learningNumber === 'COMPLETE' ? 'Course Complete' : `Learning ${learningNumber} · 진행`}</em><b>${progress}% 완료</b><i><span style="width:${progress}%"></span></i></div></header><div class="ready-migrated-content"></div>`;
      const content = ready.querySelector('.ready-migrated-content');
      contentNodes.forEach((element,nodeIndex) => {
        element.hidden = false;
        element.classList.remove('academy-lesson');
        element.classList.add('ready-bound-section');
        element.dataset.readySection = inventory[nodeIndex] || `content-${nodeIndex + 1}`;
        content.append(element);
      });
      const previous = course.sequence[index - 1];
      const next = course.sequence[index + 1];
      const tocTarget = entryCourseCatalog.find((entry) => entry.id === courseId)?.route || 'home';
      ready.insertAdjacentHTML('beforeend', `<section class="ready-learning-complete ready-migrated-complete"><div class="ready-editorial"><b>${learningNumber === 'COMPLETE' ? 'COURSE COMPLETE' : 'LEARNING COMPLETE'}</b><h2>${title}</h2><button type="button" data-learning-complete="${chapterId}">학습 완료</button></div>${next ? `<a class="ready-next-learning" href="#${next[0]}"><span><small>다음 학습</small><strong>${next[2]}</strong></span><b>바로가기 →</b></a>` : ''}<nav class="ready-bottom-navigation" aria-label="학습 이동">${previous ? `<a href="#${previous[0]}">‹ 이전 학습</a>` : '<span aria-disabled="true">‹ 이전 학습</span>'}<a href="#${tocTarget}">▤ 학습 목록</a>${next ? `<a href="#${next[0]}">다음 학습 ›</a>` : '<a href="#home">Academy로 ›</a>'}</nav></section>`);
      chapter.classList.add('has-ready-desktop-learning');
      chapter.append(ready);
    }));
  };
  mountRemainingReadyDesktopLearning();

  const mountExactPlatformDesktopLearning = () => {
    if (!desktopHomeMedia.matches) return;

    const workflow = document.getElementById('workflow');
    if (workflow && !workflow.querySelector(':scope > .platform-ready-desktop-learning')) {
      workflow.insertAdjacentHTML('beforeend', `
        <article class="figma-ready-desktop-learning platform-ready-desktop-learning platform-ready-02" data-figma-source="48:5" data-ready-inventory="learning-flow|prepare|why|key-point|action|product-management|product-registration|practice|complete" aria-labelledby="platform-ready-02-title">
          <aside class="platform-ready-02-sidebar" aria-label="Platform 학습 목록"><section><b>HOME</b><a href="#home">Academy Home</a></section><section><b>PLATFORM</b><nav><a href="#philosophy">Platform 이해</a><a class="is-active" href="#workflow" aria-current="page">Safety Start</a><a href="#daily-work">Daily Safety</a><a href="#safety-report">작업 중 · 종료</a></nav></section><section><b>LIBRARY</b><nav><a href="#tbm-course">TBM</a><a href="#sop-course">SOP</a><a href="#risk-course">위험성평가</a><a href="#special-course">특별안전교육</a><span>설비안전</span><span>비상대응</span><span>사고사례</span></nav></section></aside>
          <main class="platform-ready-02-workspace">
            <header class="ready-learning-header"><nav aria-label="현재 위치"><span>Academy</span><i>›</i><span>Platform</span><i>›</i><strong>학습 02</strong></nav><p>PART 02 · 작업 전 안전과정</p><h1 id="platform-ready-02-title">Safety Start</h1><div class="ready-learning-subtitle">작업에 필요한 안전정보가 어떻게 준비되고 연결되는지 이해합니다.</div><div class="ready-learning-progress" data-platform-l02-progress><span aria-hidden="true">▣</span><strong>학습 진행</strong><em>학습 02 / 04</em><b data-platform-l02-percent>0% 완료</b><i><span data-platform-l02-bar></span></i></div></header>
            <section class="platform-ready-02-flow" data-ready-section="learning-flow"><header><b>LEARNING FLOW · 학습 흐름</b><small>TIP</small></header><ol><li>✓ <strong>학습 02 · Safety Start</strong></li><li>✓ <strong>Safety Start의 목적과 역할 이해</strong></li><li>✓ <strong>Project/Work 기본정보 준비 과정 이해</strong></li><li>→ <strong>준비된 정보가 Daily Safety의 기준이 됨</strong></li></ol></section>
            <section class="platform-ready-02-editorial platform-ready-02-prepare" data-ready-section="prepare"><header><b>PREPARE</b><h2>Safety Start는 어떤 준비를 하는가?</h2></header><p>작업자는 매일 안전정보를 처음부터 새로 만드는 것이 아닙니다. Project와 Work의 준비 단계에서 누가, 어디에서, 언제, 어떤 작업을 수행하는지 기본정보를 먼저 정의하고, 해당 작업에 필요한 안전정보를 사전에 준비하고 연결합니다. 이렇게 준비된 정보가 Daily Safety의 기준으로 사용됩니다.</p><ol class="platform-ready-02-steps"><li>Project / Work</li><li>기본 작업정보 준비</li><li><strong>안전정보 준비 및 연결</strong><small>위험성평가 · SOP · TBM 등</small></li><li>DAILY SAFETY READY</li></ol><aside class="platform-ready-02-relation"><small>준비된 안전정보 → Daily Safety에서 사용</small><div><span><b>위험성평가</b>위험과 대책</span><span><b>SOP</b>작업 절차</span><span><b>TBM</b>현장 안전 공유</span></div><em>→ 각 항목별 상세 자료 확인 가능</em></aside><blockquote>Safety Start의 핵심: Daily Safety에서 사용할 기준을 미리 준비합니다.</blockquote></section>
            <section class="platform-ready-02-editorial" data-ready-section="why"><header><b>WHY</b><h2>왜 안전정보를 미리 준비하는가?</h2></header><p>안전자료가 없어서 사고가 발생하는 것이 아닙니다. 위험성평가도 있고, SOP도 있고, TBM도 합니다. 문제는 이 정보가 실제 작업과 연결되어 있는지, 오늘 작업에 필요한 기준으로 준비되어 있는지입니다. Safety Start는 이 정보를 사전에 정의하고 연결하여, Daily Safety에서 바로 확인할 수 있도록 준비합니다.</p><blockquote>준비된 정보가 있어야 Daily Safety에서 확인할 수 있습니다.</blockquote></section>
            <section class="platform-ready-02-editorial platform-ready-02-keypoint" data-ready-section="key-point"><b class="ready-section-tag">KEY POINT</b><h2>Safety Start에서 준비하는 것</h2><p>Safety Start는 Project와 Work 수행에 필요한 기본정보와 안전정보를 사전에 준비합니다.</p><div><article><small>PROJECT INFO</small><h3>Project / Work 기본정보</h3><p>누가, 어디에서, 언제, 어떤 작업을 수행하는지 기본정보를 정의합니다. 프로젝트명, 고객사, 현장, 관리자, 시작일/종료일, 기본 작업내용을 등록합니다.</p></article><article><small>SAFETY INFO</small><h3>안전정보 준비 및 연결</h3><p>해당 작업에 필요한 안전정보를 사전에 준비하고 연결합니다. 위험성평가, SOP, TBM 등 필요한 안전자료가 작업에 맞게 연결되어, Daily Safety에서 바로 확인할 수 있도록 합니다.</p></article></div><p>이렇게 준비된 정보는 이후 Daily Safety의 기준으로 사용됩니다. Project에 속하지 않는 작업도 기타 작업으로 선택하여 동일한 Safety Start 흐름을 진행할 수 있습니다.</p></section>
            <section class="platform-ready-02-action" data-ready-section="action"><b>ACTION</b><h2>Project 확인과 안전정보 준비</h2><p>Safety Start의 준비는 Project 정보를 정의하는 것에서 시작합니다. 누가, 어디에서, 언제, 어떤 작업을 수행하는지 기본정보를 등록하고, 해당 작업에 필요한 안전정보를 연결합니다.</p></section>
            <section class="platform-ready-02-product ready-platform-screen" data-ready-section="product-management"><b>PRODUCT SCREEN · Project Management</b><figure><img src="assets/platform/figma-ready/ch02/project-management.png" alt="Project Management 프로젝트 목록과 안전준비 상태 화면"></figure><p>Safety Start의 준비는 Project 정보를 정의하는 것에서 시작합니다. 등록된 Project 목록에서 프로젝트명, 고객사, 현장, 관리자, 안전준비 상태를 확인할 수 있습니다.</p></section>
            <section class="platform-ready-02-product ready-platform-screen" data-ready-section="product-registration"><b>PRODUCT SCREEN · 프로젝트 등록</b><figure><img src="assets/platform/figma-ready/ch02/project-registration.png" alt="프로젝트 기본정보와 참여 Worker 등록 화면"></figure><p>누가(End User, 관리자), 어디에서(고객사, 현장), 언제(시작일/종료일), 어떤 작업(기본 작업내용)을 수행하는지 Safety Start의 기본정보를 등록합니다. 참여 Worker를 선택하여 작업 대상을 지정합니다.</p></section>
            <section class="platform-ready-02-practice ready-practice" data-ready-section="practice" data-ready-answer="02"><b>PRACTICE · 학습 확인</b><h2>Safety Start에서 준비하는 정보의 주된 목적은 무엇입니까?</h2><div class="ready-practice-options">${[['01','관리자의 작업 현황 보고를 위해'],['02','Daily Safety에서 사용할 안전확인 기준을 준비하기 위해'],['03','작업자 출퇴근 관리를 위해'],['04','안전교육 이수 현황을 기록하기 위해']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>Safety Start는 Project/Work의 기본정보와 안전정보를 사전에 준비하여 Daily Safety에서 바로 확인할 수 있도록 하는 과정입니다. 관리 보고나 출퇴근이 아니라, 작업 안전의 기준을 준비하는 것이 핵심입니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></section>
            <section class="platform-ready-02-complete" data-ready-section="complete"><div><b>COMPLETE</b><h2>Safety Start</h2><ol>${['Safety Start는 Daily Safety에서 사용할 작업·안전정보를 사전에 준비하는 과정입니다.','Project/Work 기본정보를 정의하고, 필요한 안전정보를 준비하여 연결합니다.','이제 준비된 정보를 오늘 작업에서 어떻게 사용하는지 확인합니다.'].map((item)=>`<li><strong aria-hidden="true">✓</strong><span>${item}</span></li>`).join('')}</ol></div><nav class="ready-bottom-navigation" aria-label="학습 이동"><a href="#philosophy">← 이전 학습</a><a href="#platform-course">학습 목록</a><a href="#daily-work" data-complete-on-navigation="workflow">다음 학습 →</a></nav></section>
          </main>
        </article>`);
    }

    const readyPlatformProduct = (section,image,alt,annotations,caption) => `<section class="platform-ready-03-product ready-platform-screen" data-ready-section="${section}"><b>PRODUCT SCREEN · 실제 Platform 화면</b><div><figure><img src="${image}" alt="${alt}"></figure><ol>${annotations.map((item,index)=>`<li><span>0${index+1}</span><strong>${item}</strong></li>`).join('')}</ol></div><p>${caption}</p></section>`;
    const dailyWork = document.getElementById('daily-work');
    if (dailyWork && !dailyWork.querySelector(':scope > .platform-ready-desktop-learning')) {
      dailyWork.insertAdjacentHTML('beforeend', `
        <article class="figma-ready-desktop-learning platform-ready-desktop-learning platform-ready-03" data-figma-source="78:4" data-ready-inventory="understand|understand-flow|key-point|step-01|work-selection|work-selection-compare|step-02|related-materials|step-03|education-rights|step-04|step-05|safety-check|step-06|signature|final-action|work-on|practice|complete" aria-labelledby="platform-ready-03-title">
          <aside class="platform-ready-03-sidebar" aria-label="Platform 학습 목록"><section><b>HOME</b><a href="#home">Academy Home</a></section><section><b>PLATFORM</b><a href="#platform-course">Platform Course</a><nav><a href="#philosophy">Platform 이해</a><a href="#workflow">Safety Start</a><a class="is-active" href="#daily-work" aria-current="page">Daily Safety</a><a href="#safety-report">작업 중 · 종료</a></nav></section><section><b>LIBRARY</b><nav><a href="#tbm-course">TBM</a><a href="#sop-course">SOP</a><span>위험성평가</span><span>특별안전교육</span><span>설비안전</span><span>비상대응</span><span>사고사례</span></nav></section></aside>
          <main class="platform-ready-03-workspace">
            <header class="platform-ready-03-header"><nav aria-label="현재 위치"><span>Academy</span><i>›</i><span>Platform</span><i>›</i><strong>학습 03</strong></nav><div><p>PART 02 · 작업 전 안전과정</p><h1 id="platform-ready-03-title">오늘 작업과 Daily Safety</h1><h2>오늘의 안전확인과 작업 시작</h2><p>준비된 안전정보를 바탕으로 오늘 작업의 안전확인을 실행하고, 실제 작업을 시작하는 과정을 학습합니다.</p></div><div class="platform-ready-03-progress"><span aria-hidden="true">▣</span><strong>예상 진도량</strong><em>학습 시간 약 15 · 20분</em><b data-platform-l03-percent>학습 03 / 04</b><i><span data-platform-l03-bar></span></i></div></header>
            <section class="platform-ready-03-editorial platform-ready-03-understand" data-ready-section="understand"><b>UNDERSTAND</b><h2>왜 바로 작업을 시작하지 않을까요?</h2><p>오늘 수행할 작업을 선택했다고 바로 실제 작업이 시작되는 것은 아닙니다. ONOFF는 작업자가 실제 작업을 시작하기 전에 필요한 최소 안전확인을 거치도록 합니다. 교육 및 회의 참가 내용을 확인하고, 작업자의 권리와 의무를 인지하고, 핵심 안전사항을 직접 확인한 뒤 전자서명으로 기록을 남깁니다. 이 과정이 Daily Safety입니다.</p><blockquote>Daily Safety는 시스템 버튼이 아니라, 작업 시작 전 안전확인의 전체 흐름입니다.</blockquote></section>
            <section class="platform-ready-03-flow" data-ready-section="understand-flow"><div><b>DAILY SAFETY FLOW</b><h2>작업 시작 전 안전확인 흐름</h2>${['오늘 작업 선택','교육 및 회의 참가 확인','권리와 의무 확인','작업 전 안전확인','전자서명','작업 시작'].map((item,index)=>`<p class="${index===3?'is-primary':index===5?'is-complete':''}">${item}</p>`).join('<i>▼</i>')}</div></section>
            <section class="platform-ready-03-editorial platform-ready-03-keypoint" data-ready-section="key-point"><b>KEY POINT</b><h2>Daily Safety는 시스템 버튼이 아니라 안전확인의 전체 과정입니다</h2><p>Daily Safety는 화면의 특정 버튼을 누르는 행위가 아닙니다.<br><br>오늘 작업 선택 → 연결된 안전정보 확인 → 교육 및 회의 참가 확인 → 권리와 의무 → 작업 전 안전확인 → 전자서명까지, 작업 시작 전에 거치는 안전확인의 전체 흐름이 Daily Safety입니다.<br><br>Safety Start에서 준비한 안전정보는 이 과정을 통해 작업자에게 전달됩니다.</p></section>
            <section class="platform-ready-03-action" data-ready-section="step-01"><b>STEP 01</b><h2>오늘 수행할 작업을 선택합니다</h2><p>Daily Safety의 첫 번째 과정은 오늘 수행할 작업을 선택하는 것입니다.<br><br>로그인 후 나에게 배정된 작업 목록에서 오늘 수행할 작업을 선택하면, 해당 작업에 연결된 안전정보가 Daily Safety 흐름에 자동으로 연결됩니다.<br><br>작업 선택은 단순한 메뉴 선택이 아닙니다. Safety Start에서 준비한 안전정보가 이 선택을 통해 작업자의 Daily Safety로 연결되는 시작점입니다.</p><blockquote>“작업 선택 = Safety Start에서 준비된 안전정보가 나의 Daily Safety로 연결되는 시작점”</blockquote></section>
            <section class="platform-ready-03-product platform-ready-03-product--intro ready-platform-screen" data-ready-section="work-selection"><b>PRODUCT SCREEN · 실제 Platform 화면</b><figure><img src="assets/platform/figma-ready/ch03/work-selection.png" alt="로그인 후 오늘 수행할 작업을 선택하는 실제 Platform 화면"></figure><p>로그인 후 오늘 수행할 작업을 먼저 선택하도록 안내합니다.</p></section>
            <section class="platform-ready-03-product platform-ready-03-product--compare ready-platform-screen" data-ready-section="work-selection-compare"><b>PRODUCT SCREEN · 선택 전과 선택 후</b><div><figure><img src="assets/platform/figma-ready/ch03/work-selection-before.png" alt="작업 선택 전 Platform 화면"><i>작업 선택</i><span aria-hidden="true"></span></figure><figure><img src="assets/platform/figma-ready/ch03/work-selection-after.png" alt="작업 선택 후 Platform 화면"></figure></div><ol>${['수행할 작업을 선택합니다.','선택한 작업을 확인합니다.','작업 선택이 완료되면 작업 시작 버튼이 활성화됩니다.'].map((item,index)=>`<li><b>STEP 0${index+1}</b><span>${item}</span></li>`).join('')}</ol></section>
            <section class="platform-ready-03-action" data-ready-section="step-02"><b>STEP 02</b><h2>연결된 안전정보를 확인합니다</h2><p>작업을 선택하면 Safety Start에서 해당 작업에 연결해둔 안전정보를 확인할 수 있습니다.<br><br>위험성평가, SOP, TBM 등 작업과 관련된 안전자료가 있다면 작업자는 필요할 때 원문 또는 상세 내용을 추가로 확인할 수 있습니다.<br><br>이 자료들은 작업자가 새로 만드는 것이 아니라, Safety Start 단계에서 관리자가 미리 준비하여 작업에 연결해둔 것입니다.</p><blockquote>“관련 안전자료 = Safety Start에서 준비하여 작업에 연결해둔 상세 안전정보”</blockquote></section>
            <section class="platform-ready-03-materials" data-ready-section="related-materials"><b>RELATED SAFETY MATERIALS · 관련 안전자료</b><p>작업과 연결된 안전자료가 있다면 작업자는 필요할 때 관련 원문 또는 상세 내용을 추가로 확인할 수 있습니다.</p><div><span>위험성평가</span><span>SOP</span><span>TBM</span></div><blockquote>작업 전 안전확인 = 모든 작업자가 작업 전에 거치는 최소 핵심 안전확인<br>관련 안전자료 = 작업과 연결되어 있을 경우 필요한 상세 내용을 추가 확인하기 위한 자료</blockquote></section>
            <section class="platform-ready-03-editorial" data-ready-section="step-03"><b>STEP 03</b><h2>작업 전에 필요한 교육과 안전활동 내용을 확인합니다</h2><p>Daily Safety에서 보여주는 교육 및 회의 참가 확인은 이 화면에서 새로운 교육을 시작하거나 각 항목을 사용자가 하나씩 체크하는 과정이 아닙니다.<br><br>작업 시작 전에 필요한 교육 및 회의 참가 내용을 확인하는 단계입니다.</p><blockquote>“작업 전에 필요한 교육과 안전활동을 놓치지 않았는지 확인합니다.”</blockquote></section>
            ${readyPlatformProduct('education-rights','assets/platform/figma-ready/ch03/education-rights.png','교육 및 회의 참가 내용과 작업자의 권리와 의무를 확인하는 실제 Platform 화면',['교육 및 회의 참가 내용 확인','작업자의 권리와 의무 확인','내용 확인 후 작업 전 안전확인으로 이동'],'교육 및 회의 참가 내용과 작업자의 권리와 의무를 확인합니다.')}
            <section class="platform-ready-03-editorial platform-ready-03-rights" data-ready-section="step-04"><b>STEP 04</b><h2>안전하지 않은 작업을 그대로 시작하지 않습니다</h2><p>안전확인은 작업자의 의무만을 의미하지 않습니다.<br><br>작업자는 안전하게 작업해야 할 의무가 있으며, 동시에 안전이 확보되지 않은 작업을 그대로 수행하지 않을 권리도 있습니다.<br><br>ONOFF는 실제 작업을 시작하기 전에 이 원칙을 다시 확인하도록 합니다.<br><br>현재 Platform에서 사용자는:<br><br>“작업자는 안전이 확보되지 않은 작업을 거부할 권리와 의무가 있습니다.”<br><br>라는 내용을 확인한 뒤<br><br>“위 내용을 확인했습니다.”<br><br>를 체크합니다.</p><blockquote>“안전을 확인하는 것은 작업자의 의무이면서 권리입니다.”</blockquote></section>
            <section class="platform-ready-03-editorial platform-ready-03-safety-copy" data-ready-section="step-05"><b>STEP 05</b><h2>작업 직전, 핵심 안전사항을 다시 확인합니다</h2><p>작업자가 실제 작업을 시작하기 직전에 놓치지 않아야 할 핵심 안전사항을 직접 확인하는 과정입니다.<br><br>현재 Platform의 작업 전 안전확인 항목:<br><br>· 보호구<br>· 오늘의 주의사항<br>· 작업 준비<br>· 작업 수행상태<br>· 주요 위험요인<br><br>작업자는 각 항목을 예/아니오로 직접 확인합니다.</p></section>
            ${readyPlatformProduct('safety-check','assets/platform/figma-ready/ch03/safety-check.png','작업 직전 핵심 안전사항을 예 아니오로 확인하는 실제 Platform 화면',['보호구 · 주의사항 · 작업 준비 · 작업 수행상태 확인','각 항목을 예/아니오로 직접 확인','확인 완료 후 전자서명 단계로 이동'],'작업 직전 핵심 안전사항을 예/아니오로 직접 확인합니다.')}
            <section class="platform-ready-03-editorial platform-ready-03-signature-copy" data-ready-section="step-06"><b>STEP 06</b><h2>확인한 내용을 내 확인으로 남깁니다</h2><p>작업 전 안전확인을 마쳤다면 전자서명으로 확인 내용을 남깁니다.<br><br>전자서명은 단순히 다음 화면으로 이동하기 위한 버튼이 아닙니다.<br><br>작업자가 실제 작업 시작 전에 필요한 안전사항을 직접 확인했다는 흐름을 기록으로 연결하는 단계입니다.</p><blockquote>“확인한 안전을 기록으로 남깁니다.”</blockquote></section>
            ${readyPlatformProduct('signature','assets/platform/figma-ready/ch03/signature.png','안전확인 내용을 전자서명으로 기록하는 실제 Platform 화면',['선택된 작업 정보 확인','손가락 또는 마우스로 서명','“실제 작업 시작” 버튼으로 Daily Safety 완료'],'안전확인 내용을 전자서명으로 기록합니다.')}
            <section class="platform-ready-03-editorial platform-ready-03-final" data-ready-section="final-action"><b>FINAL ACTION</b><h2>이제 실제 작업을 시작합니다</h2><p>Daily Safety의 모든 확인 과정을 완료하면 실제 작업 상태로 전환됩니다.<br><br>오늘 작업 선택부터 전자서명까지, 6단계의 안전확인을 거쳐 작업 시작이 활성화됩니다. 이 과정은 Safety Start에서 준비한 안전정보가 작업자에게 전달되고, 작업자가 직접 확인했음을 기록하는 전체 흐름입니다.</p><div>${['오늘 작업 선택','안전정보 확인','교육/회의 · 권리/의무','안전확인 · 전자서명'].map(item=>`<span>✓ <strong>${item}</strong></span>`).join('')}<i>▼</i><b>DAILY SAFETY</b><i>▼</i><em>WORK ON · 작업 시작</em></div></section>
            ${readyPlatformProduct('work-on','assets/platform/figma-ready/ch03/work-on.png','Daily Safety 완료 후 실제 작업 상태 화면',['작업 진행 상태 및 시작 시간 표시','안전확인 완료 메시지','위험 신고 · 작업 중지 · 작업 종료 기능'],'Daily Safety 완료 후 실제 작업 상태 화면입니다.')}
            <section class="platform-ready-03-practice ready-practice" data-ready-section="practice" data-ready-answer="02"><b>PRACTICE · 학습 확인</b><h2>ONOFF에서 “작업 전 안전확인”을 진행하는 가장 중요한 이유는 무엇일까요?</h2><div class="ready-practice-options">${[['01','작업자의 지식을 시험하기 위해'],['02','오늘 작업에 필요한 핵심 안전사항을 작업 시작 전에 최소한 직접 확인하기 위해'],['03','관리자가 작업자를 평가하기 위해'],['04','출근 기록을 자동으로 남기기 위해']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>작업 전 안전확인은 작업자의 지식을 평가하는 과정이 아닙니다. 보호구, 오늘의 주의사항, 작업 준비, 작업 수행상태, 주요 위험요인 등 오늘 작업에서 놓치지 않아야 할 핵심 안전사항을 실제 작업 전에 최소한 직접 확인하는 과정입니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></section>
            <section class="platform-ready-03-complete" data-ready-section="complete"><div><b>COMPLETE</b><h2>학습 03 · 핵심 정리</h2><ol>${['Daily Safety는 버튼이 아니라 과정입니다. 작업 선택 → 안전정보 확인 → 교육/회의 → 권리/의무 → 안전확인 → 전자서명 → 작업 시작.','Safety Start에서 준비한 안전정보는 작업 선택을 통해 작업자의 Daily Safety로 연결됩니다.','보호구, 오늘의 주의사항, 작업 준비, 작업 수행상태, 주요 위험요인 등 핵심 안전사항을 “작업 전 안전확인”으로 직접 확인합니다.','전자서명은 단순한 다음 버튼이 아니라, 안전확인을 직접 마쳤다는 기록입니다.'].map(item=>`<li><strong>✓</strong><span>${item}</span></li>`).join('')}</ol></div><nav class="ready-bottom-navigation" aria-label="학습 이동"><a href="#workflow">← 이전 학습</a><a href="#platform-course">학습 목록</a><a href="#safety-report" data-complete-on-navigation="daily-work">다음 학습 →</a></nav></section>
          </main>
        </article>`);
    }

    const readyPlatformL04Product = (section,label,image,alt,annotations,caption) => `<section class="platform-ready-04-product ready-platform-screen" data-ready-section="${section}"><b>${label}</b><div><figure><img src="${image}" alt="${alt}"></figure><ol>${annotations.map((item,index)=>`<li><span>0${index+1}</span><strong>${item}</strong></li>`).join('')}</ol></div><p>${caption}</p></section>`;
    const safetyReport = document.getElementById('safety-report');
    if (safetyReport && !safetyReport.querySelector(':scope > .platform-ready-desktop-learning')) {
      safetyReport.insertAdjacentHTML('beforeend', `
        <article class="figma-ready-desktop-learning platform-ready-desktop-learning platform-ready-04" data-figma-source="103:2" data-ready-inventory="understand|key-point-01|daily-work-flow|key-point-02|key-point-03|key-point-04|report-purpose|work-progress|action-01|end-work-check|action-02|daily-complete|daily-safety-loop|practice|complete" aria-labelledby="platform-ready-04-title">
          <aside class="platform-ready-04-sidebar" aria-label="Platform 학습 목록"><section><b>HOME</b><a href="#home">Academy Home</a></section><section><b>PLATFORM</b><a href="#platform-course">Platform Course</a><nav><a href="#philosophy">Platform 이해</a><a href="#workflow">Safety Start</a><a href="#daily-work">Daily Safety</a><a class="is-active" href="#safety-report" aria-current="page">작업 중 · 종료</a></nav></section><section><b>LIBRARY</b><nav><a href="#tbm-course">TBM</a><a href="#sop-course">SOP</a><span>위험성평가</span><span>특별안전교육</span><span>설비안전</span><span>비상대응</span><span>사고사례</span></nav></section></aside>
          <main class="platform-ready-04-workspace">
            <header class="platform-ready-04-header"><nav aria-label="현재 위치"><span>Academy</span><i>›</i><span>Platform</span><i>›</i><strong>학습 04</strong></nav><div><p>PART 02 · 작업 수행</p><h1 id="platform-ready-04-title">작업 중과 작업 종료</h1><h2>Work &amp; Complete</h2><p>Daily Safety 이후 작업 중 안전활동부터 작업 종료 전 확인과 완료까지의 흐름을 학습합니다.</p></div><div class="platform-ready-04-progress"><span aria-hidden="true">▣</span><strong>예상 진도량</strong><em>학습 시간 약 15 · 20분</em><b data-platform-l04-percent>학습 04 / 04</b><i><span data-platform-l04-bar></span></i></div></header>
            <section class="platform-ready-04-editorial platform-ready-04-understand" data-ready-section="understand"><b>UNDERSTAND</b><h2>Daily Safety가 완료되면 실제 작업이 시작됩니다</h2><p>작업 전 안전확인과 전자서명을 마치면 작업은 “진행 중” 상태로 전환됩니다.<br><br>이 화면은 단순히 작업시간을 표시하는 화면이 아닙니다.<br><br>작업자가 현재 어떤 작업을 수행하고 있는지, 안전확인이 완료되었는지, 그리고 작업 중 필요한 안전 행동으로 어떻게 이동할 수 있는지를 보여줍니다.</p><blockquote>작업 시작은 안전활동의 끝이 아니라 안전하게 일하기 위한 시작입니다.</blockquote></section>
            <section class="platform-ready-04-editorial platform-ready-04-during" data-ready-section="key-point-01"><b>KEY POINT ①</b><h2>작업 중에도 안전은 계속됩니다</h2><p>작업을 시작했다고 안전확인이 끝나는 것은 아닙니다.<br><br>작업 중 상황은 언제든 달라질 수 있습니다.<br><br>ONOFF는 작업 중에도 필요한 안전 행동으로 바로 이어질 수 있도록 합니다.<br><br>현재 작업 진행 화면에서는:<br><br>· 위험 신고<br>· 작업 중지<br>· 작업 종료<br><br>등의 행동으로 이동할 수 있습니다.<br><br>또한 작업과 연결된 안전자료가 존재한다면 필요할 때 관련 내용을 다시 확인할 수 있습니다.</p></section>
            <section class="platform-ready-04-flow platform-ready-04-flow--work" data-ready-section="daily-work-flow"><div><b>DAILY WORK FLOW</b><h2>작업 시작 이후 흐름</h2>${['DAILY SAFETY','작업 진행 중','작업 종료','작업 종료 전 확인'].map(item=>`<p>${item}</p>`).join('<i>▼</i>')}<i>▼</i><div class="platform-ready-04-branch"><strong>Safety Report 필요 여부</strong><span>없음</span><span>있음</span><em>Safety Report</em><b>작업 종료 완료</b></div></div></section>
            <section class="platform-ready-04-editorial platform-ready-04-compact" data-ready-section="key-point-02"><b>KEY POINT ②</b><h2>작업 중지는 권리와 의무의 연장입니다</h2><p>작업 중지 기능은 학습 03에서 확인한 “권리와 의무”와 개념적으로 연결됩니다.<br><br>작업 전에는 안전하지 않은 작업을 시작하지 않을 권리와 의무를 확인하고, 작업 중에는 상황이 위험해졌을 때 작업 중지라는 행동으로 이어질 수 있습니다.</p></section>
            <section class="platform-ready-04-editorial platform-ready-04-meaning" data-ready-section="key-point-03"><b>KEY POINT ③</b><h2>작업 종료 전 확인의 의미</h2><p>작업 종료 전 확인은 작업자를 평가하기 위한 절차가 아닙니다. 또한 새로운 안전문서를 작성하게 만드는 단계도 아닙니다.<br><br>목적은 “작업을 끝내기 전에 문제가 남아 있지 않은지 마지막으로 확인한다.”는 것입니다.<br><br>작업 전 안전확인과 동일하게 짧고 현실적인 최소 안전선의 개념을 유지합니다.</p></section>
            <section class="platform-ready-04-editorial platform-ready-04-compact" data-ready-section="key-point-04"><b>KEY POINT ④</b><h2>Safety Report가 필요한 경우</h2><p>작업 종료 전 확인 결과에 따라 추가적으로 기록할 안전사항이 있는 경우 Safety Report 작성 Flow로 이어질 수 있습니다.<br><br>작업 중 발견했거나 종료 시 남겨야 할 안전사항이 있다면 Safety Report로 기록합니다.</p></section>
            <section class="platform-ready-04-purpose" data-ready-section="report-purpose"><b>SAFETY REPORT · 목적</b><p>Safety Report는 모든 작업자가 매번 작성하는 보고서가 아닙니다. 작업 중 발견했거나 종료 시 남겨야 할 안전사항이 있을 때 필요한 내용을 기록하기 위한 Flow입니다.</p></section>
            ${readyPlatformL04Product('work-progress','PRODUCT SCREEN · 실제 Platform 화면','assets/platform/figma-ready/ch04/work-progress.png','Daily Safety 완료 후 실제 작업 상태 화면',['현재 작업과 진행 상태 확인','Daily Safety 완료 상태 확인','작업 중 필요한 안전 행동으로 이동'],'Daily Safety 완료 후 실제 작업 상태로 전환된 화면입니다.')}
            <section class="platform-ready-04-editorial platform-ready-04-action" data-ready-section="action-01"><b>ACTION ①</b><h2>작업 종료도 확인 없이 끝내지 않습니다</h2><p>작업을 마쳤다고 바로 종료 처리하지 않습니다.<br><br>ONOFF는 작업 종료 전에 현재 작업 상태와 주변 안전상태를 한 번 더 확인하도록 합니다.<br><br>작업 시작 전 최소 안전확인이 있었다면, 작업 종료 전에도 놓치지 않아야 할 마지막 확인이 있습니다.</p><blockquote>시작 전에 확인하고, 끝나기 전 다시 확인합니다.</blockquote></section>
            ${readyPlatformL04Product('end-work-check','PRODUCT SCREEN · 작업 종료 전 확인','assets/platform/figma-ready/ch04/end-work-check.png','작업 종료 전에 마지막 안전상태를 확인하는 실제 Platform 화면',['작업 종료 전 필수 확인','현재 상태를 예/아니오로 직접 확인','확인 완료 후 종료 Flow 진행'],'작업을 종료하기 전에 마지막 안전상태를 직접 확인합니다.')}
            <section class="platform-ready-04-editorial platform-ready-04-action" data-ready-section="action-02"><b>ACTION ②</b><h2>오늘의 안전활동을 마무리합니다</h2><p>작업 종료 전 확인을 마치고, 필요한 경우 Safety Report까지 완료하면 오늘 작업의 안전활동이 종료됩니다.<br><br>ONOFF의 Daily Safety는 작업 시작 버튼 하나로 끝나는 기능이 아닙니다.<br><br>작업 전 → 작업 중 → 작업 종료 전까지 하나의 흐름으로 연결됩니다.</p><blockquote>안전은 작업의 시작부터 끝까지 이어집니다.</blockquote></section>
            ${readyPlatformL04Product('daily-complete','PRODUCT SCREEN · 오늘의 안전활동 완료','assets/platform/figma-ready/ch04/daily-complete.png','오늘 작업과 안전활동 완료 상태를 보여주는 실제 Platform 화면',['오늘 작업 완료 상태','안전활동 완료 확인','다음 행동으로 이동'],'작업 종료 전 확인까지 마치면 오늘 작업의 안전활동이 완료됩니다.')}
            <section class="platform-ready-04-flow platform-ready-04-flow--loop" data-ready-section="daily-safety-loop"><div><b>DAILY SAFETY LOOP</b><h2>작업의 시작부터 끝까지</h2>${['BEFORE · 작업 전 안전확인','WORK · Daily Safety → 작업 진행','DURING · 안전자료 확인 / 위험 신고 / 작업 중지','END · 작업 종료 전 확인','REPORT · 필요 시 Safety Report','COMPLETE · 오늘의 안전활동 완료'].map(item=>`<p>${item}</p>`).join('<i>▼</i>')}</div></section>
            <section class="platform-ready-04-practice ready-practice" data-ready-section="practice" data-ready-answer="02"><b>PRACTICE · 학습 확인</b><h2>ONOFF에서 작업 종료 전에 다시 안전상태를 확인하는 가장 중요한 이유는 무엇일까요?</h2><div class="ready-practice-options">${[['01','작업시간을 계산하기 위해'],['02','작업이 끝난 뒤 문제가 남아 있지 않은지 마지막으로 확인하기 위해'],['03','관리자가 작업자를 평가하기 위해'],['04','다음 작업을 자동 배정하기 위해']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>작업 종료 전 확인은 새로운 문서를 작성하기 위한 절차가 아닙니다. 작업을 마치기 전에 작업 상태와 주변 안전상태를 마지막으로 확인하기 위한 최소 안전확인입니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></section>
            <section class="platform-ready-04-complete" data-ready-section="complete"><div><b>COMPLETE</b><h2>학습 04 · 핵심 정리</h2><ol>${['작업 시작 이후에도 안전활동은 계속됩니다.','작업 중에는 필요할 때 안전자료 확인, 위험 신고, 작업 중지 등의 안전 행동으로 이어질 수 있습니다.','작업 종료 전에는 마지막 안전상태를 다시 확인합니다.','필요한 경우 Safety Report를 남긴 뒤 오늘 작업의 안전활동을 완료합니다.'].map(item=>`<li><strong>✓</strong><span>${item}</span></li>`).join('')}</ol></div><nav class="ready-bottom-navigation" aria-label="학습 이동"><a href="#daily-work">← 이전 학습</a><a href="#platform-course">학습 목록</a><a href="#platform-course" data-complete-on-navigation="safety-report">과정 완료</a></nav></section>
          </main>
        </article>`);
    }

    document.querySelectorAll('.platform-ready-desktop-learning .ready-practice').forEach((practice) => {
      practice.querySelectorAll('[data-ready-choice]').forEach((button) => button.addEventListener('click', () => {
        practice.querySelectorAll('[data-ready-choice]').forEach((choice) => choice.classList.toggle('is-selected', choice === button));
        practice.querySelector('[data-ready-check]').disabled = false;
      }));
      practice.querySelector('[data-ready-check]')?.addEventListener('click', () => {
        const selected = practice.querySelector('[data-ready-choice].is-selected');
        if (!selected) return;
        const correct = selected.dataset.readyChoice === practice.dataset.readyAnswer;
        practice.querySelectorAll('[data-ready-choice]').forEach((choice) => {
          choice.disabled = true;
          choice.classList.remove('is-selected');
          choice.classList.toggle('is-correct', choice.dataset.readyChoice === practice.dataset.readyAnswer);
          choice.classList.toggle('is-incorrect', choice === selected && !correct);
        });
        practice.querySelector('[data-ready-check]').disabled = true;
        const result = practice.querySelector(':scope > aside');
        result.hidden = false;
        result.querySelector('strong').textContent = correct ? 'Correct' : 'Incorrect · Hint를 확인하고 다시 시도하세요.';
        practice.querySelector(':scope > [data-ready-retry]')?.toggleAttribute('hidden', correct);
      });
      practice.querySelector('[data-ready-retry]')?.addEventListener('click', () => {
        practice.querySelectorAll('[data-ready-choice]').forEach((choice) => { choice.disabled = false; choice.classList.remove('is-selected','is-correct','is-incorrect'); });
        practice.querySelector('[data-ready-check]').disabled = true;
        practice.querySelector(':scope > aside').hidden = true;
        practice.querySelector(':scope > [data-ready-retry]')?.setAttribute('hidden', '');
      });
    });
    const platformL02Practice = document.querySelector('.platform-ready-02-practice');
    platformL02Practice?.querySelectorAll('[data-ready-choice]').forEach((choice) => choice.addEventListener('click', () => {
      platformL02Practice.querySelector('[data-ready-check]')?.click();
    }));
    const platformL03Practice = document.querySelector('.platform-ready-03-practice');
    platformL03Practice?.querySelectorAll('[data-ready-choice]').forEach((choice) => choice.addEventListener('click', () => {
      platformL03Practice.querySelector('[data-ready-check]')?.click();
    }));
    const platformL04Practice = document.querySelector('.platform-ready-04-practice');
    platformL04Practice?.querySelectorAll('[data-ready-choice]').forEach((choice) => choice.addEventListener('click', () => {
      platformL04Practice.querySelector('[data-ready-check]')?.click();
    }));
    document.querySelectorAll('.platform-ready-desktop-learning .ready-platform-screen img').forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt || 'Platform 학습 이미지'} 확대 보기`);
    });
  };

  const detachedPlatformLegacy = new Map();
  const syncPurePlatformDesktopContent = () => {
    ['philosophy','workflow','daily-work','safety-report'].forEach((chapterId) => {
      const chapter = document.getElementById(chapterId);
      if (!chapter) return;
      if (desktopHomeMedia.matches) {
        const legacy = [...chapter.children].filter((element) => !element.classList.contains('figma-ready-desktop-learning'));
        if (legacy.length) detachedPlatformLegacy.set(chapterId, legacy);
        legacy.forEach((element) => element.remove());
      } else {
        (detachedPlatformLegacy.get(chapterId) || []).forEach((element) => chapter.append(element));
        detachedPlatformLegacy.delete(chapterId);
      }
    });
  };
  desktopHomeMedia.addEventListener('change', () => {
    mountExactPlatformDesktopLearning();
    syncPurePlatformDesktopContent();
  });

  const mountExactRiskDesktopLearning = () => {
    if (!desktopHomeMedia.matches) return;
    const flow = (items) => `<ol class="risk-ready-flow">${items.map((item,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span><strong>${item}</strong></li>`).join('')}</ol>`;
    const cards = (items) => `<div class="risk-ready-cards">${items.map(([title,text],index)=>`<article><small>${String(index+1).padStart(2,'0')}</small><strong>${title}</strong><p>${text}</p></article>`).join('')}</div>`;
    const practice = (question,answer,choices,explanation) => `<section class="risk-ready-section ready-practice" data-ready-section="practice" data-ready-answer="${answer}"><b class="risk-ready-tag">PRACTICE</b><h2>학습 확인</h2><p>${question}</p><div class="ready-practice-options">${choices.map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>${explanation}</p><button type="button" data-ready-retry>다시 풀기</button></aside></section>`;
    const complete = (id,title,items,previous,next) => `<section class="risk-ready-complete" data-ready-section="${next ? 'complete' : 'course-complete'}"><div><b>${next ? 'LEARNING COMPLETE' : 'COURSE COMPLETE'}</b><h2>${title}</h2><ol>${items.map((item,index)=>`<li><strong>0${index+1}</strong><span>${item}</span></li>`).join('')}</ol><button type="button" data-learning-complete="${id}">학습 완료</button></div><nav class="ready-bottom-navigation" aria-label="학습 이동">${previous ? `<a href="#${previous}">‹ 이전 학습</a>` : '<span aria-disabled="true">‹ 이전 학습</span>'}<a href="#risk-course">▤ 학습 목록</a>${next ? `<a href="#${next}">다음 학습 ›</a>` : '<a href="#home">Academy로 ›</a>'}</nav></section>`;

    const risk01 = document.getElementById('risk-assessment-purpose');
    if (risk01 && !risk01.querySelector(':scope > .risk-ready-desktop-learning')) risk01.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning risk-ready-l01" data-figma-source="174:4" data-ready-inventory="sidebar|hero|why|concept|find|method|process|practice|complete|bottom-navigation" aria-labelledby="risk-ready-01-title">
        <aside class="risk-l01-sidebar" aria-label="Academy 학습 탐색"><small>HOME</small><a href="#home">Academy Home</a><small>위험성평가</small>${[['01','위험성평가의 이해','risk-assessment-purpose'],['02','위험성 판단과 감소대책','risk-assessment-structure'],['03','현장 실행과 지속 관리','risk-assessment-stra'],['04','ONOFF Platform 연결','risk-assessment-platform']].map(([number,title,route],index)=>`<a href="#${route}"${index===0?' class="is-active" aria-current="page"':''}><span>${number}</span>${title}</a>`).join('')}<small>LIBRARY</small>${[['TBM','tbm-course'],['SOP','sop-course'],['위험성평가','risk-course'],['특별안전교육','special-course'],['설비안전','equipment-course'],['비상대응','emergency-course'],['사고사례','case-course']].map(([title,route])=>`<a href="#${route}">${title}</a>`).join('')}</aside>
        <div class="risk-l01-workspace">
          <header class="risk-l01-hero"><div><p><strong>01</strong><span><b>PART 01 · 위험성평가 기초</b><small>학습 01 / 04</small></span></p><h1 id="risk-ready-01-title">위험성평가의 이해</h1><h2>위험을 미리 찾고 체계적으로 이해하는 안전의 첫걸음</h2><p>위험성평가는 사고가 발생하기 전, 현장 곳곳에 숨어있는 위험요인을 스스로 찾아내 개선 대책을 세우는 핵심 예방 프로세스입니다. 본 과정을 통해 그 가치와 방법론을 탐구합니다.</p></div><aside><b>이번 학습에서 배울 내용</b>${['위험성평가가 무엇이고 왜 현장에 필수적으로 요구되는지','현장에서 숨겨진 유해·위험요인을 정확하게 찾아내는 방법','상황 변화와 조건에 따라 위험을 다각적이고 체계적으로 바라보는 관점'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="risk-l01-section risk-l01-why" data-ready-section="why"><b>WHY</b><h2>왜 위험성평가가 필요한가</h2><blockquote>“사고는 예측할 수 없지만, 위험은 미리 찾을 수 있습니다.”</blockquote><div class="risk-l01-compare"><article><strong>위험성평가 없이</strong><p>작업 현장의 고유 위험을 인지하지 못하고 바로 작업을 개시합니다. 안전 사각지대가 방치되어 아차사고나 중대재해로 이어질 확률이 높으며, 사고 발생 후에야 비로소 대응 및 수습이 시작됩니다.</p><small>결과: 예기치 못한 사고 발생, 공기 지연, 법적 책임</small></article><article><strong>위험성평가 후</strong><p>실제 기계 조작 및 현장 접근 전에 숨겨진 위험요인을 미리 점검하고 제거합니다. 작업자 전원이 대책을 공유하고 가장 안전한 상태에서 작업을 전개하므로 재해를 원천 차단할 수 있습니다.</p><small>결과: 무재해 안전 달성, 작업 효율 증대, 주도적 안전 정착</small></article></div><p>사업주는 건설물, 설비, 원재료, 가스, 분진, 근로자의 작업행동 등 유해·위험요인을 찾아내어 부상 및 질병의 방지를 위한 필요한 조치를 강구해야 합니다. 이는 법적 의무이기 전에, 현장의 모든 근로자가 건강하고 안전하게 퇴근할 수 있도록 보장하는 약속입니다.</p></section>
          <section class="risk-l01-section risk-l01-concept" data-ready-section="concept"><b>CONCEPT</b><h2>위험성평가란 무엇인가</h2><blockquote>“작업 전에 유해·위험요인을 찾아내고, 위험한 정도를 판단하여, 감소대책을 세우는 일련의 과정입니다.”</blockquote><div class="risk-l01-five"><strong>5단계 위험성평가 프로세스</strong>${[['01','유해·위험요인 파악','현장의 물리적·화학적 위험요인 발견'],['02','위험성 추정','빈도(가능성)와 강도(중대성)를 곱하여 수치화'],['03','위험성 결정','허용 가능한 범위 내의 위험인지 판단'],['04','감소대책 수립','위험 수준을 낮추기 위한 설계·시설 대책 마련'],['05','실행 및 확인','결정된 대책의 완벽한 적용과 모니터링']].map(([n,t,d])=>`<article><span>${n}</span><b>${t}</b><p>${d}</p></article>`).join('')}</div></section>
          <section class="risk-l01-section risk-l01-find" data-ready-section="find"><b>FIND</b><h2>무엇이 위험한가 - 유해·위험요인 찾기</h2><p>유해·위험요인(Hazard)이란 기계, 설비, 원재료 등이나 근로자의 행동에 의하여 인가에게 부상이나 질병을 유발할 수 있는 잠재적 위험 요소를 모두 아우르는 말입니다.</p><div class="risk-l01-hazards">${[['물리적 위험요인',['추락 (높은 곳에서의 낙하)','끼임 (기계 회전체 및 틈새)','충돌 (자재 및 차량 이동)','감전 및 화상','고온 작업 환경']],['화학적 위험요인',['유해 화학물질 접촉 및 누출','분진 및 미세먼지 호흡기 유입','독성 가스 체류','가연화성 물질 증기 폭발','피부 자극성 세척제']],['작업환경 위험요인',['지속적인 청각 손상 소음','강한 진동에 의한 신경 장애','조명 부족 및 시야 제한','밀폐공간 산소결핍','근골격계 부담 무리한 동선']]].map(([t,list])=>`<article><h3><i aria-hidden="true"></i>${t}</h3><ul>${list.map(item=>`<li>${item}</li>`).join('')}</ul></article>`).join('')}</div><h3>회사 유해·위험요인 분류 체계</h3><p>회사의 유해·위험요인 파악 양식은 다음의 계층적 분류 체계를 따릅니다.</p><ol class="risk-l01-classification">${[['대분류','인적·물적·환경적 요소'],['중분류','세부 위험 유형'],['소분류','구체적 위험 행위'],['재해/상해 형태','끼임·추락·충돌 등'],['발생원인','근본 원인 파악']].map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol><aside class="risk-l01-case"><strong>DS제어팀 실제 사례 - 본작업-04 DOOR OPEN</strong><div>${[['대분류','인적요소'],['중분류','인지 및 조작능력'],['소분류','Human Error (판단착오)'],['재해형태','끼임']].map(([t,d])=>`<span><small>${t}</small><b>${d}</b></span>`).join('')}</div><p>이처럼 회사의 위험요인 파악 양식은 단순히 “끼임이 발생할 수 있다”는 현상 기술에 그치지 않고, <b>인적요소 → 인지 및 조작능력 → Human Error</b>로 이어지는 근본 원인까지 체계적으로 추적합니다.</p></aside><blockquote>“위험요인은 눈에 보이는 것만이 아닙니다. 작업 절차, 보호구 착용 상태, 근로자의 피로도, 이동 동선까지 입체적으로 살펴야 합니다.”</blockquote></section>
          <section class="risk-l01-section risk-l01-method" data-ready-section="method"><b>METHOD</b><h2>위험요인을 찾는 방법</h2><div>${[['현장 관찰','작업이 실제 일어나는 위치와 설비 배치를 눈으로 둘러보고 오염, 불완전한 고정 상태를 즉시 파악합니다.'],['작업자 면담','현장에서 반복적인 경험이 축적된 실작업자들에게 기술이 불편하거나 불안감을 느끼는 원인을 묻습니다.'],['사고 이력 검토','과거에 발생한 자잘한 일상이나 근접 아차사고 기록 보고서를 활용하여 동일 지점의 재발 확률을 분석합니다.'],['체크리스트 활용','표준안전점검 표(SOP 등)에 따라 구조화된 누락 없는 정량적 확인을 전개합니다.']].map(([t,d],i)=>`<article><h3><span>${i+1}</span>${t}</h3><p>${d}</p></article>`).join('')}</div><aside class="risk-l01-chain"><strong>위험의 체인 (CHAIN OF HAZARD)</strong><ol><li><small>원인 (Cause)</small><b>사다리 고정 불량</b></li><li><small>위험요인 (Hazard)</small><b>높은 곳에서의 추락 위험</b></li><li><small>결과 (Consequence)</small><b>신체 골절 및 휴업재해</b></li></ol></aside></section>
          <section class="risk-l01-section risk-l01-process" data-ready-section="process"><b>PROCESS</b><h2>위험성평가의 전체 흐름</h2><p>위험을 찾고 점수를 매기는 것이 끝이 아니라, 현재 조치를 확인하고 필요한 경우 개선한 뒤 위험이 실제로 낮아졌는지 다시 확인합니다.</p><ol>${[['FIND','01','위험요인을 찾는다','기계, 설비, 작업 환경, 인적 요소 등 모든 잠재적 유해·위험요인을 대분류 → 중분류 → 소분류로 체계적으로 식별합니다.'],['ASSESS','02','최초 위험성을 판단한다','아무런 안전조치가 없다고 가정했을 때의 빈도(가능성)와 강도(중대성)를 매트릭스에 대입하여 초기 위험성 수준을 산출합니다.'],['CONTROL','03','현재 안전조치를 확인한다','현재 현장에 이미 적용된 안전조치(방호장치, 보호구, 절차 등)를 파악하고 그 실효성을 점검합니다.'],['DECIDE','04','현재 위험성을 판단한다','기존 안전조치를 반영한 상태에서 실제 위험성을 재평가합니다. 이 수치가 허용 기준 초과 시 다음 단계로 진행합니다.'],['IMPROVE','05','필요하면 더 근본적인 감소대책을 세운다','위험성이 여전히 높다면 제거 → 대체 → 공학적 조치 → 관리적 조치 → 보호구 우선순위로 추가 감소대책을 수립합니다.'],['RE-ASSESS','06','개선 후 위험성을 다시 확인한다','감소대책 실행 이후 위험성이 실제로 낮아졌는지 재평가합니다. 목표 수준에 미치지 못하면 5단계로 돌아갑니다.'],['VERIFY','07','실행과 완료를 확인한다','감소대책의 이행 여부와 완료 시점을 공식 기록으로 남기고, 담당자를 지정하여 책임 소재를 명확히 합니다.']].map(([tag,n,t,d])=>`<li><span><small>${tag}</small><b>${n}</b></span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol><aside class="risk-l01-memory"><h3>이 흐름에서 꼭 기억할 것</h3>${[['FIND에서 시작해 VERIFY로 완성된다','7단계는 순서대로 진행되며, 각 단계는 다음 단계의 입력값이 됩니다.'],['CONTROL 단계가 핵심 분기점이다','현재 조치를 확인해야만 진짜 위험성을 판단(DECIDE)할 수 있습니다.'],['RE-ASSESS가 있어야 평가가 완결된다','개선 후 위험이 실제로 낮아졌는지 반드시 재확인해야 평가 루프가 완성됩니다.']].map(([t,d],i)=>`<p><span>${i+1}</span><b>${t}</b><small>${d}</small></p>`).join('')}</aside><blockquote>“위험을 찾고 점수를 매기는 것이 끝이 아니라, 현재 조치를 확인하고 필요한 경우 개선한 뒤 위험이 실제로 낮아졌는지 다시 확인합니다. 이 전체 흐름이 위험성평가의 본질입니다.”</blockquote></section>
          ${practice('건설 현장에서 비가 오는 날 옥상 방수 작업을 수행하고자 합니다. 이 고위험 상황에서 가장 우선적으로 점검하고 예방 대책을 세워야 할 핵심 유해·위험요인은 무엇입니까?','B',[['A','옥상 방수에 사용할 액상 도료의 재고 및 잔여 물량 수량 확인'],['B','강우로 인한 바닥 미끄러움과 단부에서의 작업자 미끄러짐/추락 위험'],['C','오늘 작업 완료 보고 및 현장 관리자 결재 시간'],['D','교대 근로자들과 협의된 인근 지점 점심 식사 식당 위치']],'강우 시에는 젖은 바닥의 미끄러움과 옥상 단부 추락 위험을 가장 먼저 확인하고 작업 중지 또는 추락 방지 대책을 세워야 합니다.')}
          <section class="risk-l01-complete" data-ready-section="complete"><b>학습 완료</b><h2>학습 01 · 위험성평가의 이해</h2><ol>${['사전 위험성평가의 정의와 이것이 현장의 실질적 생명선이라는 것을 명확히 이해했습니다.','물리적, 화학적, 작업환경 등 각 영역에 맞춘 유해·위험요인 발견 기법을 학습했습니다.','작업 조건(누가, 언제, 어디서)에 입각하여 위험을 다각적으로 바라보는 안전 시각을 확보했습니다.'].map(item=>`<li><span>✓</span>${item}</li>`).join('')}</ol><button type="button" data-learning-complete="risk-assessment-purpose">학습 완료</button></section>
          <nav class="risk-l01-bottom-nav" aria-label="학습 이동"><span aria-disabled="true">← 이전 학습</span><a href="#risk-course">학습 목록</a><a href="#risk-assessment-structure">다음 학습 →</a></nav>
        </div>
      </article>`);

    const risk02 = document.getElementById('risk-assessment-structure');
    if (risk02 && !risk02.querySelector(':scope > .risk-ready-desktop-learning')) risk02.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning risk-ready-l02" data-figma-source="174:332" data-ready-inventory="sidebar|hero|initial-risk|matrix|apply|current-risk|control|improve|practice|complete|bottom-navigation" aria-labelledby="risk-ready-02-title">
        <aside class="risk-l02-sidebar" aria-label="Academy 학습 탐색"><small>HOME</small><a href="#home">Academy Home</a><small>위험성평가</small>${[['위험성평가의 이해','risk-assessment-purpose'],['위험성 판단과 감소대책','risk-assessment-structure'],['현장 실행과 지속 관리','risk-assessment-stra'],['ONOFF Platform 연결','risk-assessment-platform']].map(([title,route],index)=>`<a href="#${route}"${index===1?' class="is-active" aria-current="page"':''}>${title}</a>`).join('')}<small>LIBRARY</small>${[['TBM','tbm-course'],['SOP','sop-course'],['위험성평가','risk-course'],['특별안전교육','special-course'],['설비안전','equipment-course'],['비상대응','emergency-course'],['사고사례','case-course']].map(([title,route])=>`<a href="#${route}">${title}</a>`).join('')}</aside>
        <div class="risk-l02-workspace">
          <header class="risk-l02-hero"><div><p><strong>02</strong><span><b>PART 01 · 위험성평가 코어</b><small>학습 02 / 04</small></span></p><h1 id="risk-ready-02-title">위험성 판단과 감소대책</h1><h2>위험의 크기를 합리적으로 추정하여 판단하고, 실질적으로 줄여내는 프로세스</h2><p>위험성평가는 단순히 위험을 '찾는' 것에서 그치지 않습니다. 그 위험이 우리 현장에서 얼마나 치명적이며 자주 발생할 수 있는지 냉정하게 계산(ASSESS)하고, 공학적·관리적 수단(CONTROL)을 동원해 안전한 수준까지 낮춰야 완결됩니다.</p></div><aside><b>이번 학습에서 배울 내용</b>${['위험성의 크기(가능성 × 심각성)를 과학적으로 추정하는 법','수치화된 등급을 바탕으로 대책 수립 여부를 결정하는 원칙','제거·대체부터 보호구까지, 효과적인 감소대책 수립의 5단계'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="risk-l02-section risk-l02-initial" data-ready-section="initial-risk"><b>STEP 01</b><h2><span>01</span> 최초 위험성 - Initial Risk</h2><p>해당 작업의 유해·위험요인이 본래 어느 정도의 위험을 가지고 있는지 판단합니다. 현재 안전조치를 적용하기 전 기준으로 가능성(빈도) × 중대성(강도)을 통해 최초 위험수준을 확인합니다.</p><div class="risk-l02-two-cards">${[['가능성 (빈도) - 4단계','해당 유해·위험요인이 실제 사고나 부상으로 이어질 수 있는 노출 빈도와 확률을 의미합니다. 설비 노후도, 안전 대책 유무, 작업 횟수 등을 다각도로 고려하여 낮음부터 높음까지 4단계로 객관적으로 판단합니다.'],['중대성 (강도) - 5단계','사고가 발생했을 때 작업자가 입을 수 있는 피해의 치명도를 의미합니다. 간단한 처치로 복귀 가능한 경미한 부상(휴업 1일 미만)부터 생명에 위협을 주는 중대재해(사망 또는 영구 장애)까지 5단계로 구분합니다.']].map(([t,d])=>`<article><h3><i>!</i>${t}</h3><p>${d}</p></article>`).join('')}</div><aside class="risk-l02-danger"><b>대표적인 고위험 예시</b><strong>높은 곳에서 안전난간 없이 고소 작업 수행</strong><p>단 한번의 실수가 치명적인 추락사고로 직접 연결되는 상황</p><span>가능성: 높음　×　중대성: 치명적</span></aside><blockquote>이것은 안전조치가 없는 상태의 위험수준입니다. 현재 적용 중인 안전조치를 확인한 뒤 현재 위험성을 다시 판단합니다.</blockquote></section>
          <section class="risk-l02-section risk-l02-matrix" data-ready-section="matrix"><b>MATRIX</b><h2>위험성 결정 - Risk Matrix</h2><p>추정된 가능성(빈도)과 중대성(강도)을 매트릭스에 대입하여 최종 위험 수준을 결정합니다. 결과에 따라 작업 속행 여부를 즉시 판단해야 합니다.</p><div class="risk-l02-matrix-card"><header><strong>INPUT</strong><span>가능성(빈도) × 중대성(강도)</span></header><div class="risk-l02-inputs"><article><b>가능성 (빈도) - 4단계</b><ol>${[['1','매우낮음'],['2','낮음'],['3','있음'],['4','높음']].map(([n,t],i)=>`<li${i===3?' class="is-current"':''}><strong>${n}</strong><small>${t}</small></li>`).join('')}</ol></article><article><b>중대성 (강도) - 5단계</b><ol>${[['1','경미'],['2','휴업3일미만'],['3','산업재해'],['4','중대재해'],['5','사망']].map(([n,t],i)=>`<li${i===4?' class="is-current"':''}><strong>${n}</strong><small>${t}</small></li>`).join('')}</ol></article></div><header><strong>MATRIX</strong><span>4×5 매트릭스 - 실제 회사 기준</span></header><p class="risk-l02-matrix-help"><i>!</i><b>매트릭스 읽는 법</b><span>행(Row) = 중대성(강도) 1~5, 열(Column) = 가능성(빈도) 1~4. 셀 값 = 강도 × 빈도</span></p><div class="risk-l02-grid"><span>중대성 \ 가능성</span>${[1,2,3,4].map(n=>`<b>${n}</b>`).join('')}${[5,4,3,2,1].map(severity=>`<strong>${severity} - ${severity===5?'사망':severity===4?'중대재해':severity===3?'산업재해':severity===2?'그 외 휴업재해':'경미사고'}</strong>${[1,2,3,4].map(likelihood=>{const score=severity*likelihood;return `<i data-level="${score<=3?'low':score<=5?'medium':score<=11?'high':'critical'}">${score}</i>`}).join('')}`).join('')}</div><header><strong>RATING RESULTS</strong><span>등급별 조치 기준 (4 levels)</span></header><div class="risk-l02-ratings">${[['1~3 수용가능','현재의 상태 지속가능','low'],['4~5 허용가능','현재의 안전조치 유지, 필요 시 추가 개선 실행','medium'],['6~11 조건부 허용가능','계획된 기간에 추가적인 안전 감소대책을 세워 개선 실행','high'],['12~20 허용불가','업무/작업중지, 즉시 개선 실행','critical']].map(([t,d,l])=>`<article data-level="${l}"><h3>${t}</h3><p>${d}</p></article>`).join('')}</div><blockquote>위험성 = 가능성(빈도) × 중대성(강도). 허용 불가능한 수준이면 반드시 감소대책을 수립해야 합니다.</blockquote></div></section>
          <section class="risk-l02-section risk-l02-apply" data-ready-section="apply"><b>APPLY</b><h2>실제 상황에 적용해보기</h2><p>현장에서 흔히 발생하는 아차사고 유발 시나리오를 Matrix 기준으로 시뮬레이션해 봅니다.</p><ol>${[['용접 작업 중 불꽃이 주변 가연물에 튀는 상황','불티 방지포가 없고 인근에 인화성 가스 용기가 다수 방치되어 있는 열악한 현장','즉시 작업 중지 및 불티방지 조치 필수'],['지게차 이동 경로에 보행자 통로가 별도로 분리되지 않은 상황','자재 상하차 작업 구역과 작업자 이동 동선이 혼재되어 상시 충돌 위험 존재','안전 유도원 배치 및 별도 보행 통로 구획 구축'],['밀폐공간 내부에서 충분한 환기 없이 내부 도장 작업하는 상황','산소 농도 측정이 미실행되었고 송풍 장치도 비활성화되어 있는 상태','산소농도 검사 완료 시까지 작업 전면 보류 및 긴급 공조장치 가동']].map(([t,d,a],i)=>`<li><span>0${i+1}</span><div><h3>${t}</h3><p>${d}</p><small>가능성: <b>${i===2?'매우 높음':'높음'}</b>　 심각성: <b>${i===2?'매우 치명':'치명'}</b>　 매트릭스 등급: <b>${i===2?'매우높음 (5)':'높음 (4)'}</b></small></div><strong>${a}</strong></li>`).join('')}</ol></section>
          <section class="risk-l02-section risk-l02-control" data-ready-section="current-risk"><b>STEP 02</b><h2><span>02</span> 현재 안전조치를 확인한다</h2><p>현재 현장에 적용된 안전조치를 확인하고, 각 조치가 위험을 실제로 얼마나 낮추는지 판단합니다.</p><div class="risk-l02-controls">${[['공학적 제어 (Engineering Control)','방호장치 · 인터록 · 국소배기 · 자동화 설비','점수 × 0.5'],['관리적 제어 (Administrative Control)','교육/훈련 · 점검활동 · 비상상황 대응 · 작업허가 및 절차서','점수 × 0.2'],['개인보호구 (PPE)','방진마스크 · 안전모 · 안전대 착용 등 - 최후 수단','점수 × 0.1']].map(([t,d,s],i)=>`<article><span>${i+1}</span><div><h3>${t}</h3><p>${d}</p></div><b>${s}</b></article>`).join('')}</div><div class="risk-l02-control-title"><b>CONTROL</b><h2>어떻게 줄일 것인가 - 감소대책 수립</h2><p>“안전 예방의 본질은 문서 작성이 아닌 실질적 감소 조치에 있습니다.”</p></div><div class="risk-l02-hierarchy">${[['1단계','제거 (Elimination)','위험한 공정이나 물질을 완전 배제','실제 예시: 고소 작업을 생략하도록 설계 변경','최고 효과'],['2단계','대체 (Substitution)','덜 유해하거나 덜 위험한 물질/설비로 전환','실제 예시: 인화성 세척제를 수성 친환경 세척제로 변경','매우 우수'],['3단계','공학적 대책 (Engineering)','환기 장치, 방호 가드 등 기계적인 안전장치 설치','실제 예시: 기계 회전 부위에 연동식 가드 커버 장착','우수'],['4단계','관리적 대책 (Administrative)','안전 수칙 제정, 절차서 마련, 작업자 교육','실제 예시: 용접 작업 승인제 수립 및 작업 전 특별 안전 교육','보통'],['5단계','개인보호구 (PPE)','작업자 스스로 자신을 보호하기 위한 장비 착용','실제 예시: 방진마스크, 안전모, 안전대 착용','최하 효과 (최후 수단)']].map(([n,t,d,e,r],i)=>`<article data-level="${i+1}"><span>${n}</span><div><h3>${t}</h3><p>${d}</p><small>${e}</small></div><b>${r}</b></article>`).join('')}</div><blockquote>“안전모와 같은 보호구 지급은 위험을 줄이는 대책 중 가장 최후의 수단입니다. 최고의 안전은 작업 환경 자체에서 잠재적 위험을 완전히 지우는 설계적/공학적 제어(제거 및 대체)에서 나옵니다.”</blockquote><div class="risk-l02-step03"><b>STEP 03</b><h2><span>03</span> 현재 위험성 - Current Risk</h2><p>현재 적용된 안전조치를 확인한 뒤 현재 위험수준을 판단합니다.</p><strong>핵심 질문: 현재 조치만으로 이 작업을 허용 가능한 수준에서 수행할 수 있는가?</strong></div></section>
          <section class="risk-l02-section risk-l02-improve" data-ready-section="improve"><h2><span>04</span> 감소대책이 필요한 경우</h2><b>STEP 04 - IMPROVE</b><h3>개선이 필요한 경우 - Improve</h3><p>모든 위험에 무조건 새로운 대책을 추가하는 것이 아닙니다. 현재 위험성 평가 결과 개선이 필요한 경우에만 추가 감소대책을 수립합니다.</p><small>DS제어팀 사례 - 단순 대책 vs 근본적 개선</small><div class="risk-l02-improve-compare"><article><h4>✕ 단순 대책 (불충분)</h4>${[['교육 강화','인지에 의존하는 한계 - 반복 교육만으로는 구조적 위험 제거 불가'],['구두 주의','주의 당부 - 주의만으로 위험구역 진입을 물리적으로 차단할 수 없음'],['EMS 대응','사후 처치 - 사고 발생 후 대응이므로 근원적 예방 효과 없음']].map(([t,d],i)=>`<p><span>${i+1}</span><b>${t}</b><small>${d}</small></p>`).join('')}</article><article><h4>✓ 근본적 개선 (권장)</h4>${[['조작장치 구조 개선','물리적 설계 변경으로 인적 실수 자체를 원천 차단'],['다인수 그립 구조 적용','2인이 정해진 위치에서만 조작 가능하도록 구조적으로 강제'],['정위치 조작 방식','행동이 아닌 환경 설계로 위험 등급을 구조적으로 낮춤']].map(([t,d],i)=>`<p><span>${i+1}</span><b>${t}</b><small>${d}</small></p>`).join('')}</article></div><div class="risk-l02-cases">${[['사례 1. 자동화설비 시운전 위험구역 접근','교육 강화와 구두 주의로 위험구역 관리','위험도: 높음 (4등급)','조작장치 구조 개선으로 2인 정위치 조작 방식 적용','위험도: 허용 가능 (2등급)'],['사례 2. 전장작업 활선 접촉','작업자 주의와 보호구 착용에만 의존','위험도: 매우높음 (5등급)','차단기 LOTO 절차 + 검전기 확인 후 작업','위험도: 허용 가능 (2등급)']].map(([t,b,br,a,ar])=>`<article><h4>${t}</h4><div><span><b>BEFORE (개선 전)</b><p>${b}</p><small>${br}</small></span><span><b>AFTER (대책 적용 후)</b><p>${a}</p><small>${ar}</small></span></div></article>`).join('')}</div></section>
          ${practice('작업자가 2m 높이에서 외벽 도장 작업을 수행하고 있습니다. 현재 안전난간은 미설치되었고 오로지 안전대만 수동 체결하여 사용하고 있는 구조입니다. 위험 매트릭스상 최종 잔여 위험성을 더 근본적인 차원에서 낮추기 위한 가장 효과적인 행동 대책은 무엇일까요?','B',[['A','전체 도장 근로자들에게 해당 공정의 낙하 방지 안전교육을 이수하게 조치'],['B','도장 발판 가장자리에 법적 표준안전난간을 물리적으로 설치'],['C','비바람 등 기상 환경에 유의하며 작업 속도를 반으로 줄여 전개하도록 유도'],['D','현재 착용 중인 안전모 규격을 보강하여 더 충격 강도가 견고한 보호구를 배부']],'표준안전난간 설치는 작업자의 주의나 보호구에만 의존하지 않고 추락 위험을 물리적으로 낮추는 공학적 대책입니다.')}
          <section class="risk-l02-complete" data-ready-section="complete"><b>학습 완료</b><h2>학습 02 · 위험성 판단과 감소대책</h2><ol>${['위험을 가능성과 심각성의 곱으로 객관적 등급으로 계산(ASSESS)하는 법을 깨달았습니다.','작업 전 Matrix에 대입하여 기안전 조치 후 실행해야 하는 명확한 조치 가이드를 얻었습니다.','위험 요소를 제어하는 최고의 수단은 완벽한 배제와 제거(CONTROL)에 있음을 확인했습니다.'].map(item=>`<li><span>✓</span>${item}</li>`).join('')}</ol><button type="button" data-learning-complete="risk-assessment-structure">학습 완료</button></section>
          <nav class="risk-l02-bottom-nav" aria-label="학습 이동"><a href="#risk-assessment-purpose">← 이전 학습</a><a href="#risk-course">학습 목록</a><a href="#risk-assessment-stra">다음 학습 →</a></nav>
        </div>
      </article>`);

    const risk03 = document.getElementById('risk-assessment-stra');
    if (risk03 && !risk03.querySelector(':scope > .risk-ready-desktop-learning')) risk03.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning risk-ready-l03" data-figma-source="174:658" data-ready-inventory="sidebar|hero|execution|participation|documentation|change-management|continuous-cycle|practice|complete|bottom-navigation" aria-labelledby="risk-ready-03-title">
        <aside class="risk-l03-sidebar" aria-label="Academy 학습 탐색"><small>HOME</small><a href="#home">Academy Home</a><small>위험성평가</small>${[['위험성평가의 이해','risk-assessment-purpose'],['위험성 판단과 감소대책','risk-assessment-structure'],['현장 실행과 지속 관리','risk-assessment-stra'],['ONOFF Platform 연결','risk-assessment-platform']].map(([title,route],index)=>`<a href="#${route}"${index===2?' class="is-active" aria-current="page"':''}>${title}</a>`).join('')}<small>LIBRARY</small>${[['TBM','tbm-course'],['SOP','sop-course'],['위험성평가','risk-course'],['특별안전교육','special-course'],['설비안전','equipment-course'],['비상대응','emergency-course'],['사고사례','case-course']].map(([title,route])=>`<a href="#${route}">${title}</a>`).join('')}</aside>
        <div class="risk-l03-workspace">
          <header class="risk-l03-hero"><div><p><strong>03</strong><span><b>PART 02 · 현장 적용 및 지속</b><small>학습 03 / 04</small></span></p><h1 id="risk-ready-03-title">현장 실행과 지속 관리</h1><h2>대책을 현장에서 실행하고, 변화에 적극적으로 대응하기</h2><p>위험성평가는 서류 기록이나 수치를 매기는 것에서 완료되지 않습니다. 도출된 대책이 실질적으로 작업 현장에서 실행되고 작동하고 있는지 확인하고, 현장의 작업 조건이나 환경이 달라질 때 즉각적으로 재평가하는 동적인 지속 주기가 수립되어야만 생명을 구할 수 있습니다.</p></div><aside><b>이번 학습에서 배울 내용</b>${['감소대책을 현장에서 직접 타협 없이 실행하는 방법과 점검 수단','가장 정확히 현장을 아는 실제 작업자 주도적 참여의 핵심 이유','공정, 장비, 환경, 인원 변경 시 즉시 위험성을 재검토하는 Trigger 기준'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="risk-l03-section risk-l03-execution" data-ready-section="execution"><div class="risk-l03-step"><strong>05</strong><b>개선 후 재평가 - Re-Evaluate</b></div><header><b>STEP 05 - RE-EVALUATE</b><h2>대책 적용 후 다시 확인합니다</h2><p>수립된 감소대책은 책상 위의 문서가 아니라, 실제 근로자의 안전한 행동과 작업 가이드를 보장하는 실체적 실천이어야 합니다.</p></header><blockquote>“대책을 세웠는가 보다, 대책을 적용한 뒤 위험이 실제로 낮아졌는가를 확인하는 것이 중요합니다.”<span>③ 개선 후 위험등급 재산정</span></blockquote><div class="risk-l03-evaluation"><small>개선 후 위험등급 재확인 - 3단계 평가 흐름</small>${[['현재 위험성 평가','현재 수준에서 가능성과 중대성을 평가하여 현재 위험등급을 산출합니다.'],['감소대책 수립','개선이 필요한 경우에만 공학적·관리적·보호구 순서로 감소대책을 수립합니다.'],['개선 후 위험등급 재산정','대책 적용 후 위험이 실제로 허용 가능한 수준으로 낮아졌는지 등급을 다시 산정합니다.']].map(([title,text],index)=>`<article${index===2?' class="is-current"':''}><span>0${index+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div><div class="risk-l03-principles">${[['작업 전 공유','도출된 유해·위험요인과 예방 감소대책을 단 한 사람도 누락 없이 작업자 전원에게 실질적으로 설명하고 이해시킵니다.'],['현장 확인','계획된 하드웨어적 또는 공학적 대책이 실제로 현장에 적용되었는지 실제 작업 개시 버저가 울리기 전에 반드시 크로스체크합니다.'],['작업 중 관찰','작업이 진행되는 과정에서도 유기적으로 변하는 새로운 돌발 위험이 없는지 관리자와 근로자가 서로 지속적으로 주시하고 소통합니다.'],['이상 시 중지','도면이나 예측치에서 벗어나는 이상 징후나 숨겨진 잠재 위험 발견 시 현장의 전 근로자는 즉시 작업을 안전하게 중지하고 재점검을 개시합니다.']].map(([title,text],index)=>`<article><h3><span>0${index+1}</span>${title}</h3><p>${text}</p></article>`).join('')}</div></section>
          <section class="risk-l03-section risk-l03-participation" data-ready-section="participation"><header><b>PARTICIPATE</b><h2>작업자 참여 — 왜 중요한가</h2><p>실무자의 눈과 손끝에서 나오는 실제적 제안만이 죽어있는 체크리스트를 살려내고 무재해의 확실한 방어벽을 구축합니다.</p></header><div class="risk-l03-compare"><article><h3>관리자 단독 작성 시</h3><p>실질적인 현장의 미세한 흐름이나 물리적 한계를 충분히 반영하기 힘듭니다. 근로자는 지침을 전달받을 때 강제적 통제로 인지하여 준수율과 안전 동참 인식 수준이 낮아질 수밖에 없습니다.</p><strong>결과: 탁상행정 서류, 높은 잔여 아차사고, 의무 회피 유발</strong></article><article><h3>작업자 적극 협력 시</h3><p>다년간 축적된 실작업자들의 직관과 행동 이력을 대입하여 가려진 사각지대 위험요인을 입체적으로 색출합니다. 작업자 스스로 예방책에 기여했기에 주인의식을 갖고 타협 없는 표준을 유지합니다.</p><strong>결과: 실효적 현장안전 확보, 근로자 적극적 신고, 능동적 조치</strong></article></div><div class="risk-l03-methods"><h3>효과적인 3대 작업자 참여 수단</h3>${[['TBM 의견 수렴','매일 아침 작업 개시 전 TBM(Tool Box Meeting)에서 실제 위험 요소와 애로 사항을 자유롭게 제기하고 기록합니다.'],['위험 즉시 보고','작업 중 이상 상태나 균열, 누출, 오작동을 발견하는 즉시 메신저나 플랫폼을 통해 즉시 안전담당자에게 알립니다.'],['아차사고 공유','다치지는 않았지만 휴, 큰일 날 뻔했다 싶은 순간들을 전원에게 익명으로 투명히 공유하여 잠재 위험을 사전에 소멸합니다.']].map(([title,text])=>`<article><h4>${title}</h4><p>${text}</p></article>`).join('')}</div><blockquote>“실제 작업하는 근로자의 생생한 현장 경험과 매의 눈 같은 일상적 관찰이 위험성평가의 신뢰도를 극적으로 높이는 주동력입니다.”</blockquote></section>
          <section class="risk-l03-section risk-l03-documentation" data-ready-section="documentation"><header><b>RECORD</b><h2>기록하고 공유하기</h2><p>우수하게 정리된 정량적 기록은 향후 교대 작업이나 동일 공종 재실행 시 소중한 안전 내비게이션 역할을 수행합니다.</p></header><div><article><h3>우리가 지속적으로 기록하고 추적해야 할 사항</h3><ul>${['현장에서 도출되고 식별된 모든 유해·위험요인 (Hazard List)','가능성과 심각성 결합을 통해 평가된 정량적 위험수준','실제 적용하기로 확정하고 구현에 착수한 감소 예방 대책','대책 실행 여부 검증 데이터 및 현장 최종 책임자 전자서명'].map(item=>`<li>${item}</li>`).join('')}</ul></article><aside><h3>기록의 목적</h3><p>기록물은 노동청이나 감리기관 감독 대응용 보관 파일이 아닙니다. 이것은 다음 동일 형태 작업 수행 시 안전 시행착오나 중대 실수를 방지하는 소중한 자산이자 매뉴얼의 근간입니다.</p><strong>“기록은 점검의 증거가 아니라, 내일의 무재해를 보장하기 위한 준비입니다.”</strong></aside></div></section>
          <section class="risk-l03-section risk-l03-review" data-ready-section="change-management"><header><b>REVIEW</b><h2>무엇이 달라지면 다시 보는가</h2><p>작업 조건이 흔들리면 잠재되어 있던 전례 없는 형태의 위험이 눈을 뜹니다. 조건이 움직일 때마다 위험성평가를 즉각 갱신해야 합니다.</p></header><div class="risk-l03-triggers">${[['작업 방법 및 공정의 변경','기존 작업 순서나 공법, 자재 취급 방식, 작업 속도 또는 절차가 달라질 때'],['기계·설비의 도입 및 교체','신규 크레인이나 세척 설비 설치, 기존 핵심 노후 장비를 새 카테고리 모델로 변경 시'],['작업 환경의 급격한 변동','겨울철 빙판 단부 미끄러움, 갑작스러운 호우, 제한 조명 야간 연장 작업, 좁고 어두운 장소 진입 시'],['작업 인원의 대규모 교체','숙련된 파트장이 교체되거나 다수의 외국인 신규 근로자 유입, 하도급 수행 협력사 이관 시'],['실제 사고 및 아차사고 발발','현장 내 경미한 찰과상 또는 아찔했다 싶었던 Near Miss 이상 보고서가 등록되었을 때']].map(([title,text],index)=>`<article><span>0${index+1}</span><div><h3>${title}</h3><p>${text}</p></div><b>TRIGGER ${index+1}</b></article>`).join('')}</div><aside><h3>변경 관리 재검토 사이클</h3>${flow(['변경 감지 · 장비·인원·환경 등','필요성 판단 · 위험도 영향성 검증','평가 업데이트 · 신규 위험 대책 수립','현장 재공유 · TBM 및 교육 즉시 개시'])}</aside></section>
          <section class="risk-l03-section risk-l03-cycle" data-ready-section="continuous-cycle"><header><b>CYCLE</b><h2>위험성평가는 단발성 행사가 아닙니다</h2><p>안전은 정적인 스냅샷이 아닙니다. FIND → ASSESS → CONTROL → DECIDE → IMPROVE → RE-ASSESS → VERIFY, 7단계 루프가 현장이 살아있는 한 무한히 회전합니다.</p></header><ol class="risk-l03-cycle-diagram">${[['FIND','위험요인 파악','수시 식별'],['ASSESS','최초 위험성 판단','매트릭스 대입'],['CONTROL','현 안전조치 확인','실효성 점검'],['DECIDE','현재 위험성 판단','허용 기준 비교'],['IMPROVE','감소대책 수립','우선순위 적용'],['RE-ASSESS','개선 후 재확인','효과성 검증'],['VERIFY','실행·완료 확인','책임 기록']].map(([tag,title,text])=>`<li><b>${tag}</b><strong>${title}</strong><small>${text}</small></li>`).join('')}</ol><p class="risk-l03-cycle-trigger">변경 발생 시 즉시 재평가</p><div class="risk-l03-summary"><h3>7단계 핵심 요약</h3>${[['FIND','위험요인을 찾는다'],['ASSESS','최초 위험성을 판단한다'],['CONTROL','현재 안전조치를 확인한다'],['DECIDE','현재 위험성을 판단한다'],['IMPROVE','근본적인 감소대책을 세운다'],['RE-ASSESS','개선 후 위험성을 다시 확인한다'],['VERIFY','실행과 완료를 확인한다']].map(([tag,title],index)=>`<p><span>0${index+1}</span><b>${tag}</b>${title}</p>`).join('')}</div><strong class="risk-l03-cycle-note">위험성평가는 실제 작업이 존속하는 한 안전한 내일을 위해 무한히 회전하는 프로세스 체인입니다.</strong></section>
          <section class="risk-ready-section ready-practice" data-ready-section="practice" data-ready-answer="B"><b class="risk-ready-tag">PRACTICE</b><h2>지식 자가 측정</h2><small>오늘 배운 현장 실행 핵심과 변동 사항 Trigger 기준을 복습해 보는 실전 문제입니다.</small><p>기존 가벼운 하역 작업에 활발히 사용해 오던 구형 호이스트 크레인을, 높은 하중 용량을 지닌 최신 사양의 신규 모델 크레인으로 현장에 정식 반입 및 설치하였습니다. 이 시점에서 안전 수칙상 작업 시작 전 최우선적으로 단행해야 하는 핵심 업무 행동은 무엇일까요?</p><div class="ready-practice-options">${[['A','기존 장비 시절 작성해 놓았던 기존 위험성평가 서류를 행정상 그대로 서명 날인하여 보관한다.'],['B','장비 교체는 핵심 변동사항(Trigger)이므로 새 장비 제원에 준한 위험성평가를 전면 재검토 및 갱신 수립한다.'],['C','별도의 추가 위험평가 갱신 없이, 크레인 물리 운전수에게 단순 작동 교육만 약식으로 구두 지시한다.'],['D','작업 속도 단축을 위해 별도의 보고 절차를 전부 생략하고 기존 루틴에 의존하여 가동을 긴급 개시한다.']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>장비 교체는 대표적인 변경 Trigger입니다. 새 장비의 제원과 작업 조건을 기준으로 위험성평가를 다시 검토하고 갱신해야 합니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></section>
          <section class="risk-l03-complete" data-ready-section="complete"><b>학습 완료</b><h2>학습 03 · 현장 실행과 지속 관리</h2><ol>${['행정식 서류철 보관 목적을 벗어나 실제 작업 전 안전 점검과 관찰, 이상 시 비상 정지를 단행하는 4대 실행 원칙을 명확히 이해했습니다.','현장 내 숨겨진 구체적 유해 위험을 가장 날카롭게 잡아내는 근로자(작업자) 주도 참여와 철저한 체크리스트 데이터 축적의 중요성을 내재화했습니다.','공법, 기계설비, 자연환경 날씨, 조명, 인적 구성원 이관 변경 등 조건 흔들림 시 선제적 재평가를 기안하는 동적 Trigger 점검 시야를 확보했습니다.'].map(item=>`<li><span>✓</span>${item}</li>`).join('')}</ol><button type="button" data-learning-complete="risk-assessment-stra">학습 완료</button></section>
          <nav class="risk-l03-bottom-nav" aria-label="학습 이동"><a href="#risk-assessment-structure">← 이전 학습</a><a href="#risk-course">학습 목록</a><a href="#risk-assessment-platform">다음 학습 →</a></nav>
        </div>
      </article>`);

    const risk04 = document.getElementById('risk-assessment-platform');
    if (risk04 && !risk04.querySelector(':scope > .risk-ready-desktop-learning')) risk04.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning risk-ready-l04" data-figma-source="174:999" data-ready-inventory="sidebar|hero|daily-safety|path-a|path-b|comparison|practice|course-complete|bottom-navigation" aria-labelledby="risk-ready-04-title">
        <aside class="risk-l04-sidebar" aria-label="Academy 학습 탐색"><small>HOME</small><a href="#home">Academy Home</a><small>위험성평가</small>${[['위험성평가의 이해','risk-assessment-purpose'],['위험성 판단과 감소대책','risk-assessment-structure'],['현장 실행과 지속 관리','risk-assessment-stra'],['ONOFF Platform 연결','risk-assessment-platform']].map(([title,route],index)=>`<a href="#${route}"${index===3?' class="is-active" aria-current="page"':''}>${title}</a>`).join('')}<small>LIBRARY</small>${[['TBM','tbm-course'],['SOP','sop-course'],['위험성평가','risk-course'],['특별안전교육','special-course'],['설비안전','equipment-course'],['비상대응','emergency-course'],['사고사례','case-course']].map(([title,route])=>`<a href="#${route}">${title}</a>`).join('')}</aside>
        <div class="risk-l04-workspace">
          <header class="risk-l04-hero"><div><p><strong>04</strong><span><b>PART 04 · ONOFF PLATFORM PRACTICE</b><small>학습 04 / 04</small></span></p><h1 id="risk-ready-04-title">ONOFF Platform 연결</h1><h2>위험성평가를 ONOFF에서 어떻게 이어가는가</h2><p>앞서 다룬 핵심 이론과 위험성 판단 기준은 ONOFF 플랫폼의 Daily Safety 시스템을 통해 실물 현장에서 구현됩니다. 정식 연결 과정과 긴급 대체 경로(Daily Risk Check)의 규칙 및 종합적인 실전 습득을 검증합니다.</p></div><aside><b>이번 학습에서 배울 내용</b>${['ONOFF Daily Safety에서 위험성평가가 연결되는 방식','연결됨/미연결 두 경로(Path A & B)의 차이','위험성평가 전체 내용 종합 학습 확인'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
          <section class="risk-l04-section risk-l04-daily" data-ready-section="daily-safety"><header><b>ONOFF</b><h2>ONOFF Daily Safety와 위험성평가</h2><p>ONOFF Platform의 Daily Safety 흐름 안에서, 위험성평가가 어떻게 연결되는지 확인합니다.</p></header><blockquote><strong>“실체적 행동으로 이어지는 Daily Safety 연결망”</strong><span>어플리케이션 내의 당일 작업 확인(Check-in) 후, 이미 작성된 정식 위험성평가 데이터와의 일치 여부에 따라 유동적인 대응 인터페이스가 생성됩니다.</span></blockquote><div class="risk-l04-flow"><h3>DAILY SAFETY FLOW CHART</h3>${[['오늘 작업 확인','확인 완료 ✓'],['위험성평가 매핑','현재 진행 중'],['분기 경로 진입','대기 단계'],['Safety Start','대기 단계']].map(([title,state],index)=>`<article${index===1?' class="is-current"':''}><span>0${index+1}</span><div><b>${title}</b><small>${state}</small></div></article>`).join('')}</div></section>
          <section class="risk-l04-section risk-l04-path risk-l04-path-a" data-ready-section="path-a"><header><b>PATH A</b><h2>경로 A — 정식 위험성평가가 연결된 경우</h2><p>당일 작업에 대하여 법적으로 수립된 정식 위험성평가 항목이 매핑되어 있는 최적의 안전 관리 시나리오입니다.</p></header><article><h3>연결 성공 프로세스</h3><p>배정된 오늘 작업(예: 고소 배관 용접)을 누르는 즉시 사전에 안전보건관리위원회 및 근로자 협력으로 통과된 정식 위험성평가 데이터가 스크린에 로딩됩니다. 작업자는 예측되는 핵심 위험(추락, 비산 불티 화재)과 실제 준비된 대책을 크로스 체크합니다.</p><strong>과정: 오늘 작업 → 매핑 확인 → 위험요인/대책 숙지 → 관련 SOP → 서명 → Safety Start</strong></article><blockquote>✓ “이 과정은 추가 서류 작업이 아닙니다. 이전에 과학적으로 기록해둔 결론을 가장 효율적으로 현장 전원에게 리마인드시키는 동기화 약속입니다.”</blockquote></section>
          <section class="risk-l04-section risk-l04-path risk-l04-path-b" data-ready-section="path-b"><header><b>PATH B</b><h2>경로 B — 정식 위험성평가가 연결되지 않은 경우</h2><p>당일 진행해야 할 작업에 대하여 매핑된 위험성평가가 없는 긴급 단발성 혹은 특수 유치 상황을 위한 대체 흐름입니다.</p></header><article><h3>Daily Risk Check를 통한 위험유형 탐색</h3><p>신속한 긴급 보수 등 매핑 데이터가 공백인 상황에서는, 작업자가 플랫폼 내부에서 제시하는 당일 ‘Daily Risk Check’를 가동합니다. 본인이 직접 오늘 마주할 작업 위상(예: 고소, 비계, 고전압 등)의 위험유형 카테고리를 수동으로 태깅하고 대조하는 대체형 점검을 전개합니다.</p><strong>과정: 오늘 작업 → 미연결 감지 → Daily Risk Check 기동 → 핵심 위험유형 직접 선택 → 관련 SOP 연동 → 서명 → Safety Start</strong></article><blockquote>⚠ CRITICAL WARNING: Daily Risk Check는 법적 및 시스템상 공식 위험성평가를 대체할 수 없습니다. 정밀한 설계가 요구되거나 상시로 일어나는 고위험 복합 공종에는 반드시 독립적이고 정식인 위험성평가를 사전에 완료하고 고유 매핑 연결을 보강해야 합니다.</blockquote></section>
          <section class="risk-l04-section risk-l04-comparison" data-ready-section="comparison"><header><b>COMPARE</b><h2>두 경로 비교</h2><p>ONOFF 플랫폼에서 전개되는 두 갈래 안전 연결을 비교하여 상황별 지침을 통달합니다.</p></header><div><div><b>항목</b><b>경로 A: 연결됨 (정식 연동)</b><b>경로 B: 미연결 (대체 체크)</b></div>${[['기본 출발점','오늘 할당된 작업 확인','오늘 할당된 작업 확인'],['위험 요인 판단','매핑 완료된 정식 위험성평가 검토','자가 직접 수동 Daily Risk Check'],['최종 결부 단계','SOP ➔ 디지털 서명 ➔ Safety Start','SOP ➔ 디지털 서명 ➔ Safety Start']].map(row=>`<div>${row.map(item=>`<span>${item}</span>`).join('')}</div>`).join('')}</div><blockquote>“진입 방법의 정교성 차이가 있을 뿐, 현장 작업자의 생명선 확보 및 Safety Start 결합의 본질적 목적지는 같습니다.”</blockquote></section>
          <section class="risk-l04-practice" data-ready-section="practice"><header><b>PRACTICE</b><h2>종합 학습 확인</h2><p>Risk Assessment 전체 과정을 돌아보며 답해 보세요.</p></header><div class="ready-practice risk-l04-question" data-ready-answer="B"><h3>Q1. 위험성평가(Risk Assessment) 과정에서 위험성의 크기를 수학적이고 합리적인 가이드라인에 맞추어 판단하고자 할 때, 올바른 공식은 무엇인가요?</h3><div class="ready-practice-options">${[['A','현장 관리자의 과거 도제식 직관과 주관적인 경험에 의해서만 단독 판정한다.'],['B','사고가 발생할 확률인 빈도(가능성)와 피해의 크기인 강도(심각성)를 다차원으로 매치하여 결정한다.'],['C','별도 조치 없이 사고가 터져 피해액이 가시화되었을 때 지연 사후 계산한다.'],['D','공사 준공 이후 소급적으로 실적 서류를 합산하여 완결 처리한다.']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>위험성은 사고 발생 가능성과 피해의 심각성을 함께 판단하여 결정합니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></div><div class="ready-practice risk-l04-question" data-ready-answer="C"><h3>Q2. 위험성 제거대책(Hierarchy of Controls) 계통도에서 가장 근본적이고 효과성이 보증되는 최우선 순위 대책은 무엇인가요?</h3><div class="ready-practice-options">${[['A','근로자 개인에게 고품질 안전모나 귀마개 등의 보호 장구를 튼튼하게 지급하는 법'],['B','주의 문구가 각인된 붉은색 컬러 위험 경고 스티커를 현장 사방에 풍부히 부착하는 대책'],['C','엔지니어링 공정 설계를 원천 수정하거나, 자동화 기기를 도입해 위험요소 자체를 완전 제거/배제하는 것'],['D','이론 중심의 낙하 주의 안전 교육 세션을 정기적으로 이수하게 조치하는 법']].map(([value,label])=>`<button type="button" data-ready-choice="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-ready-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>가장 우선하는 대책은 공정 설계 변경이나 자동화로 위험요소 자체를 제거하는 것입니다.</p><button type="button" data-ready-retry>다시 풀기</button></aside></div></section>
          <section class="risk-l04-complete" data-ready-section="course-complete"><b>과정 완료</b><h2>Risk Assessment · 위험성평가 교육 완료</h2><ol>${['학습 01: 위험성평가의 정의와 위험요인 찾기(물리적/화학적 등)를 입체적으로 이해했습니다.','학습 02: 위험 가능성과 심각성의 조합(Matrix)에 의한 정량 판단 및 차단 대책 수립을 학습했습니다.','학습 03: 현장 TBM(Tool Box Meeting) 전파 실행과 5대 변경관리 변수(Trigger)를 확인했습니다.','학습 04: ONOFF Platform 내 Daily Safety 연동 및 매핑, Daily Risk Check의 명확한 차이를 구분했습니다.'].map(item=>`<li><span>✓</span>${item}</li>`).join('')}</ol></section>
          <nav class="risk-l04-bottom-nav" aria-label="학습 이동"><a href="#risk-assessment-stra">← 이전 학습</a><a href="#risk-course">학습 목록</a><a href="#risk-course" data-learning-complete="risk-assessment-platform">과정 완료 →</a></nav>
        </div>
      </article>`);

    document.querySelectorAll('.risk-ready-desktop-learning .ready-practice').forEach((root) => {
      root.querySelectorAll('[data-ready-choice]').forEach((button) => button.addEventListener('click', () => { root.querySelectorAll('[data-ready-choice]').forEach((choice)=>choice.classList.toggle('is-selected',choice===button)); root.querySelector('[data-ready-check]').disabled=false; }));
      root.querySelector('[data-ready-check]')?.addEventListener('click', () => { const selected=root.querySelector('[data-ready-choice].is-selected'); if(!selected)return; const correct=selected.dataset.readyChoice===root.dataset.readyAnswer; root.querySelectorAll('[data-ready-choice]').forEach((choice)=>{choice.disabled=true;choice.classList.remove('is-selected');choice.classList.toggle('is-correct',choice.dataset.readyChoice===root.dataset.readyAnswer);choice.classList.toggle('is-incorrect',choice===selected&&!correct);}); root.querySelector('[data-ready-check]').disabled=true; const result=root.querySelector(':scope > aside'); result.hidden=false; result.querySelector('strong').textContent=correct?'Correct':'Incorrect · Hint를 확인하고 다시 시도하세요.'; });
      root.querySelector('[data-ready-retry]')?.addEventListener('click', () => { root.querySelectorAll('[data-ready-choice]').forEach((choice)=>{choice.disabled=false;choice.classList.remove('is-selected','is-correct','is-incorrect');}); root.querySelector('[data-ready-check]').disabled=true; root.querySelector(':scope > aside').hidden=true; });
    });
  };

  const platformMobileChapters = [
    { id: 'philosophy', chapter: '01', status: '1/5', part: 'COURSE 01 · PLATFORM · 학습 01', title: 'ONOFF의 안전철학과 Platform 구조' },
    { id: 'workflow', chapter: '02', status: '1/4', part: 'COURSE 01 · PLATFORM · 학습 02', title: '오늘 작업과 Daily Safety' },
    { id: 'daily-work', chapter: '03', part: 'COURSE 01 · PLATFORM · 학습 03', title: 'Safety Start' },
    { id: 'safety-report', chapter: '04', status: '4/4', part: 'COURSE 01 · PLATFORM · 학습 04', title: '작업 중과 작업 종료' }
  ];
  const platformMobileToc = document.createElement('dialog');
  platformMobileToc.className = 'platform-mobile-toc';
  platformMobileToc.id = 'platform-mobile-toc';
  platformMobileToc.setAttribute('aria-labelledby', 'platform-mobile-toc-title');
  platformMobileToc.innerHTML = `
    <header><button type="button" data-platform-toc-close aria-label="목차 닫기">×</button><strong id="platform-mobile-toc-title">ONOFF Academy</strong><span>Table of Contents</span></header>
    <div class="platform-mobile-toc-list">
      <section><p>PART 01 · PLATFORM 이해</p>${platformMobileChapters.slice(0, 2).map((item) => `<a href="#${item.id}" data-platform-toc-chapter="${item.id}"><span>${item.chapter}</span><strong>${item.title}</strong><i aria-hidden="true">›</i></a>`).join('')}</section>
      <section><p>PART 02 · 작업 시작과 수행</p>${platformMobileChapters.slice(2).map((item) => `<a href="#${item.id}" data-platform-toc-chapter="${item.id}"><span>${item.chapter}</span><strong>${item.title}</strong><i aria-hidden="true">›</i></a>`).join('')}</section>
    </div>`;
  document.body.append(platformMobileToc);
  const mountPlatformMobileShell = () => platformMobileChapters.forEach((item) => {
    const chapter = document.getElementById(item.id);
    const start = chapter?.querySelector('.book-chapter-start');
    if (!chapter || !start || chapter.querySelector('.platform-mobile-header')) return;
    const header = document.createElement('header');
    header.className = 'platform-mobile-header';
    header.innerHTML = `<button type="button" data-platform-toc-open aria-label="Platform 목차 열기" aria-controls="platform-mobile-toc"><span aria-hidden="true"></span></button><strong>ONOFF Academy</strong><span>CH${item.chapter} · ${item.status || `${item.chapter}/04`}</span>`;
    header.querySelector('[data-platform-toc-open]').addEventListener('click', openPlatformMobileToc);
    start.insertAdjacentElement('beforebegin', header);
    const hero = document.createElement('header');
    hero.className = 'platform-mobile-route-hero';
    hero.innerHTML = `<div><strong>${item.chapter}</strong><span>${item.part}</span></div><h1>${item.title}</h1><p>${start.querySelector('span')?.textContent || ''}</p>`;
    header.insertAdjacentElement('afterend', hero);
  });
  const openPlatformMobileToc = () => {
    location.hash = 'platform-course';
  };
  const closePlatformMobileToc = () => {
    if (!platformMobileToc.open) return;
    platformMobileToc.close();
    document.body.classList.remove('is-platform-mobile-toc-open');
  };
  platformMobileToc.querySelector('[data-platform-toc-close]')?.addEventListener('click', closePlatformMobileToc);
  platformMobileToc.addEventListener('cancel', (event) => { event.preventDefault(); closePlatformMobileToc(); });
  platformMobileToc.addEventListener('click', (event) => { if (event.target === platformMobileToc) closePlatformMobileToc(); });
  platformMobileToc.querySelectorAll('a').forEach((link) => link.addEventListener('click', closePlatformMobileToc));

  const mobileChapterData = {
    philosophy: {
      number: '01', part: 'PART 01 · PLATFORM 이해', kicker: 'ONOFF SAFETY PLATFORM', title: 'ONOFF Safety Platform 이해', description: '안전자료를 보관하는 시스템을 넘어, 오늘의 작업과 필요한 안전을 연결합니다.', quote: '“서류 보관함을 넘어, 행동을 가이드하는 살아있는 안전 플랫폼”', progress: 20,
      sections: [
        { badge: 'LESSON 01', title: '왜 안전 플랫폼이 필요한가', lead: '자료의 양보다 연결의 실질성이 더 중요합니다.', body: ['안전자료가 없어서 사고가 발생하는 것은 아닙니다. 우리에겐 위험성평가도 있고, SOP도 있고, TBM도 하고, 법정 안전교육도 이수합니다.', '문제는 그 많은 안전정보와 복잡한 문서들이 오늘 내가 현장에서 직접 수행하는 작업과 긴밀하게 연결되어 있는가입니다.'], callout: '오늘 나는 무엇을 확인해야 하지?', note: '안전자료를 더 만드는 것이 아니라, 이미 존재하는 안전 정보를 필요한 순간에 연결합니다.' },
        { badge: 'OUR PHILOSOPHY', title: '우리가 생각하는 안전', body: ['안전은 보고서와 서류철을 완성하는 순간에 시작되는 정적인 상태가 아닙니다.', '작업자가 오늘의 작업을 알고, 위험을 확인하고, 필요한 절차를 이해한 뒤 작업을 시작할 때 비로소 안전은 현장에서 작동합니다.'], note: '기록을 위한 안전에서, 행동으로 이어지는 안전으로.' },
        { badge: 'WHY ONOFF', title: '왜 ONOFF 인가', dark: true, body: ['작업에는 명확한 시작과 끝이 있습니다. 하지만 안전은 작업 개시 버튼을 누르는 순간 갑자기 생겨나는 것이 아닙니다.', '작업을 ON 하기 전에 안전이 먼저 ON 되어야 하고, 작업을 OFF 하기 전에는 놓친 위험이 없는지 재확인합니다.'], steps: [['SAFETY ON','작업 전 실질적인 안전확인 완료'],['WORK ON','안전이 확보된 상태에서 작업 개시'],['WORK OFF','정상 종료 후 잔여 위험 요소 정리'],['SAFETY RECORD','현장의 안전활동이 플랫폼에 기록']] },
        { badge: 'LESSON 02', title: '현장을 움직이는 역할', lead: 'Role은 책임을, Mode는 지금 하려는 행동을 정의합니다.', cards: [['W','WORKER (작업자)','자신과 동료를 위한 필수 안전활동을 수행합니다.'],['S','SUPERVISOR (관리감독자)','작업과 안전 운영을 관리합니다.'],['A','ADMINISTRATOR (시스템 관리자)','전체 플랫폼 운영 환경과 기준 정보를 통제합니다.']], note: 'Role은 책임을 정의하고, Mode는 지금 하려는 행동을 정의합니다.' },
        { badge: 'ONOFF SAFETY ECOSYSTEM', title: 'ONOFF 안전 생태계 전체 구조', lead: '실질적 플랫폼 행동과 이론 지식의 입체적인 통합', cards: [['01','SAFETY PLATFORM','Daily Safety · Project & Work · Safety Start · Electronic Documents · Safety Report'],['02','ONOFF ACADEMY','Platform · TBM · SOP · 위험성평가 · 특별안전교육 · 설비안전 · 비상대응 · 사고사례']], note: '알고 하는 안전 → 확인하고 하는 안전 → 기록으로 남는 안전' }
      ],
      complete: ['안전자료의 목적은 오늘 작업에 필요한 순간 정확한 행동을 안내하는 것입니다.','작업을 ON 하기 전에 안전이 먼저 ON 되어 있어야 합니다.','Platform은 행동을 연결하고 Academy는 그 이유와 지식을 연결합니다.'],
      nav: [['toc','학습 목록'],['workflow','학습 02 오늘 작업 →']]
    },
    workflow: {
      number: '02', part: 'PART 02 · 작업 시작', kicker: '오늘 작업과 Daily Safety', title: '오늘 수행할 작업을 선택하고, 그 작업에 필요한 위험과 안전정보를 확인합니다.', quote: '“올바른 작업 선택이 모든 실질적 안전의 첫 걸음입니다.”', progress: 25,
      sections: [
        { badge: 'LESSON 01', title: '오늘 작업을 먼저 선택합니다', body: ['ONOFF는 로그인했다고 바로 작업을 시작하지 않습니다. 먼저 오늘 수행할 작업을 선택합니다.','안전정보는 모든 작업에 동일하게 적용되지 않습니다. 오늘 어떤 Project에서 어떤 작업을 수행하는지에 따라 확인해야 할 위험과 절차가 달라집니다.'], note: '작업을 선택하는 것은 오늘의 안전정보를 연결하는 첫 단계입니다.', steps: [['사용자 로그인',''],['오늘 작업 선택',''],['작업 전 최소 안전확인',''],['Safety Start','']], cards: [['✓','위험성평가','작업에 연결된 위험과 대책을 제공합니다.'],['✓','SOP','기기 및 설비의 안전한 작업 절차를 확인합니다.'],['✓','TBM','작업 전 함께 확인할 핵심사항을 연결합니다.']] },
        { badge: 'LESSON 02', title: '어떤 작업을 선택할까요?', body: ['오늘 수행할 작업의 Project, 위치, 설비와 작업 상태가 실제 현장과 일치하는지 확인합니다.'], cards: [['01','배정된 작업','오늘 수행하도록 배정된 작업인지 확인합니다.'],['02','수행 가능한 상태','현재 시작할 수 있는 상태인지 확인합니다.']] },
        { badge: 'LESSON 03', title: '작업 전 최소 안전확인', body: ['작업을 시작하기 전에 보호구와 현장 조건, 연결된 안전자료를 직접 확인합니다.'], steps: [['보호구 확인',''],['작업조건 확인',''],['필수 안전자료 확인',''],['이상 없음 확인','']] },
        { badge: 'LESSON 04', title: '안전자료는 어떻게 연결되나요?', body: ['선택한 작업을 기준으로 위험성평가, SOP, TBM 등 필요한 안전지식이 연결됩니다.'], cards: [['01','작업 정보','오늘의 작업과 현장 조건'],['02','안전 지식','위험성평가 · SOP · TBM'],['03','작업 행동','확인 후 Safety Start']] },
        { badge: 'LEARNING FLOW', title: 'CH02 · 오늘 작업과 Daily Safety', steps: [['오늘 작업 선택',''],['작업 정보 확인',''],['필요한 안전지식 연결',''],['작업 전 최소 안전확인',''],['CH03 Safety Start로 이동','']] }
      ],
      practice: { question: 'Q. 오늘 작업을 먼저 선택하는 가장 중요한 이유는 무엇일까요?', answer: 'B', choices: [['A','작업시간을 자동 계산하기 위해'],['B','작업에 맞는 위험과 안전정보를 연결하기 위해'],['C','관리자에게 출근을 알리기 위해'],['D','모든 작업에 같은 문서를 적용하기 위해']] },
      complete: ['오늘 수행할 작업을 먼저 정확하게 선택합니다.','선택한 작업에 따라 필요한 위험과 안전정보가 연결됩니다.','작업 전 최소 안전확인을 완료한 뒤 Safety Start로 이동합니다.'],
      nav: [['philosophy','← 학습 01 Platform'],['toc','학습 목록'],['daily-work','학습 03 Safety Start →']]
    },
    'safety-report': {
      number: '04', part: 'PART 02 · 작업 수행', kicker: 'SAFETY ACTIVE', title: '작업 중과 작업 종료', description: 'Safety Start 이후에도 필요한 안전 행동을 이어가고, 작업 종료 전 마지막 안전상태를 확인합니다.', quote: '“작업 종료 전까지 안전확인은 계속됩니다.”', progress: 80,
      sections: [
        { badge: 'WORK ON', title: 'Safety Start 이후 실제 작업', body: ['Safety Start가 완료되면 승인된 범위 안에서 실제 작업을 시작합니다. 작업 중 조건이 달라지면 그대로 진행하지 않습니다.'], mock: 'ACTIVE WORK · 작업 진행 중', cards: [['01','안전자료 확인','필요할 때 연결된 안전자료를 다시 확인합니다.'],['02','위험 신고','새로운 위험을 발견하면 즉시 알립니다.'],['03','작업 중지','안전하지 않으면 작업을 멈춥니다.']] },
        { badge: 'DURING WORK', title: '작업 중에도 안전은 계속됩니다', body: ['작업을 시작했다고 안전확인이 끝나는 것은 아닙니다. 작업 중 상황은 언제든 달라질 수 있습니다.'], steps: [['SAFETY START',''],['작업 진행 중',''],['작업 종료 시작',''],['작업 종료 전 최종 확인',''],['Safety Report 분기','이슈 유무에 따라 작성 여부 판단'],['작업 완전히 종료 처리','']] },
        { badge: 'CONNECTION', title: '작업 중지는 권리와 의무의 연장입니다', body: ['작업 전에는 안전하지 않은 작업을 시작하지 않을 권리와 의무를 확인하고, 작업 중에는 위험해졌을 때 작업 중지라는 행동으로 이어집니다.'], note: '위험하거나 안전하지 않은 상황에서는 작업 중지를 선택할 수 있습니다.' },
        { badge: 'END WORK', title: '작업 종료도 확인 없이 끝내지 않습니다', body: ['작업을 마쳤다고 바로 종료 처리하지 않습니다. 현재 작업 상태와 주변 안전상태를 한 번 더 확인합니다.'], note: '시작 전에 확인하고, 완전히 끝나기 전 다시 한번 확인합니다.', mock: 'CLOSE-OUT CHECK · 작업 종료 전 확인', cards: [['01','작업 종료 전 필수 확인','마지막 안전상태를 직접 확인합니다.'],['02','예/아니오로 직접 확인','각 질문에 적극적으로 답변합니다.'],['03','확인 완료 후 종료','필요한 확인 뒤 종료 Flow를 완료합니다.']] },
        { badge: 'MEANING', title: '작업 종료 전 확인의 의미', body: ['작업자를 평가하거나 새 문서를 만들기 위한 절차가 아닙니다. 작업을 끝내기 전에 문제가 남아 있지 않은지 마지막으로 확인하는 과정입니다.'] },
        { badge: 'BRANCH', title: 'Safety Report가 필요한 경우', body: ['작업 종료 전 확인 결과 추가로 기록할 안전사항이 있는 경우 Safety Report 작성 Flow로 이어질 수 있습니다.'], note: 'Safety Report는 모든 작업자가 매번 작성하는 보고서가 아니라, 남겨야 할 안전사항이 있을 때 기록하는 Flow입니다.' },
        { badge: 'COMPLETE', title: '오늘의 안전활동을 마무리합니다', lead: '안전은 작업의 시작부터 끝까지 이어집니다.', dark: true, steps: [['BEFORE','작업 시작 전 안전확인'],['WORK','Safety Start 후 실제 작업 시작'],['DURING','작업 중 필요한 안전 행동'],['END','작업 종료 전 확인'],['REPORT','선택적 Safety Report 이력 보존'],['COMPLETE','작업 종료']] }
      ],
      practice: { question: 'Q. ONOFF에서 작업 종료 전에 다시 안전상태를 확인하는 가장 중요한 이유는 무엇일까요?', answer: 'B', choices: [['A','작업시간을 계산하기 위해'],['B','작업이 끝난 뒤 문제가 남아 있지 않은지 마지막으로 확인하기 위해'],['C','관리자가 작업자를 평가하기 위해'],['D','다음 작업을 자동 배정하기 위해']] },
      complete: ['Safety Start 이후에도 안전활동은 계속됩니다.','작업 중에는 안전자료 확인, 위험 신고, 작업 중지로 이어질 수 있습니다.','작업 종료 전에는 마지막 안전상태를 다시 확인합니다.','특이 사항이 있으면 Safety Report를 남깁니다.'],
      nav: [['daily-work','← CH03 Safety Start'],['home','다음 코스 가기 →']]
    }
  };

  const renderProductMock = (label) => label.startsWith('CLOSE-OUT')
    ? `<div class="platform-figma-product"><small>● ${label}</small><p><b>Q1</b><span>작업 도구 및 가설재 정리를 완료했습니까?</span><i>예</i></p><p><b>Q2</b><span>현장 주변 정리정돈 상태가 양호합니까?</span><i>예</i></p><p><b>Q3</b><span>안전조치 원상복구를 확인했습니까?</span><i>예</i></p><button type="button" disabled>정리 확인 및 종료하기</button></div>`
    : `<div class="platform-figma-product"><small>● ${label}</small><p><b>ACTIVE</b><span>오늘 작업이 진행 중입니다.</span><i>ON</i></p><p><b>SAFETY</b><span>필요한 안전 행동을 선택합니다.</span><i>확인</i></p><div><button type="button" disabled>위험 신고</button><button type="button" disabled>작업 중지</button></div></div>`;
  const renderMobileChapterSection = (section) => `<section class="platform-figma-section${section.dark ? ' is-dark' : ''}"><b>${section.badge}</b><h2>${section.title}</h2>${section.lead ? `<p class="platform-figma-lead">${section.lead}</p>` : ''}${(section.body || []).map((text) => `<p>${text}</p>`).join('')}${section.callout ? `<blockquote>${section.callout}</blockquote>` : ''}${section.mock ? renderProductMock(section.mock) : ''}${section.steps ? `<ol class="platform-figma-steps">${section.steps.map(([title, detail], index) => `<li><span>${String(index + 1).padStart(2,'0')}</span><div><strong>${title}</strong>${detail ? `<small>${detail}</small>` : ''}</div></li>`).join('')}</ol>` : ''}${section.cards ? `<div class="platform-figma-cards">${section.cards.map(([mark,title,text]) => `<article><span>${mark}</span><div><strong>${title}</strong><p>${text}</p></div></article>`).join('')}</div>` : ''}${section.note ? `<aside><small>KEY INSIGHT</small><strong>${section.note}</strong></aside>` : ''}</section>`;
  const mountFigmaMobileChapter = (chapterId, data) => {
    const chapter = document.getElementById(chapterId);
    if (!chapter || chapter.querySelector('.platform-figma-mobile-chapter')) return;
    const practice = data.practice ? `<section class="platform-figma-section platform-figma-practice" data-answer="${data.practice.answer}"><b>PRACTICE</b><h2>학습 확인</h2><p class="platform-figma-question">${data.practice.question}</p><div>${data.practice.choices.map(([value,label]) => `<button type="button" data-figma-answer="${value}"><span>${value}</span>${label}</button>`).join('')}</div><button type="button" data-figma-check disabled>정답 확인</button><aside hidden aria-live="polite"><strong></strong><p>정답: ${data.practice.answer}</p><button type="button" data-figma-retry>다시 풀기</button></aside></section>` : '';
    const nav = `<nav class="platform-figma-navigation" aria-label="학습 이동">${data.nav.map(([route,label]) => route === 'toc' ? `<button type="button" data-platform-toc-open>학습 목록</button>` : `<a href="#${route}">${label}</a>`).join('')}</nav>`;
    chapter.insertAdjacentHTML('beforeend', `<article class="platform-figma-mobile-chapter" data-figma-source="${chapterId === 'philosophy' ? '160:4' : chapterId === 'workflow' ? '160:206' : '160:451'}"><header class="platform-figma-hero"><div><strong>${data.number}</strong><span>COURSE 01 · PLATFORM · 학습 ${data.number}</span></div><p>${data.kicker}</p><h1>${data.title}</h1>${data.description ? `<span>${data.description}</span>` : ''}<blockquote>${data.quote}</blockquote><div class="platform-figma-progress"><span>진행률 ${data.progress}%</span><span>학습 ${data.number} / 04</span><i style="--progress:${data.progress}%"></i></div></header>${data.sections.map(renderMobileChapterSection).join('')}${practice}<section class="platform-figma-complete"><b>LEARNING COMPLETE · 학습 ${data.number}</b><h2>학습 ${data.number} · 완료</h2><ol>${data.complete.map((item) => `<li>${item}</li>`).join('')}</ol><button type="button" data-learning-complete="${chapterId}">학습 완료</button></section>${nav}</article>`);
    chapter.querySelectorAll('.platform-figma-mobile-chapter [data-platform-toc-open]').forEach((button) => button.addEventListener('click', openPlatformMobileToc));
    const practiceRoot = chapter.querySelector('.platform-figma-practice');
    practiceRoot?.querySelectorAll('[data-figma-answer]').forEach((button) => button.addEventListener('click', () => {
      practiceRoot.querySelectorAll('[data-figma-answer]').forEach((choice) => choice.classList.toggle('is-selected', choice === button));
      practiceRoot.querySelector('[data-figma-check]').disabled = false;
    }));
    practiceRoot?.querySelector('[data-figma-check]')?.addEventListener('click', () => {
      const selected = practiceRoot.querySelector('[data-figma-answer].is-selected');
      if (!selected) return;
      const correct = selected.dataset.figmaAnswer === practiceRoot.dataset.answer;
      practiceRoot.querySelectorAll('[data-figma-answer]').forEach((choice) => { choice.disabled = true; choice.classList.remove('is-selected'); choice.classList.toggle('is-correct', choice.dataset.figmaAnswer === practiceRoot.dataset.answer); choice.classList.toggle('is-incorrect', choice === selected && !correct); });
      practiceRoot.querySelector('[data-figma-check]').disabled = true;
      const result = practiceRoot.querySelector(':scope > aside'); result.hidden = false; result.querySelector(':scope > strong').textContent = correct ? 'Correct' : 'Incorrect';
    });
    practiceRoot?.querySelector('[data-figma-retry]')?.addEventListener('click', () => { practiceRoot.querySelectorAll('[data-figma-answer]').forEach((choice) => { choice.disabled = false; choice.classList.remove('is-selected','is-correct','is-incorrect'); }); practiceRoot.querySelector('[data-figma-check]').disabled = true; practiceRoot.querySelector(':scope > aside').hidden = true; });
  };
  const workflowChapter = document.getElementById('workflow');
  const workflowChapterStart = workflowChapter?.querySelector('.book-chapter-start');
  if (workflowChapter && workflowChapterStart) {
    [...workflowChapter.children].forEach((child) => {
      if (child !== workflowChapterStart) child.remove();
    });
    workflowChapter.insertAdjacentHTML('beforeend', `
      <section class="chapter-block workflow-summary-lesson" aria-labelledby="workflow-summary-title">
        <header class="chapter-block-heading"><span>01</span><div><h3 id="workflow-summary-title">Workflow Summary</h3><p>작업 준비부터 완료까지 이어지는 9단계를 한눈에 이해합니다.</p></div></header>
        <div class="prose"><h3>WHY</h3><p>ONOFF Workflow는 각각의 기능을 따로 사용하는 절차가 아닙니다. 앞 단계의 확인 결과가 다음 단계로 연결되어 누락 없이 안전한 작업을 시작하고 완료하도록 돕는 하나의 흐름입니다.</p></div>
        <figure class="image-block platform-summary"><img src="assets/platform/chapter-02-workflow-summary.png" alt="작업 정의부터 작업 완료까지 연결되는 ONOFF 9단계 Workflow Summary"></figure>
        <ol class="standard-workflow" aria-label="ONOFF Platform 9단계 Workflow">
          <li><span class="flow-index">01</span><strong>작업 정의</strong><small>작업 내용과 범위를 명확히 정합니다.</small></li><li><span class="flow-index">02</span><strong>안전 승인</strong><small>안전 조건과 준비 상태를 확인합니다.</small></li><li><span class="flow-index">03</span><strong>전자문서 자동 호출</strong><small>작업에 필요한 문서를 연결합니다.</small></li><li><span class="flow-index">04</span><strong>전자문서 확인</strong><small>필수 안전사항을 빠짐없이 확인합니다.</small></li><li><span class="flow-index">05</span><strong>전자서명</strong><small>확인 완료 사실을 기록합니다.</small></li><li><span class="flow-index">06</span><strong>Safety Start</strong><small>최종 안전 상태를 확인합니다.</small></li><li><span class="flow-index">07</span><strong>작업 수행</strong><small>승인된 범위에서 작업합니다.</small></li><li><span class="flow-index">08</span><strong>Safety Report</strong><small>위험과 개선사항을 기록합니다.</small></li><li><span class="flow-index">09</span><strong>작업 완료</strong><small>결과를 확인하고 작업을 종료합니다.</small></li>
        </ol>
        <ul class="check-list"><li>단계는 순서대로 진행하며 이전 단계가 완료되어야 다음 단계로 이동합니다.</li><li>역할과 권한에 따라 표시되는 Action은 달라도 Workflow 순서는 동일합니다.</li><li>모든 기록은 작업 상태와 연결되어 완료 시점까지 추적됩니다.</li></ul>
        <aside class="callout tip"><strong>TIP</strong><p>화면의 메뉴보다 현재 Workflow 단계와 Primary Action을 먼저 확인하세요. 지금 해야 할 행동이 다음 단계로 이어지는 기준입니다.</p></aside>
      </section>
      <section class="chapter-block workflow-preparation-lesson" aria-labelledby="workflow-preparation-title"><header class="chapter-block-heading"><span>GROUP 01</span><div><h3 id="workflow-preparation-title">준비 단계</h3><p>작업 정의부터 전자문서 자동 호출까지 준비 기준을 확인합니다.</p></div></header><div class="prose"><h3>WHY</h3><p>작업을 시작하기 전에 무엇을, 어디에서, 누가 수행하는지 확정해야 안전 승인과 필수 문서가 정확하게 연결됩니다. 준비 정보가 틀리면 이후 확인 절차도 실제 현장과 달라질 수 있습니다.</p></div><ol class="step-list horizontal" aria-label="GROUP 01 준비 단계"><li><b>작업 정의</b><span>작업 범위, 장소, 담당자와 수행 조건을 명확히 합니다.</span></li><li><b>안전 승인</b><span>위험요인과 안전조치를 검토하고 수행 가능 상태를 승인합니다.</span></li><li><b>전자문서 자동 호출</b><span>승인된 작업 정보에 따라 필요한 문서를 자동으로 연결합니다.</span></li></ol><h3>CHECK POINT</h3><ul class="check-list"><li>작업 범위와 실제 현장이 일치하는지 확인합니다.</li><li>안전 승인이 완료되기 전에는 작업을 시작하지 않습니다.</li><li>작업 유형에 필요한 TBM, SOP, 위험성평가 등이 모두 연결되었는지 확인합니다.</li></ul><div class="prose"><h3>현장 설명</h3><p>현장에서는 작업명이 비슷해도 위치나 설비가 다르면 위험요인과 필수 문서가 달라집니다. 오늘 수행할 작업 정보가 정확한지 먼저 확인해야 합니다.</p></div><aside class="callout tip"><strong>TIP</strong><p>자동 호출된 문서가 실제 작업과 다르면 임의로 진행하지 말고 Supervisor에게 작업 정보와 승인 상태를 다시 확인합니다.</p></aside></section>
      <section class="chapter-block workflow-confirmation-lesson" aria-labelledby="workflow-confirmation-title"><header class="chapter-block-heading"><span>GROUP 02</span><div><h3 id="workflow-confirmation-title">확인 단계</h3><p>전자문서 확인부터 Safety Start까지 시작 조건을 완성합니다.</p></div></header><div class="prose"><h3>WHY</h3><p>전자문서 확인과 전자서명은 형식적인 기록이 아니라 작업자가 위험요인과 안전조치를 이해했다는 증거입니다. 모든 확인이 완료되어야 Safety Start로 이동할 수 있습니다.</p></div><ol class="step-list horizontal" aria-label="GROUP 02 확인 단계"><li><b>전자문서 확인</b><span>TBM, SOP, 위험성평가 등 모든 필수 항목을 확인합니다.</span></li><li><b>전자서명</b><span>내용을 이해한 작업자가 본인의 확인을 기록합니다.</span></li><li><b>Safety Start</b><span>보호구, 비상연락, 작업조건을 최종 확인하고 시작합니다.</span></li></ol><h3>CHECK POINT</h3><ul class="check-list"><li>모든 필수 문서를 끝까지 확인합니다.</li><li>서명은 본인이 직접 수행하며 대리 서명하지 않습니다.</li><li>보호구와 현장 조건이 확인 내용과 일치하는지 점검합니다.</li></ul><div class="prose"><h3>현장 설명</h3><p>작업이 급하거나 반복 작업이라는 이유로 확인 단계를 생략하면 변경된 위험을 놓칠 수 있습니다. 설비나 작업 조건이 바뀌었다면 처음부터 다시 확인합니다.</p></div><aside class="callout tip"><strong>TIP</strong><p>이해하기 어려운 항목은 넘어가지 말고 Supervisor에게 문의한 뒤 확인과 서명을 완료하세요.</p></aside></section>
      <section class="chapter-block workflow-execution-lesson" aria-labelledby="workflow-execution-title"><header class="chapter-block-heading"><span>GROUP 03</span><div><h3 id="workflow-execution-title">실행 및 완료 단계</h3><p>작업 수행부터 Safety Report와 작업 완료까지 결과를 기록합니다.</p></div></header><div class="prose"><h3>WHY</h3><p>안전한 수행과 정확한 종료 기록은 다음 작업의 안전 기준이 됩니다. 작업 중 발생한 Event와 개선사항을 남겨야 같은 위험의 반복을 예방할 수 있습니다.</p></div><ol class="step-list horizontal" aria-label="GROUP 03 실행 및 완료 단계"><li><b>작업 수행</b><span>승인 범위와 안전수칙을 지키며 작업을 진행합니다.</span></li><li><b>Safety Report</b><span>사고, Near Miss, 위험제보와 개선사항을 즉시 기록합니다.</span></li><li><b>작업 완료</b><span>결과와 특이사항을 확인하고 종료 상태로 전환합니다.</span></li></ol><h3>CHECK POINT</h3><ul class="check-list"><li>작업 중 조건이 달라지면 멈추고 다시 확인합니다.</li><li>작은 이상이나 Near Miss도 Safety Report에 기록합니다.</li><li>잔류 위험과 현장 정리 상태를 확인한 뒤 작업을 완료합니다.</li></ul><div class="prose"><h3>현장 설명</h3><p>완료 버튼을 먼저 누르고 결과를 나중에 기록하면 실제 작업 이력과 시스템 상태가 달라집니다. 현장 확인과 필요한 보고를 모두 마친 뒤 종료해야 합니다.</p></div><aside class="callout tip"><strong>TIP</strong><p>특이사항이 있다면 작업 완료 전에 Safety Report로 연결하고, 처리에 필요한 정보를 구체적으로 남기세요.</p></aside></section>`);
  }
  [
    ['.workflow-preparation-lesson', 'LESSON 02', 'GROUP 01 · 작업 정의부터 전자문서 자동 호출까지 준비 기준을 확인합니다.'],
    ['.workflow-confirmation-lesson', 'LESSON 03', 'GROUP 02 · 전자문서 확인부터 Safety Start까지 시작 조건을 완성합니다.'],
    ['.workflow-execution-lesson', 'LESSON 04', 'GROUP 03 · 작업 수행부터 Safety Report와 작업 완료까지 결과를 기록합니다.']
  ].forEach(([selector, lessonLabel, description]) => {
    const lessonPage = workflowChapter?.querySelector(selector);
    if (!lessonPage) return;
    lessonPage.hidden = true;
    const heading = lessonPage.querySelector(':scope > .chapter-block-heading');
    if (heading) {
      heading.querySelector(':scope > span').textContent = lessonLabel;
      heading.querySelector('p').textContent = description;
    }
  });
  const workflowSummaryHeading = workflowChapter?.querySelector('.workflow-summary-lesson > .chapter-block-heading');
  if (workflowSummaryHeading) workflowSummaryHeading.querySelector(':scope > span').textContent = 'LESSON 01';
  const workflowSummaryPage = workflowChapter?.querySelector('.workflow-summary-lesson');
  if (workflowSummaryPage) {
    workflowSummaryPage.id = 'workflow-summary';
    workflowSummaryPage.classList.add('tbm-scenario-lesson');
    workflowSummaryPage.querySelector('.standard-workflow')?.remove();
    const summaryCheckList = workflowSummaryPage.querySelector('.check-list');
    const summaryFigure = workflowSummaryPage.querySelector('.platform-summary');
    const summaryProse = workflowSummaryPage.querySelector('.prose');
    const summaryImage = summaryFigure?.querySelector('img');
    if (summaryImage) {
      summaryImage.src = 'assets/platform/chapter-02/page-01-workflow-summary.png';
      summaryImage.alt = 'S자 흐름으로 작업 정의부터 작업 완료까지 연결되는 9단계 Workflow Summary';
    }
    if (summaryProse && summaryCheckList) {
      summaryProse.insertAdjacentHTML('beforeend', '<h3>CHECK POINT</h3>');
      summaryProse.append(summaryCheckList);
    }
    if (summaryFigure && summaryProse) summaryProse.insertAdjacentElement('beforebegin', summaryFigure);
  }
  [
    ['.workflow-preparation-lesson', 'workflow-preparation', 'assets/platform/chapter-02/page-02-preparation.png', 'GROUP 01 준비 단계: 작업 정의, 안전 승인, 전자문서 자동 호출'],
    ['.workflow-confirmation-lesson', 'workflow-confirmation', 'assets/platform/chapter-02/page-03-confirmation.png', 'GROUP 02 확인 단계: 전자문서 확인, 전자서명, Safety Start'],
    ['.workflow-execution-lesson', 'workflow-execution', 'assets/platform/chapter-02/page-04-execution.png', 'GROUP 03 실행 및 완료 단계: 작업 수행, Safety Report, 작업 완료']
  ].forEach(([selector, pageId, imageSource, imageAlt]) => {
    const page = workflowChapter?.querySelector(selector);
    if (!page) return;
    page.id = pageId;
    page.classList.add('tbm-scenario-lesson');
    const header = page.querySelector(':scope > .chapter-block-heading');
    const why = page.querySelector(':scope > .prose');
    const workflowVisual = page.querySelector(':scope > .step-list');
    const checkTitle = page.querySelector(':scope > h3');
    const checkList = page.querySelector(':scope > .check-list');
    const fieldExplanation = page.querySelectorAll(':scope > .prose')[1];
    const tip = page.querySelector(':scope > .callout');
    if (workflowVisual) {
      const figure = document.createElement('figure');
      figure.className = 'tbm-scenario-photo workflow-group-visual';
      workflowVisual.insertAdjacentElement('beforebegin', figure);
      figure.innerHTML = `<img src="${imageSource}" alt="${imageAlt}" loading="lazy">`;
      workflowVisual.remove();
    }
    if (why) {
      if (checkTitle) why.append(checkTitle);
      if (checkList) why.append(checkList);
      if (fieldExplanation) {
        [...fieldExplanation.children].forEach((child) => why.append(child));
        fieldExplanation.remove();
      }
    }
    [header, page.querySelector(':scope > .tbm-scenario-photo'), why, tip].forEach((block) => {
      if (block) page.append(block);
    });
  });
  const dailyWorkChapter = document.getElementById('daily-work');
  const dailyWorkChapterStart = dailyWorkChapter?.querySelector('.book-chapter-start');
  if (dailyWorkChapter && dailyWorkChapterStart) {
    [...dailyWorkChapter.children].forEach((child) => {
      if (child !== dailyWorkChapterStart) child.remove();
    });
    const dailyWorkPages = [
      { id: 'daily-work-summary', number: '01', title: 'Worker Workflow Summary', description: "Today's Work에서 Safety Start까지 전체 흐름을 한눈에 확인합니다.", image: 'assets/platform/chapter-03/page-01-summary.png', alt: "오늘 작업 선택, 안전 확인, 전자서명, Safety Start, 작업 시작으로 이어지는 Worker Workflow Summary", why: "Today's Work는 작업자가 오늘 수행할 작업을 선택하고 필요한 안전 절차를 순서대로 완료하도록 안내하는 시작점입니다.", explanation: '전체 흐름을 먼저 이해하면 현재 단계와 다음 Action을 놓치지 않고 안전하게 작업을 시작할 수 있습니다.', checks: ['오늘 수행할 작업과 작업 상태를 확인합니다.', '전자문서 확인과 전자서명이 완료되어야 다음 단계로 이동합니다.', '안전 준비가 완료된 뒤에만 작업을 시작합니다.'], field: '현장에서는 화면의 메뉴보다 현재 Workflow 단계와 다음 Action을 먼저 확인합니다.', tip: '각 단계의 완료 기록은 다음 단계의 시작 조건이므로 순서를 건너뛰지 않습니다.' },
      { id: 'daily-work-selection', number: '02', title: '오늘 작업 선택', description: '오늘 수행할 작업을 선택하고 작업 정보를 확인합니다.', image: 'assets/platform/chapter-03/page-02-todays-work.png', alt: "Today's Work 목록에서 ACTIVE 작업을 선택하고 상세 정보를 확인하는 화면", why: '작업 장소와 내용이 정확해야 이후 호출되는 전자문서와 안전 절차가 실제 현장 조건에 맞게 연결됩니다.', explanation: '배정된 ACTIVE 작업을 선택한 뒤 작업명, 장소, 담당자, 요청 일시와 상태를 확인합니다.', checks: ['작업명과 작업 위치가 실제 수행 대상과 일치하는지 확인합니다.', '작업 상태가 수행 가능한 ACTIVE인지 확인합니다.', '담당자와 요청 일시 등 기본 정보를 확인합니다.'], field: '비슷한 작업명이 여러 개라면 위치와 설비 정보를 기준으로 정확한 작업을 선택합니다.', tip: '작업 정보가 다르면 다음 단계로 이동하지 말고 Supervisor에게 확인합니다.' },
      { id: 'daily-work-safety-check', number: '03', title: '안전 확인', description: '자동으로 제공된 필수 전자문서의 내용을 확인합니다.', image: 'assets/platform/chapter-03/page-03-safety-check.png', alt: 'TBM, SOP, 위험성평가 등 자동 제공된 전자문서 목록과 상세 확인 화면', why: '전자문서는 작업자가 오늘 작업의 위험요인과 안전조치를 이해하도록 제공되는 필수 확인 자료입니다.', explanation: 'TBM, SOP, 위험성평가 등 작업 조건에 따라 자동 호출된 문서를 하나씩 열어 내용을 확인합니다.', checks: ['모든 필수 문서가 확인 완료 상태인지 확인합니다.', '작업 위험요인과 안전조치를 실제 현장과 비교합니다.', '이해하지 못한 내용은 확인 처리하지 않습니다.'], field: '반복 작업이라도 작업 조건과 문서 내용은 변경될 수 있으므로 매 작업마다 다시 확인합니다.', tip: '문서 내용이 현장과 다르면 Supervisor에게 알리고 수정된 기준을 확인합니다.' },
      { id: 'daily-work-signature', number: '04', title: '전자서명', description: '모든 문서를 확인한 뒤 본인이 직접 전자서명합니다.', image: 'assets/platform/chapter-03/page-04-signature.png', alt: '필수 문서 확인 완료 후 작업자가 직접 전자서명하는 화면', why: '전자서명은 필수 안전사항을 이해하고 확인했다는 작업자 본인의 기록입니다.', explanation: '확인 대상 문서가 모두 완료되면 서명 화면에서 본인이 직접 서명하고 저장합니다.', checks: ['모든 필수 문서가 확인 완료 상태인지 확인합니다.', '서명자 정보가 로그인 사용자와 일치하는지 확인합니다.', '대리 서명이나 미리 작성한 서명을 사용하지 않습니다.'], field: '서명 후에는 확인 내용과 시간이 작업 기록에 남으므로 내용을 충분히 이해한 뒤 진행합니다.', tip: '서명 전 마지막으로 작업명과 필수 문서 목록을 다시 확인합니다.' },
      { id: 'daily-work-safety-start', number: '05', title: 'Safety Start', description: '안전 준비 완료 상태를 확인하고 작업을 시작합니다.', image: 'assets/platform/chapter-03/page-05-safety-start.png', alt: '안전 준비 완료 후 Safety Start로 작업을 시작하는 화면', why: 'Safety Start는 문서 확인과 서명이 모두 완료된 작업만 실제 수행 단계로 전환하는 최종 안전 확인입니다.', explanation: '작업명, 장소, 작업자와 시작 시간을 확인하고 현장 준비 상태에 이상이 없을 때 작업을 시작합니다.', checks: ['보호구와 작업 구역의 안전 상태를 최종 확인합니다.', '작업 정보와 실제 수행 대상이 일치하는지 확인합니다.', '이상이 있으면 시작하지 않고 Supervisor에게 보고합니다.'], field: 'Safety Start 이후에는 승인된 작업 범위와 안전수칙을 준수하며 작업을 수행합니다.', tip: '작업 완료 후에는 반드시 종료 절차와 필요한 Safety Report를 수행합니다.' }
    ];
    dailyWorkPages.forEach((page, index) => {
      dailyWorkChapter.insertAdjacentHTML('beforeend', `<section class="chapter-block tbm-scenario-lesson daily-work-lesson" id="${page.id}" aria-labelledby="${page.id}-title"${index ? ' hidden' : ''}><header class="chapter-block-heading"><span>PAGE ${page.number}</span><div><h3 id="${page.id}-title">${page.title}</h3><p>${page.description}</p></div></header><figure class="tbm-scenario-photo daily-work-photo"><img src="${page.image}" alt="${page.alt}"${index ? ' loading="lazy"' : ''}></figure><div class="prose"><h3>WHY</h3><p>${page.why}</p><p>${page.explanation}</p><h3>CHECK POINT</h3><ul>${page.checks.map((item) => `<li>${item}</li>`).join('')}</ul><h3>현장 적용</h3><p>${page.field}</p></div><aside class="callout tip"><strong>TIP</strong><p>${page.tip}</p></aside></section>`);
    });

    const mobileWorkflow = [
      '오늘 작업 선택',
      '작업 시작',
      '교육 및 회의 참가 확인',
      '권리와 의무 확인',
      '작업 전 안전확인',
      '전자서명',
      'SAFETY START',
      '실제 작업 시작'
    ];
    const mobileLearningUnits = [
      {
        number: '01',
        title: '교육 및 권리 확인',
        description: '교육 및 회의 참가 여부를 확인하고, 작업자의 권리와 의무를 확인합니다.',
        image: 'assets/platform/chapter-03/mobile-unit-01.png',
        alt: '교육 및 회의 참가 확인과 권리와 의무 확인 화면',
        points: [
          ['교육 및 회의 참가 확인', '오늘 작업과 관련된 교육 또는 회의 참가 여부를 확인합니다.'],
          ['권리와 의무', '안전하게 일할 권리와 작업자가 지켜야 할 의무를 확인합니다.']
        ]
      },
      {
        number: '02',
        title: '작업 전 안전확인',
        description: '작업을 시작하기 전에 다섯 가지 안전사항을 직접 확인합니다.',
        image: 'assets/platform/chapter-03/mobile-unit-02.png',
        alt: '보호구, 오늘의 주의사항, 작업 준비, 작업 수행상태, 주요 위험요인을 확인하는 작업 전 안전확인 화면',
        points: [
          ['5개 안전확인', '보호구, 오늘의 주의사항, 작업 준비, 작업 수행상태, 주요 위험요인을 확인합니다.'],
          ['직접 확인', '현재 작업과 현장 상태를 기준으로 각 항목을 확인합니다.'],
          ['확인 후 진행', '다섯 항목을 모두 확인한 뒤 다음 단계로 이동합니다.']
        ]
      },
      {
        number: '03',
        title: '전자서명',
        description: '작업 시작 전에 필요한 안전사항을 직접 확인했다는 흐름을 전자서명으로 기록합니다.',
        image: 'assets/platform/chapter-03/mobile-unit-03.png',
        alt: '작업 시작 전 안전사항 확인을 기록하는 전자서명 화면',
        points: [
          ['확인 기록', '작업 시작 전 필요한 안전사항을 직접 확인했다는 흐름을 기록합니다.'],
          ['본인이 서명', '확인한 작업자가 서명 영역에 직접 서명합니다.']
        ]
      },
      {
        number: '04',
        title: '실제 작업 시작',
        description: 'Safety Start의 모든 과정을 완료하면 실제 작업을 시작할 수 있습니다.',
        image: 'assets/platform/chapter-03/mobile-unit-04.png',
        alt: 'Safety Start 완료 후 실제 작업 진행 상태 화면',
        points: [
          ['현재 작업 진행 상태', '작업명, 시작 시간과 현재 작업 진행 상태를 확인합니다.'],
          ['위험 신고 / 작업 중지', '작업 중 위험 상황이 발생하면 위험 신고 또는 작업 중지를 할 수 있습니다.']
        ]
      }
    ];
    const learningUnitMarkup = mobileLearningUnits.map((unit, unitIndex) => `
      <section class="mobile-golden-unit" aria-labelledby="mobile-golden-unit-${unit.number}">
        <header class="mobile-golden-unit-heading">
          <span>${unit.number}</span>
          <h2 id="mobile-golden-unit-${unit.number}">${unit.title}</h2>
          <p>${unit.description}</p>
        </header>
        <figure class="mobile-golden-preview mobile-golden-preview--${unit.number}">
          <img src="${unit.image}" alt="${unit.alt}" loading="lazy">
        </figure>
        <button class="mobile-golden-full-view" type="button" data-full-view="${unitIndex}" aria-haspopup="dialog">확대하여 전체 화면 보기 <span aria-hidden="true">↗</span></button>
        <ol class="mobile-golden-points">
          ${unit.points.map(([title, description], pointIndex) => `<li><span>${String(pointIndex + 1).padStart(2, '0')}</span><div><strong>${title}</strong><p>${description}</p></div></li>`).join('')}
        </ol>
      </section>`).join('');

    dailyWorkChapter.insertAdjacentHTML('beforeend', `
      <article class="mobile-golden-ch03" aria-label="CH03 Safety Start Mobile Learning">
        <header class="mobile-golden-compact-header">
          <button type="button" data-mobile-golden-menu aria-label="Academy 목차 열기" aria-controls="academy-navigation" aria-expanded="false"><span aria-hidden="true"></span></button>
          <strong>ONOFF Academy</strong>
          <span>학습 03 · 3/5</span>
        </header>
        <header class="mobile-golden-hero">
          <div class="mobile-golden-chapter-number"><strong>03</strong><span>COURSE 01 · PLATFORM · 학습 03</span></div>
          <div class="mobile-golden-hero-copy"><p>SAFETY START</p><h1>안전하게 작업 시작하기</h1><span>교육 및 회의 참가 확인부터 권리와 의무, 작업 전 안전확인과 전자서명까지 — 실제 작업을 시작하기 전 필요한 과정을 학습합니다.</span></div>
          <blockquote>“안전한 작업은 시작하기 전에 결정됩니다.”</blockquote>
          <div class="mobile-golden-progress"><p><span>진행률 60%</span><span>CH03 / CH05</span></p><div><i></i></div></div>
        </header>
        <section class="mobile-golden-why">
          <b>WHY</b><h2>왜 바로 작업을 시작하지 않을까요?</h2>
          <p>현장에 도착했다고 바로 작업을 시작하지 않습니다. 안전한 작업을 위해서는 몇 가지 과정을 먼저 완료해야 합니다.</p>
          <p>이 과정은 형식적인 절차가 아니라, 나와 동료의 안전을 위한 실질적인 준비입니다.</p>
          <aside><span>KEY MESSAGE</span><strong>Safety Start는 “작업을 시작해도 되는 상태”를 만드는 과정입니다.</strong></aside>
        </section>
        <section class="mobile-golden-flow">
          <b>FLOW</b><h2>ONOFF Platform Flow</h2><p>작업 시작 전 완료해야 하는 전체 과정</p>
          <ol>${mobileWorkflow.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><strong>${step}</strong><i aria-hidden="true">✓</i></li>`).join('')}</ol>
        </section>
        ${learningUnitMarkup}
        <section class="mobile-golden-after">
          <b>AFTER SAFETY START</b><h2>Safety Start 이후</h2>
          <p>Safety Start가 완료되면 실제 작업을 수행합니다. 작업 중에도 안전 관련 확인과 보고가 계속됩니다. 다음 학습에서 “작업 중과 작업 종료”를 확인합니다.</p>
          <div><strong>RELATED SAFETY MATERIALS</strong><p><span>위험성평가</span><span>SOP</span><span>TBM</span></p><small>작업과 연결된 안전자료가 있다면 필요할 때 원문 또는 상세 내용을 추가로 확인할 수 있습니다.</small></div>
        </section>
        <section class="mobile-golden-practice" data-practice-state="default">
          <b>PRACTICE</b><h2>학습 확인</h2>
          <p class="mobile-golden-question">Q. ‘작업 전 안전확인’에서 확인하는 5가지 항목이 아닌 것은?</p>
          <div class="mobile-golden-options" role="group" aria-label="답변 선택">
            ${[['A', '보호구'], ['B', '오늘의 주의사항'], ['C', '작업 변경 요청'], ['D', '주요 위험요인']].map(([value, label]) => `<button type="button" data-answer="${value}"><span>${value}</span>${label}</button>`).join('')}
          </div>
          <button type="button" data-practice-check disabled>정답 확인</button>
          <div class="mobile-golden-result" hidden aria-live="polite"><strong></strong><p>정답: C 작업 변경 요청</p><p>작업 변경 요청은 작업 전 안전확인 항목이 아닙니다.<br><br>작업 전 안전확인은 보호구, 오늘의 주의사항, 작업 준비, 작업 수행상태, 주요 위험요인을 확인합니다.</p><button type="button" data-practice-retry>다시 풀기</button></div>
        </section>
        <section class="mobile-golden-complete">
          <b>LEARNING COMPLETE</b><h2>학습 03 · Safety Start 완료</h2>
          <ol><li>Safety Start는 작업 시작 전 필요한 안전사항을 확인하고 실제 작업으로 이어지는 과정입니다.</li><li>교육 및 회의 참가 확인 → 권리와 의무 → 작업 전 안전확인 → 전자서명 순서로 진행합니다.</li><li>작업 전 안전확인에서는 보호구, 오늘의 주의사항, 작업 준비, 작업 수행상태, 주요 위험요인을 확인합니다.</li><li>전자서명은 작업 시작 전 안전사항을 직접 확인했다는 기록입니다.</li></ol>
          <blockquote>“작업이 무엇이든, 안전확인 없이 시작하지 않습니다.”</blockquote>
          <button type="button" data-learning-complete="daily-work">학습 완료</button>
        </section>
        <nav class="mobile-golden-navigation" aria-label="학습 이동"><a href="#workflow">← 학습 02 오늘 작업</a><button type="button" data-platform-toc-open>학습 목록</button><a href="#safety-report">학습 04 작업 중과 작업 종료 →</a></nav>
      </article>`);

    const mobilePilot = dailyWorkChapter.querySelector('.mobile-golden-ch03');
    const mobileGoldenMenu = mobilePilot?.querySelector('[data-mobile-golden-menu]');
    mobileGoldenMenu?.addEventListener('click', () => {
      openPlatformMobileToc();
      mobileGoldenMenu.setAttribute('aria-expanded', 'true');
    });
    platformMobileToc.addEventListener('close', () => mobileGoldenMenu?.setAttribute('aria-expanded', 'false'));
    mobilePilot?.querySelector('[data-platform-toc-open]')?.addEventListener('click', openPlatformMobileToc);
    mobilePilot?.querySelectorAll('[data-full-view]').forEach((button) => button.addEventListener('click', () => {
      const unit = mobileLearningUnits[Number(button.dataset.fullView)];
      if (!unit) return;
      openAcademyImageViewer({ src: unit.image, alt: unit.alt, title: `${unit.number} ${unit.title}`, trigger: button });
    }));

    const mobilePractice = mobilePilot?.querySelector('.mobile-golden-practice');
    const practiceResult = mobilePractice?.querySelector('.mobile-golden-result');
    mobilePractice?.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => {
      mobilePractice.querySelectorAll('[data-answer]').forEach((option) => option.classList.toggle('is-selected', option === button));
      mobilePractice.querySelector('[data-practice-check]').disabled = false;
    }));
    mobilePractice?.querySelector('[data-practice-check]')?.addEventListener('click', () => {
      const selected = mobilePractice.querySelector('[data-answer].is-selected');
      if (!selected) return;
      const isCorrect = selected.dataset.answer === 'C';
      mobilePractice.querySelectorAll('[data-answer]').forEach((option) => {
        option.classList.remove('is-selected');
        option.classList.toggle('is-correct', option.dataset.answer === 'C');
        option.classList.toggle('is-incorrect', option === selected && !isCorrect);
        option.disabled = true;
      });
      mobilePractice.querySelector('[data-practice-check]').disabled = true;
      mobilePractice.dataset.practiceState = isCorrect ? 'correct' : 'incorrect';
      practiceResult.hidden = false;
      practiceResult.querySelector('strong').textContent = isCorrect ? 'Correct' : 'Incorrect';
    });
    mobilePractice?.querySelector('[data-practice-retry]')?.addEventListener('click', () => {
      mobilePractice.dataset.practiceState = 'default';
      mobilePractice.querySelectorAll('[data-answer]').forEach((option) => {
        option.disabled = false;
        option.classList.remove('is-selected', 'is-correct', 'is-incorrect');
      });
      mobilePractice.querySelector('[data-practice-check]').disabled = true;
      practiceResult.hidden = true;
      mobilePractice.querySelector('[data-answer]')?.focus();
    });
  }
  const safetyReportChapter = document.getElementById('safety-report');
  const safetyReportChapterStart = safetyReportChapter?.querySelector('.book-chapter-start');
  if (safetyReportChapter && safetyReportChapterStart) {
    [...safetyReportChapter.children].forEach((child) => {
      if (child !== safetyReportChapterStart) child.remove();
    });
    const safetyReportPages = [
      { id: 'safety-report-summary', number: '01', title: 'Safety Report Summary', description: '5가지 Safety Report 유형과 기록 목적을 한눈에 확인합니다.', image: 'assets/platform/chapter-04/page-01-summary.png', alt: '사고, Near Miss, 위험제보, 개선제안, 종사자의견으로 구성된 Safety Report Summary', why: 'Safety Report는 현장의 위험과 개선 의견을 기록하여 같은 문제가 반복되지 않도록 관리하는 공통 창구입니다.', explanation: '사건의 성격에 맞는 유형을 선택하면 필요한 정보가 정확하게 기록되고 후속 검토와 개선으로 연결됩니다.', checks: ['보고하려는 내용과 가장 가까운 유형을 선택합니다.', '발생 시점과 장소, 구체적인 상황을 사실대로 기록합니다.', '사진이나 관련 자료가 있으면 함께 첨부합니다.'], field: '현장에서는 위험을 발견하거나 개선 의견이 생긴 즉시 가장 적합한 Report 유형으로 기록합니다.', tip: '유형을 고민하느라 보고를 미루지 말고, 판단이 어렵다면 Supervisor에게 확인한 뒤 등록합니다.' },
      { id: 'safety-report-accident', number: '02', title: '사고 (Accident)', description: '사고 발생 사실과 피해 내용을 신속하고 정확하게 기록합니다.', image: 'assets/platform/chapter-04/page-02-accident.png', alt: '사고 발생 일시와 장소, 피해 내용, 원인 및 사진을 등록하는 사고 Report 화면', why: '사고 기록은 즉각적인 대응과 원인 조사, 재발 방지대책 수립의 출발점입니다.', explanation: '발생 일시와 장소, 작업 내용, 피해 상황과 현장 사진을 사실 중심으로 등록합니다.', checks: ['인명과 설비의 긴급 안전조치를 먼저 수행합니다.', '발생 일시와 장소를 정확히 입력합니다.', '피해 내용과 사고 원인을 추측 없이 기록합니다.'], field: '현장 보존이 필요한 경우 임의로 정리하지 말고 책임자의 지시에 따라 사진과 증거를 확보합니다.', tip: '보고서 작성보다 인명 구조와 추가 사고 방지가 우선입니다.' },
      { id: 'safety-report-near-miss', number: '03', title: 'Near Miss', description: '사고로 이어질 뻔한 상황을 공유하여 같은 위험을 예방합니다.', image: 'assets/platform/chapter-04/page-03-near-miss.png', alt: 'Near Miss 발생 일시와 장소, 상황, 위험요인과 조치사항을 등록하는 화면', why: 'Near Miss는 피해가 없었더라도 동일 조건에서 실제 사고로 이어질 수 있는 중요한 사전 신호입니다.', explanation: '발생 상황, 위험요인, 즉시 조치와 개선 의견을 구체적으로 기록합니다.', checks: ['누가 잘못했는지가 아니라 어떤 조건이 위험했는지 기록합니다.', '즉시 조치한 내용을 함께 남깁니다.', '유사 작업에 적용할 예방대책을 제안합니다.'], field: '작은 이상이나 순간적인 위험도 반복 가능성이 있다면 Near Miss로 공유합니다.', tip: '피해가 없었다는 이유로 지나치지 않는 것이 사고 예방의 가장 빠른 방법입니다.' },
      { id: 'safety-report-hazard', number: '04', title: '위험제보', description: '현장에서 발견한 위험요인을 제보하여 사고를 사전에 차단합니다.', image: 'assets/platform/chapter-04/page-04-hazard-report.png', alt: '위험요인의 위치와 수준, 사진 및 개선 요청을 등록하는 위험제보 화면', why: '위험제보는 사고가 발생하기 전에 불안전한 상태와 행동을 발견하고 제거하기 위한 예방 활동입니다.', explanation: '발견 위치, 위험요인, 위험 수준과 필요한 개선사항을 사진과 함께 등록합니다.', checks: ['접근 통제나 표지 등 즉시 가능한 조치를 실시합니다.', '위험 위치를 다른 사람이 찾을 수 있도록 구체적으로 적습니다.', '위험 수준은 실제 노출 가능성을 기준으로 선택합니다.'], field: '즉시 제거할 수 없는 위험은 주변 작업자에게 알리고 접근하지 못하도록 조치한 뒤 제보합니다.', tip: '위험제보는 책임 추궁이 아니라 모두의 사고 예방을 위한 기록입니다.' },
      { id: 'safety-report-improvement', number: '05', title: '개선제안', description: '더 안전하고 효율적인 현장을 위한 아이디어를 제안합니다.', image: 'assets/platform/chapter-04/page-05-improvement.png', alt: '제안 제목과 문제점, 개선 방법, 기대 효과를 등록하는 개선제안 화면', why: '현장을 가장 잘 아는 작업자의 작은 아이디어가 안전성과 작업 효율을 함께 높일 수 있습니다.', explanation: '현재 문제점과 개선 방법, 기대 효과를 이해하기 쉽게 작성하고 필요한 자료를 첨부합니다.', checks: ['문제점과 제안 내용을 구분해 작성합니다.', '실행 가능한 개선 방법을 구체적으로 적습니다.', '안전과 품질, 효율에 미치는 효과를 설명합니다.'], field: '반복되는 불편이나 위험을 발견하면 개인적인 해결에 그치지 말고 표준 개선으로 연결합니다.', tip: '완성된 아이디어가 아니어도 현장의 문제와 개선 방향이 명확하면 제안할 수 있습니다.' },
      { id: 'safety-report-opinion', number: '06', title: '종사자의견', description: '현장의 의견과 건의사항을 전달하여 더 나은 근무환경을 만듭니다.', image: 'assets/platform/chapter-04/page-06-worker-opinion.png', alt: '의견 유형과 내용, 관련 부서 및 익명 여부를 선택하는 종사자의견 화면', why: '현장의 목소리는 정책과 작업 기준이 실제 업무에 맞게 개선되도록 하는 중요한 데이터입니다.', explanation: '의견 유형과 내용, 관련 부서를 선택하고 필요하면 익명으로 제출합니다.', checks: ['사실과 의견을 구분하여 작성합니다.', '개선이 필요한 이유와 기대 결과를 함께 설명합니다.', '개인정보나 불필요한 비방을 포함하지 않습니다.'], field: '작업환경, 제도, 의사소통과 관련된 의견을 구체적인 사례와 함께 전달합니다.', tip: '익명 제출 여부와 관계없이 개선에 필요한 핵심 사실을 명확하게 작성합니다.' }
    ];
    safetyReportPages.forEach((page, index) => {
      safetyReportChapter.insertAdjacentHTML('beforeend', `<section class="chapter-block tbm-scenario-lesson safety-report-lesson" id="${page.id}" aria-labelledby="${page.id}-title"${index ? ' hidden' : ''}><header class="chapter-block-heading"><span>PAGE ${page.number}</span><div><h3 id="${page.id}-title">${page.title}</h3><p>${page.description}</p></div></header><figure class="tbm-scenario-photo"><img src="${page.image}" alt="${page.alt}"${index ? ' loading="lazy"' : ''}></figure><div class="prose"><h3>WHY</h3><p>${page.why}</p><p>${page.explanation}</p><h3>CHECK POINT</h3><ul>${page.checks.map((item) => `<li>${item}</li>`).join('')}</ul><h3>현장 적용</h3><p>${page.field}</p></div><aside class="callout tip"><strong>TIP</strong><p>${page.tip}</p></aside></section>`);
    });
  }
  document.getElementById('electronic-documents')?.remove();
  document.querySelectorAll('a[href="#electronic-documents"]').forEach((link) => {
    const navigationItem = link.closest('.knowledge-navigation');
    const tocItem = link.closest('.book-chapters li');
    if (navigationItem || tocItem) {
      (tocItem || link).remove();
      return;
    }
    link.setAttribute('href', '#safety-report');
    if (link.textContent.trim() === 'Electronic Documents') link.textContent = 'Safety Report';
  });
  const safetyReportToc = document.querySelector('.book-chapters a[href="#safety-report"]');
  const safetyReportNumber = safetyReportToc?.querySelector(':scope > span');
  if (safetyReportNumber) safetyReportNumber.textContent = '04';
  const platformSummaryAssets = [
    { id: 'philosophy', src: 'assets/platform/chapter-01-philosophy-summary.png', alt: 'ONOFF Safety Platform 철학과 주요 안전활동을 한눈에 보여주는 Summary' },
    { id: 'workflow', src: 'assets/platform/chapter-02-workflow-summary.png', alt: 'Project부터 작업 완료까지 ONOFF 전체 Workflow를 한눈에 보여주는 Summary' },
  ];
  platformSummaryAssets.forEach(({ id, src, alt }) => {
    const chapter = document.getElementById(id);
    if (!chapter || chapter.querySelector('.platform-summary')) return;
    const anchors = {
      philosophy: '.prose',
      workflow: '#scene-case',
      'daily-work': '.section-heading',
      'electronic-documents': '.section-heading',
      'safety-report': '.section-heading'
    };
    const anchor = chapter.querySelector(anchors[id]);
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', `<figure class="image-block platform-summary"><img src="${src}" alt="${alt}"><figcaption>${alt}</figcaption></figure>`);
  });
  const chapterSectionHeadings = [
    ['#philosophy .prose', 'WHY'],
    ['#philosophy .platform-summary', 'SUMMARY'],
    ['#philosophy .callout', 'TIP'],
    ['#tbm-purpose .prose', 'WHY'],
    ['#tbm-purpose .callout', 'TIP'],
    ['#tbm-nine-steps .tbm-nine-step-summary', 'SUMMARY'],
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
    { chapter: 'workflow', key: 'summary', title: 'Workflow Summary', selector: '#workflow-summary' },
    { chapter: 'workflow', key: 'preparation', title: '준비 단계', selector: '#workflow-preparation' },
    { chapter: 'workflow', key: 'confirmation', title: '확인 단계', selector: '#workflow-confirmation' },
    { chapter: 'workflow', key: 'execution', title: '실행 및 완료 단계', selector: '#workflow-execution' },
    { chapter: 'daily-work', key: 'summary', title: 'Worker Workflow Summary', selector: '#daily-work-summary' },
    { chapter: 'daily-work', key: 'selection', title: '오늘 작업 선택', selector: '#daily-work-selection' },
    { chapter: 'daily-work', key: 'safety-check', title: '안전 확인', selector: '#daily-work-safety-check' },
    { chapter: 'daily-work', key: 'signature', title: '전자서명', selector: '#daily-work-signature' },
    { chapter: 'daily-work', key: 'safety-start', title: 'Safety Start', selector: '#daily-work-safety-start' },
    { chapter: 'safety-report', key: 'summary', title: 'Safety Report Summary', selector: '#safety-report-summary' },
    { chapter: 'safety-report', key: 'accident', title: '사고', selector: '#safety-report-accident' },
    { chapter: 'safety-report', key: 'near-miss', title: 'Near Miss', selector: '#safety-report-near-miss' },
    { chapter: 'safety-report', key: 'hazard', title: '위험제보', selector: '#safety-report-hazard' },
    { chapter: 'safety-report', key: 'improvement', title: '개선제안', selector: '#safety-report-improvement' },
    { chapter: 'safety-report', key: 'opinion', title: '종사자의견', selector: '#safety-report-opinion' },
    { chapter: 'tbm-purpose', book: 'tbm', key: 'why', title: 'WHY', selector: '.prose' },
    { chapter: 'tbm-nine-steps', book: 'tbm', key: 'summary', title: 'SUMMARY', selector: '.tbm-nine-step-summary' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'attendance', title: '참석 확인', selector: '#tbm-scenario-attendance' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'health', title: '건강 상태 확인', selector: '#tbm-scenario-health' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'warmup', title: '준비운동', selector: '#tbm-scenario-warmup' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'ppe', title: '보호구 점검', selector: '#tbm-scenario-ppe' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'hazard', title: '유해·위험요인 발표', selector: '#tbm-scenario-hazard' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'case', title: '주요 사고사례 공유', selector: '#tbm-scenario-case' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'emergency', title: '비상대응 및 연락체계', selector: '#tbm-scenario-emergency' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'role', title: '작업 간 역할 분담', selector: '#tbm-scenario-role' },
    { chapter: 'tbm-scenario', book: 'tbm', key: 'final', title: '최종 확인 및 작업 시작', selector: '#tbm-scenario-final' },
    { chapter: 'tbm-life-rules', book: 'tbm', key: 'action', title: 'ACTION', selector: '.step-list' }
    ,{ chapter: 'sop-purpose', book: 'sop', key: 'why', title: '왜 SOP가 필요한가?', selector: '#sop-purpose-why' }
    ,{ chapter: 'sop-purpose', book: 'sop', key: 'flow', title: 'SOP의 핵심', selector: '#sop-purpose-flow' }
    ,{ chapter: 'sop-purpose', book: 'sop', key: 'safety', title: 'Safety Mark', selector: '#sop-purpose-safety' }
    ,{ chapter: 'sop-purpose', book: 'sop', key: 'risk-link', title: 'SOP와 위험성평가', selector: '#sop-purpose-risk-link' }
    ,{ chapter: 'sop-purpose', book: 'sop', key: 'version', title: 'Version과 개정이력', selector: '#sop-purpose-version' }
    ,{ chapter: 'sop-reading', book: 'sop', key: 'step', title: '먼저 작업단계를 찾습니다', selector: '#sop-reading-step' }
    ,{ chapter: 'sop-reading', book: 'sop', key: 'order', title: '작업내용은 순서대로 읽습니다', selector: '#sop-reading-order' }
    ,{ chapter: 'sop-reading', book: 'sop', key: 'point', title: '중요 POINT를 확인합니다', selector: '#sop-reading-point' }
    ,{ chapter: 'sop-reading', book: 'sop', key: 'safety', title: '[S] Safety Mark를 확인합니다', selector: '#sop-reading-safety' }
    ,{ chapter: 'sop-reading', book: 'sop', key: 'risk', title: '위험도와 안전대책을 함께 봅니다', selector: '#sop-reading-risk' }
    ,{ chapter: 'sop-reading', book: 'sop', key: 'version', title: '최신 Version인지 확인합니다', selector: '#sop-reading-version' }
    ,{ chapter: 'sop-structure', book: 'sop', key: 'map', title: 'SOP 전체 구조', selector: '#sop-structure-map' }
    ,{ chapter: 'sop-structure', book: 'sop', key: 'flow', title: '작업 Flow가 중심입니다', selector: '#sop-structure-flow' }
    ,{ chapter: 'sop-structure', book: 'sop', key: 'step', title: '한 Step은 명확해야 합니다', selector: '#sop-structure-step' }
    ,{ chapter: 'sop-structure', book: 'sop', key: 'support', title: 'Supporting Information', selector: '#sop-structure-support' }
    ,{ chapter: 'sop-structure', book: 'sop', key: 'version', title: 'Version과 개정이력', selector: '#sop-structure-version' }
    ,{ chapter: 'sop-structure', book: 'sop', key: 'cycle', title: 'SOP와 위험성평가 개선 Cycle', selector: '#sop-structure-cycle' }
    ,{ chapter: 'sop-practice', book: 'sop', key: 'reader', title: 'PRACTICE 01', selector: '#sop-reader-practice' }
    ,{ chapter: 'sop-platform', book: 'sop', key: 'today', title: '오늘 작업의 SOP 확인', selector: '#sop-platform-today' }
    ,{ chapter: 'sop-platform', book: 'sop', key: 'safety', title: '최소 안전확인', selector: '#sop-platform-safety' }
    ,{ chapter: 'sop-platform', book: 'sop', key: 'signature', title: '전자서명', selector: '#sop-platform-signature' }
    ,{ chapter: 'sop-platform', book: 'sop', key: 'version', title: '변경된 SOP라면?', selector: '#sop-platform-version' }
    ,{ chapter: 'risk-assessment-purpose', book: 'risk', key: 'why', title: 'WHY', selector: '#risk-assessment-why' }
    ,{ chapter: 'risk-assessment-purpose', book: 'risk', key: 'workflow', title: 'WORKFLOW', selector: '#risk-assessment-workflow' }
    ,{ chapter: 'risk-assessment-purpose', book: 'risk', key: 'onoff', title: 'ONOFF 연결', selector: '#risk-assessment-onoff' }
    ,{ chapter: 'risk-assessment-purpose', book: 'risk', key: 'complete', title: 'COMPLETE', selector: '#risk-assessment-complete' }
    ,{ chapter: 'risk-assessment-structure', book: 'risk', key: 'summary', title: 'SUMMARY', selector: '#risk-structure-summary' }
    ,{ chapter: 'risk-assessment-structure', book: 'risk', key: 'table', title: '실제 평가표 읽기', selector: '#risk-structure-table' }
    ,{ chapter: 'risk-assessment-structure', book: 'risk', key: 'case', title: '하나의 사례로 따라가기', selector: '#risk-structure-case' }
    ,{ chapter: 'risk-assessment-structure', book: 'risk', key: 'checkpoint', title: 'CHECK POINT', selector: '#risk-structure-checkpoint' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'possibility', title: '가능성(F)', selector: '#risk-stra-possibility' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'severity', title: '중대성(S)', selector: '#risk-stra-severity' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'initial', title: '최초 위험성', selector: '#risk-stra-initial' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'matrix', title: '위험성 판단 Matrix', selector: '#risk-stra-matrix' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'controls', title: '안전조치 우선순위', selector: '#risk-stra-controls' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'reevaluation', title: '안전조치 후 재평가', selector: '#risk-stra-reevaluation' }
    ,{ chapter: 'risk-assessment-stra', book: 'risk', key: 'practice', title: 'PRACTICE 01', selector: '#risk-stra-practice' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'why', title: '왜 Daily Safety가 필요한가?', selector: '#risk-daily-why' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'linked', title: '위험성평가가 있는 작업', selector: '#risk-daily-linked' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'unlinked', title: '위험성평가가 없는 작업', selector: '#risk-daily-unlinked' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'check', title: 'Daily Risk Check', selector: '#risk-daily-check' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'controls', title: '안전조치 확인', selector: '#risk-daily-controls' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'change', title: '작업조건 변경', selector: '#risk-daily-change' }
    ,{ chapter: 'risk-assessment-daily-safety', book: 'risk', key: 'repeat', title: '반복 작업 표준화', selector: '#risk-daily-repeat' }
    ,{ chapter: 'risk-assessment-platform', book: 'risk', key: 'role', title: 'Academy와 Platform 역할', selector: '#risk-platform-role' }
    ,{ chapter: 'risk-assessment-platform', book: 'risk', key: 'formal', title: '정식 위험성평가', selector: '#risk-platform-formal' }
    ,{ chapter: 'risk-assessment-platform', book: 'risk', key: 'sop', title: 'SOP와 위험성평가', selector: '#risk-platform-sop' }
    ,{ chapter: 'risk-assessment-platform', book: 'risk', key: 'daily', title: 'Daily Work 연결', selector: '#risk-platform-daily' }
    ,{ chapter: 'risk-assessment-platform', book: 'risk', key: 'cycle', title: '작업 현장 순환', selector: '#risk-platform-cycle' }
    ,{ chapter: 'special-education-intro', book: 'special', key: 'quick', title: '특별안전교육이란?', selector: '.section-heading' }
    ,{ chapter: 'special-common-training', book: 'special', key: 'topics', title: '공통적으로 무엇을 배우는가?', selector: '#special-common-topics' }
    ,{ chapter: 'special-common-training', book: 'special', key: 'why', title: '왜 공통교육이 필요한가?', selector: '#special-common-why' }
    ,{ chapter: 'special-common-training', book: 'special', key: 'types', title: '안전교육은 언제 받는가?', selector: '#special-common-types' }
    ,{ chapter: 'special-common-training', book: 'special', key: 'additional', title: '특별한 위험작업은 추가교육', selector: '#special-common-additional' }
    ,{ chapter: 'special-common-training', book: 'special', key: 'before-work', title: '교육을 현장의 안전행동으로 연결', selector: '#special-common-before-work' }
    ,{ chapter: 'special-common-training', book: 'special', key: 'practice', title: 'PRACTICE', selector: '#special-common-practice' }
    ,{ chapter: 'special-cargo-handling', book: 'special', key: 'why', title: '왜 운반·하역 작업이 위험할까?', selector: '#special-material-why' }
    ,{ chapter: 'special-cargo-handling', book: 'special', key: 'before', title: '작업 전 확인', selector: '#special-material-before' }
    ,{ chapter: 'special-cargo-handling', book: 'special', key: 'load', title: '화물 취급', selector: '#special-material-load' }
    ,{ chapter: 'special-cargo-handling', book: 'special', key: 'signal', title: '작업신호', selector: '#special-material-signal' }
    ,{ chapter: 'special-cargo-handling', book: 'special', key: 'stop', title: '이상 시 STOP', selector: '#special-material-stop' }
    ,{ chapter: 'special-cargo-handling', book: 'special', key: 'practice', title: 'PRACTICE', selector: '#special-material-practice' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'why', title: '전기는 보이지 않습니다', selector: '#special-electrical-why' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'before', title: '작업 전 확인', selector: '#special-electrical-before' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'outage', title: '정전작업 기본 Flow', selector: '#special-electrical-outage' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'voltage', title: 'OFF 표시만 믿지 않습니다', selector: '#special-electrical-voltage' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'ppe', title: '보호구와 절연용 기구', selector: '#special-electrical-ppe' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'live', title: '활선작업', selector: '#special-electrical-live' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'stop', title: '이상하면 STOP', selector: '#special-electrical-stop' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'summary', title: 'SUMMARY', selector: '#special-electrical-summary' }
    ,{ chapter: 'special-live-work-75v', book: 'special', key: 'practice', title: 'PRACTICE', selector: '#special-electrical-practice' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'why', title: '익숙한 제품도 화학물질입니다', selector: '#special-chemical-why' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'product', title: '사용 전 제품 확인', selector: '#special-chemical-product' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'msds', title: 'MSDS 확인', selector: '#special-chemical-msds' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'current', title: '최신 MSDS 확인', selector: '#special-chemical-current' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'environment', title: '작업환경과 보호구', selector: '#special-chemical-environment' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'use', title: '안전하게 사용', selector: '#special-chemical-use' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'storage', title: '보관과 폐기', selector: '#special-chemical-storage' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'stop', title: '이상하면 STOP', selector: '#special-chemical-stop' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'summary', title: 'SUMMARY', selector: '#special-chemical-summary' }
    ,{ chapter: 'special-hazardous-chemicals', book: 'special', key: 'practice', title: 'PRACTICE', selector: '#special-chemical-practice' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'why', title: '로봇은 왜 위험할까?', selector: '#special-robot-why' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'before', title: '로봇작업 전 확인', selector: '#special-robot-before' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'zone', title: '운전 중 위험구역', selector: '#special-robot-zone' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'safeguard', title: '안전장치 임의 해제 금지', selector: '#special-robot-safeguard' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'access', title: '티칭·점검·정비 접근', selector: '#special-robot-access' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'teach', title: 'Teach Mode', selector: '#special-robot-teach' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'team', title: '2인 작업·역할 공유', selector: '#special-robot-team' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'emergency', title: '이상 발생 시', selector: '#special-robot-emergency' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'summary', title: 'SUMMARY', selector: '#special-robot-summary' }
    ,{ chapter: 'special-robot-work', book: 'special', key: 'practice', title: 'PRACTICE', selector: '#special-robot-practice' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'role', title: 'PART 01과 PART 02', selector: '#special-platform-role' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'today', title: '오늘 작업을 선택합니다', selector: '#special-platform-today' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'training', title: '특별교육 대상 확인', selector: '#special-platform-training' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'incomplete', title: '미이수라면?', selector: '#special-platform-incomplete' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'documents', title: '안전문서 확인', selector: '#special-platform-documents' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'sign', title: '전자서명', selector: '#special-platform-sign' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'start', title: 'Safety Start', selector: '#special-platform-start' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'change', title: '작업조건 변경', selector: '#special-platform-change' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'final', title: 'FINAL WORKFLOW', selector: '#special-platform-final' }
    ,{ chapter: 'special-daily-work', book: 'special', key: 'complete', title: 'HANDBOOK COMPLETE', selector: '#special-platform-complete' }
    ,{ chapter: 'risk-practical-01', book: 'practical', key: 'learning', title: '작업 확인과 위험요인 파악', selector: '.risk-practical-content' }
    ,{ chapter: 'risk-practical-02', book: 'practical', key: 'learning', title: '최초 위험성과 안전조치', selector: '.risk-practical-content' }
    ,{ chapter: 'risk-practical-03', book: 'practical', key: 'learning', title: '감소대책과 재평가', selector: '.risk-practical-content' }
    ,{ chapter: 'risk-practical-04', book: 'practical', key: 'learning', title: '개선 실행과 완료 확인', selector: '.risk-practical-content' }
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
    // TBM Golden Reference retains its legacy structure; Platform uses the fixed navigation only.
    if (lesson.book === 'tbm' && !chapter.querySelector('.chapter-reading-nav')) {
      chapter.insertAdjacentHTML('beforeend', '<nav class="chapter-reading-nav" aria-label="Lesson 이동"></nav>');
    }
  });

  const dailyRiskCheck = document.querySelector('#risk-daily-check');
  const dailyRiskControls = document.querySelector('#risk-daily-controls');
  if (dailyRiskCheck && dailyRiskControls) {
    const controlsByRisk = {
      fall: { label: '고소작업 / 추락', controls: ['안전대 착용 확인', '안전대 체결점 확인', '사다리 / 작업발판 상태 확인', '하부 작업구역 통제', '작업 주변 장애물 확인'] },
      electrical: { label: '전기 / 감전', controls: ['전원 차단 여부 확인', '무전압 상태 확인', 'LOTO 필요 여부 확인', '절연 보호구 / 공구 확인', '주변 충전부 접근 위험 확인'] },
      caught: { label: '끼임 / 협착', controls: ['설비 정지 확인', '불시 가동 가능성 확인', '잔류에너지 확인', 'LOTO 필요 여부 확인', '작업구역 접근 통제'] },
      heavy: { label: '중량물', controls: ['중량 및 무게중심 확인', '적절한 운반/인양 방법 확인', '인양구 및 보조장비 상태 확인', '작업 반경 접근 통제'] },
      falling: { label: '낙하 / 비래', controls: ['낙하 가능 자재/공구 확인', '공구 및 자재 고정', '하부 작업구역 통제', '필요한 보호구 확인'] },
      chemical: { label: '화학물질', controls: ['취급물질/SDS 확인', '필요한 보호구 확인', '환기 상태 확인', '누출/비상대응 방법 확인'] },
      fire: { label: '화재 / 고온', controls: ['화기/고온부 확인', '주변 가연물 확인', '소화설비 확인', '필요한 화상/열 보호구 확인', '작업구역 통제'] },
      other: { label: '기타', controls: ['기타 위험을 확인했습니다.', '관리자/리더와 필요한 안전조치를 확인하세요.'] }
    };
    const riskInputs = [...dailyRiskCheck.querySelectorAll('input[name="daily-risk"]')];
    const emptyState = dailyRiskControls.querySelector('.daily-risk-empty');
    const controlGroups = dailyRiskControls.querySelector('.daily-risk-control-groups');
    const renderDailyRiskControls = () => {
      const selected = riskInputs.filter((input) => input.checked).map((input) => controlsByRisk[input.value]).filter(Boolean);
      const uniqueControls = new Map();
      selected.forEach((risk) => risk.controls.forEach((control) => {
        const item = uniqueControls.get(control) || { control, risks: [] };
        if (!item.risks.includes(risk.label)) item.risks.push(risk.label);
        uniqueControls.set(control, item);
      }));
      controlGroups.replaceChildren();
      emptyState.hidden = selected.length > 0;
      if (!selected.length) return;
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'daily-risk-options daily-risk-generated';
      const legend = document.createElement('legend');
      legend.textContent = '선택한 위험의 핵심 안전조치';
      fieldset.append(legend);
      uniqueControls.forEach(({ control, risks }, index) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'daily-control';
        input.value = `control-${index + 1}`;
        const copy = document.createElement('span');
        copy.className = 'daily-risk-control-copy';
        const title = document.createElement('strong');
        title.textContent = control;
        const source = document.createElement('small');
        source.textContent = `관련 위험: ${risks.join(' · ')}`;
        copy.append(title, source);
        label.append(input, copy);
        fieldset.append(label);
      });
      controlGroups.append(fieldset);
    };
    riskInputs.forEach((input) => input.addEventListener('change', renderDailyRiskControls));
    renderDailyRiskControls();
  }

  const riskPractice = document.querySelector('#risk-stra-practice');
  if (riskPractice) {
    const practiceForm = riskPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...riskPractice.querySelectorAll('.risk-practice-step')];
    const practiceSubmit = riskPractice.querySelector('.practice-submit');
    const practiceResult = riskPractice.querySelector('.risk-practice-result');
    const practiceRestart = riskPractice.querySelector('.practice-restart');
    const practiceAchievement = riskPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'risk-assessment-basic';
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      practiceAchievement.querySelector('time').dateTime = achievement.completedAt || '';
      practiceAchievement.querySelector('time').textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievement = {
        achievementId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        version: 1
      };
      const achievements = readAchievements();
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
      return achievement;
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => setPracticeFeedback(step, ''));
      const hint = riskPractice.querySelector('.practice-hint');
      const hintToggle = riskPractice.querySelector('.practice-hint-toggle');
      hint.hidden = true;
      hintToggle.setAttribute('aria-expanded', 'false');
      hintToggle.textContent = '힌트 보기';
      practiceSubmit.disabled = true;
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      riskPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    const validatePracticeStep = (stepNumber) => {
      const step = practiceSteps[stepNumber - 1];
      if (stepNumber === 1) {
        const selected = [...step.querySelectorAll('input[name="hazard"]:checked')].map((input) => input.value);
        const correctCount = selected.filter((value) => value !== 'documents').length;
        if (selected.includes('documents')) return setPracticeFeedback(step, '작업 장면에서 직접 확인할 수 있는 현장 위험요인을 다시 살펴보세요.'), false;
        if (correctCount < 2) return setPracticeFeedback(step, '사다리뿐 아니라 작업자와 주변 환경도 함께 관찰해보세요.'), false;
        setPracticeFeedback(step, '✓ 작업 장면의 위험요인을 확인했습니다.', true);
      }
      if (stepNumber === 2) {
        const value = step.querySelector('input[name="accident"]:checked')?.value;
        if (value !== 'fall') return setPracticeFeedback(step, '작업자의 위치와 사다리 사용 상태를 다시 확인해보세요.'), false;
        setPracticeFeedback(step, '✓ 가장 우선적인 재해형태를 확인했습니다.', true);
      }
      if (stepNumber === 3) {
        if (step.querySelector('input[name="frequency"]').value !== '2') return setPracticeFeedback(step, '사고이력과 작업빈도를 더한 뒤 2로 나누어보세요.'), false;
        setPracticeFeedback(step, '✓ 가능성 F = 2', true);
      }
      if (stepNumber === 4) {
        if (step.querySelector('select[name="severity"]').value !== '2') return setPracticeFeedback(step, '문제 조건에 제공된 예상 중대성 값을 다시 확인해보세요.'), false;
        setPracticeFeedback(step, '✓ 중대성 S = 2', true);
      }
      if (stepNumber === 5) {
        const riskValue = step.querySelector('input[name="risk"]').value;
        const levelValue = step.querySelector('input[name="level"]:checked')?.value;
        if (riskValue !== '4') return setPracticeFeedback(step, '중대성 2와 가능성 2를 곱해보세요.'), false;
        if (levelValue !== 'yellow') return setPracticeFeedback(step, '위험성 Matrix에서 값 4의 색상과 허용기준을 다시 확인해보세요.'), false;
        setPracticeFeedback(step, '✓ 최초 위험성 4 · 노랑 · 허용가능', true);
      }
      if (stepNumber === 6) {
        const selected = [...step.querySelectorAll('input[name="control"]:checked')].map((input) => input.value);
        if (!selected.length || selected.includes('none')) return setPracticeFeedback(step, '위험을 낮출 수 있는 실제 안전조치를 다시 선택해보세요.'), false;
        if (selected.length === 1 && selected[0] === 'ppe') return setPracticeFeedback(step, '보호구보다 먼저 제거·대체·공학적·관리적 조치를 검토해보세요.'), false;
        setPracticeFeedback(step, '✓ 적용 가능한 안전조치를 선택했습니다.', true);
        practiceSubmit.disabled = false;
        return true;
      }
      showPracticeStep(stepNumber);
      practiceSteps[stepNumber]?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return true;
    };
    riskPractice.querySelector('.practice-hint-toggle')?.addEventListener('click', (event) => {
      const hint = riskPractice.querySelector('.practice-hint');
      hint.hidden = !hint.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!hint.hidden));
      event.currentTarget.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
    });
    practiceSteps.forEach((step, index) => step.querySelector('.practice-check')?.addEventListener('click', () => validatePracticeStep(index + 1)));
    practiceSubmit?.addEventListener('click', () => {
      if (practiceSubmit.disabled) return;
      saveAchievement();
      practiceForm.hidden = true;
      practiceResult.hidden = false;
      practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    practiceRestart?.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const sopPractice = document.querySelector('#sop-reader-practice');
  if (sopPractice) {
    const practiceForm = sopPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...sopPractice.querySelectorAll('.risk-practice-step')];
    const practiceSubmit = sopPractice.querySelector('.practice-submit');
    const practiceResult = sopPractice.querySelector('.risk-practice-result');
    const practiceRestart = sopPractice.querySelector('.practice-restart');
    const practiceAchievement = sopPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'sop-reader-basic';
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      practiceAchievement.querySelector('time').dateTime = achievement.completedAt || '';
      practiceAchievement.querySelector('time').textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed'
        ? achievements[achievementId]
        : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => setPracticeFeedback(step, ''));
      const hint = sopPractice.querySelector('.practice-hint');
      const hintToggle = sopPractice.querySelector('.practice-hint-toggle');
      hint.hidden = true;
      hintToggle.setAttribute('aria-expanded', 'false');
      hintToggle.textContent = '힌트 보기';
      practiceSubmit.disabled = true;
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      sopPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    const validatePracticeStep = (stepNumber) => {
      const step = practiceSteps[stepNumber - 1];
      if (stepNumber === 1) {
        if (step.querySelector('input[name="sop-flow"]:checked')?.value !== 'correct') return setPracticeFeedback(step, '작업을 시작하기 전에 무엇을 먼저 확인해야 할까요? 힌트를 확인하고 다시 시도하세요.'), false;
        setPracticeFeedback(step, '✓ 준비작업 → 본작업 → 마무리작업 Flow를 확인했습니다.', true);
      }
      if (stepNumber === 2) {
        if (step.querySelector('input[name="sop-order"]:checked')?.value !== 'correct') return setPracticeFeedback(step, '작업 전 상태와 준비물을 확인한 뒤 점검하고 원상복구하는 순서를 다시 생각해보세요.'), false;
        setPracticeFeedback(step, '✓ 작업순서를 올바르게 판단했습니다.', true);
      }
      if (stepNumber === 3) {
        if (step.querySelector('input[name="sop-safety-step"]:checked')?.value !== 'hazard') return setPracticeFeedback(step, '별도의 위험 확인과 안전조치가 필요한 행동을 다시 찾아보세요.'), false;
        setPracticeFeedback(step, '✓ [S] SAFETY STEP · 위험이 존재하는 Step의 안전정보를 확인합니다.', true);
      }
      if (stepNumber === 4) {
        const selected = [...step.querySelectorAll('input[name="sop-control"]:checked')].map((input) => input.value);
        if (!selected.length || selected.includes('none')) return setPracticeFeedback(step, '아무 확인 없이 작업을 진행할 수 없습니다. 위험 Step에 필요한 조치를 다시 선택하세요.'), false;
        setPracticeFeedback(step, '✓ 위험이 있는 Step에서 필요한 안전조치를 확인했습니다.', true);
      }
      if (stepNumber === 5) {
        if (step.querySelector('input[name="sop-version"]:checked')?.value !== '2.2') return setPracticeFeedback(step, '개정일과 Version을 비교해 현재 유효한 최신 SOP를 선택하세요.'), false;
        setPracticeFeedback(step, '✓ 최신 Version 2.2를 확인했습니다.', true);
        practiceSubmit.disabled = false;
        return true;
      }
      showPracticeStep(stepNumber);
      practiceSteps[stepNumber]?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return true;
    };
    sopPractice.querySelector('.practice-hint-toggle')?.addEventListener('click', (event) => {
      const hint = sopPractice.querySelector('.practice-hint');
      hint.hidden = !hint.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!hint.hidden));
      event.currentTarget.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
    });
    practiceSteps.forEach((step, index) => step.querySelector('.practice-check')?.addEventListener('click', () => validatePracticeStep(index + 1)));
    practiceSubmit?.addEventListener('click', () => {
      if (practiceSubmit.disabled) return;
      saveAchievement();
      practiceForm.hidden = true;
      practiceResult.hidden = false;
      practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    practiceRestart?.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const specialPractice = document.querySelector('#special-education-practice');
  if (specialPractice) {
    const practiceForm = specialPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialPractice.querySelector('.practice-restart');
    const practiceAchievement = specialPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'special-safety-basic';
    const correctAnswers = ['before', 'worker', 'high-risk'];
    const correctMessages = [
      '✓ 작업 시작 전 교육 실시 시점을 확인했습니다.',
      '✓ 고위험 작업 수행자가 교육 대상임을 확인했습니다.',
      '✓ 고위험 작업이 특별안전교육 대상임을 확인했습니다.'
    ];
    const retryMessages = [
      '고위험 작업을 시작하기 전 교육이 완료되어야 합니다. 힌트를 확인하고 다시 선택하세요.',
      '직급이나 소속보다 실제 수행하는 작업을 기준으로 다시 선택하세요.',
      '중대한 사고 위험이 있는 작업을 다시 선택하세요.'
    ];
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      const completedAt = practiceAchievement.querySelector('time');
      completedAt.dateTime = achievement.completedAt || '';
      completedAt.textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed'
        ? achievements[achievementId]
        : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => {
        setPracticeFeedback(step, '');
        const hint = step.querySelector('.practice-hint');
        const hintToggle = step.querySelector('.practice-hint-toggle');
        hint.hidden = true;
        hintToggle.setAttribute('aria-expanded', 'false');
        hintToggle.textContent = '힌트 보기';
      });
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      specialPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    practiceSteps.forEach((step, index) => {
      const hint = step.querySelector('.practice-hint');
      const hintToggle = step.querySelector('.practice-hint-toggle');
      hintToggle.addEventListener('click', () => {
        hint.hidden = !hint.hidden;
        hintToggle.setAttribute('aria-expanded', String(!hint.hidden));
        hintToggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
      });
      step.querySelector('.practice-check').addEventListener('click', () => {
        const selected = step.querySelector('input[type="radio"]:checked')?.value;
        if (selected !== correctAnswers[index]) {
          setPracticeFeedback(step, retryMessages[index]);
          hint.hidden = false;
          hintToggle.setAttribute('aria-expanded', 'true');
          hintToggle.textContent = '힌트 닫기';
          return;
        }
        setPracticeFeedback(step, correctMessages[index], true);
        if (index < practiceSteps.length - 1) {
          showPracticeStep(index + 1);
          practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        saveAchievement();
        practiceForm.hidden = true;
        practiceResult.hidden = false;
        practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const specialCommonPractice = document.querySelector('#special-common-practice');
  if (specialCommonPractice) {
    const practiceForm = specialCommonPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialCommonPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialCommonPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialCommonPractice.querySelector('.practice-restart');
    const practiceAchievement = specialCommonPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'safety-common-basic';
    const correctAnswers = ['hire', 'additional', 'stop'];
    const correctMessages = [
      '✓ 작업 투입 전 채용 시 교육을 확인했습니다.',
      '✓ 해당 작업의 특별교육을 추가로 확인했습니다.',
      '✓ 작업을 멈추고 안전상태를 확보한 뒤 알리는 행동을 확인했습니다.'
    ];
    const retryMessages = [
      '새로운 근로자가 작업환경과 기본 안전수칙을 처음 확인하는 교육을 다시 생각해보세요.',
      '공통교육만으로 특정 유해·위험작업의 교육이 완료되는지 다시 확인해보세요.',
      '예상하지 못한 위험이 계속되는 상황에서 가장 먼저 해야 할 행동을 다시 선택하세요.'
    ];
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      const completedAt = practiceAchievement.querySelector('time');
      completedAt.dateTime = achievement.completedAt || '';
      completedAt.textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed'
        ? achievements[achievementId]
        : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => {
        setPracticeFeedback(step, '');
        const hint = step.querySelector('.practice-hint');
        const hintToggle = step.querySelector('.practice-hint-toggle');
        hint.hidden = true;
        hintToggle.setAttribute('aria-expanded', 'false');
        hintToggle.textContent = '힌트 보기';
      });
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      specialCommonPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    practiceSteps.forEach((step, index) => {
      const hint = step.querySelector('.practice-hint');
      const hintToggle = step.querySelector('.practice-hint-toggle');
      hintToggle.addEventListener('click', () => {
        hint.hidden = !hint.hidden;
        hintToggle.setAttribute('aria-expanded', String(!hint.hidden));
        hintToggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
      });
      step.querySelector('.practice-check').addEventListener('click', () => {
        const selected = step.querySelector('input[type="radio"]:checked')?.value;
        if (selected !== correctAnswers[index]) {
          setPracticeFeedback(step, retryMessages[index]);
          hint.hidden = false;
          hintToggle.setAttribute('aria-expanded', 'true');
          hintToggle.textContent = '힌트 닫기';
          return;
        }
        setPracticeFeedback(step, correctMessages[index], true);
        if (index < practiceSteps.length - 1) {
          showPracticeStep(index + 1);
          practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        saveAchievement();
        practiceForm.hidden = true;
        practiceResult.hidden = false;
        practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const supersededSpecialMaterialPractice = null;
  if (supersededSpecialMaterialPractice) {
    const practiceForm = specialMaterialPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialMaterialPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialMaterialPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialMaterialPractice.querySelector('.practice-restart');
    const practiceAchievement = specialMaterialPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'special-safety-material-handling';
    const correctAnswers = [['all'], ['stop'], ['signal', 'unstable', 'worker']];
    const correctMessages = [
      '✓ 화물·이동경로·주변 작업자를 확인했습니다.',
      '✓ 정지 후 작업신호를 다시 확인했습니다.',
      '✓ 작업을 계속하면 안 되는 세 가지 상황을 확인했습니다.'
    ];
    const retryMessages = [
      '화물만이 아니라 이동경로와 같은 공간의 작업자도 함께 확인해야 합니다.',
      '신호가 불명확할 때 이동을 계속해도 되는지 다시 생각해보세요.',
      '안전한 이동 조건을 깨뜨리는 상황 세 가지를 다시 선택하세요.'
    ];
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      const completedAt = practiceAchievement.querySelector('time');
      completedAt.dateTime = achievement.completedAt || '';
      completedAt.textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed'
        ? achievements[achievementId]
        : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => {
        setPracticeFeedback(step, '');
        const hint = step.querySelector('.practice-hint');
        const hintToggle = step.querySelector('.practice-hint-toggle');
        hint.hidden = true;
        hintToggle.setAttribute('aria-expanded', 'false');
        hintToggle.textContent = '힌트 보기';
      });
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      specialMaterialPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    practiceSteps.forEach((step, index) => {
      const hint = step.querySelector('.practice-hint');
      const hintToggle = step.querySelector('.practice-hint-toggle');
      hintToggle.addEventListener('click', () => {
        hint.hidden = !hint.hidden;
        hintToggle.setAttribute('aria-expanded', String(!hint.hidden));
        hintToggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
      });
      step.querySelector('.practice-check').addEventListener('click', () => {
        const selected = [...step.querySelectorAll('input:checked')].map((input) => input.value).sort();
        const expected = [...correctAnswers[index]].sort();
        const correct = selected.length === expected.length && selected.every((value, answerIndex) => value === expected[answerIndex]);
        if (!correct) {
          setPracticeFeedback(step, retryMessages[index]);
          hint.hidden = false;
          hintToggle.setAttribute('aria-expanded', 'true');
          hintToggle.textContent = '힌트 닫기';
          return;
        }
        setPracticeFeedback(step, correctMessages[index], true);
        if (index < practiceSteps.length - 1) {
          showPracticeStep(index + 1);
          practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        saveAchievement();
        practiceForm.hidden = true;
        practiceResult.hidden = false;
        practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const specialMaterialPractice = document.querySelector('#special-material-practice');
  if (specialMaterialPractice) {
    const practiceForm = specialMaterialPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialMaterialPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialMaterialPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialMaterialPractice.querySelector('.practice-restart');
    const practiceAchievement = specialMaterialPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'special-safety-material-handling';
    const correctAnswers = [['all'], ['stop'], ['signal', 'unstable', 'worker']];
    const correctMessages = [
      '✓ 화물·이동경로·주변 작업자를 확인했습니다.',
      '✓ 정지 후 작업신호를 다시 확인했습니다.',
      '✓ 작업을 계속하면 안 되는 세 가지 상황을 확인했습니다.'
    ];
    const retryMessages = [
      '화물만이 아니라 이동경로와 같은 공간의 작업자도 함께 확인해야 합니다.',
      '신호가 불명확할 때 이동을 계속해도 되는지 다시 생각해보세요.',
      '안전한 이동 조건을 깨뜨리는 상황 세 가지를 다시 선택하세요.'
    ];
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      const completedAt = practiceAchievement.querySelector('time');
      completedAt.dateTime = achievement.completedAt || '';
      completedAt.textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed'
        ? achievements[achievementId]
        : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => {
        setPracticeFeedback(step, '');
        const hint = step.querySelector('.practice-hint');
        const hintToggle = step.querySelector('.practice-hint-toggle');
        hint.hidden = true;
        hintToggle.setAttribute('aria-expanded', 'false');
        hintToggle.textContent = '힌트 보기';
      });
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      specialMaterialPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    practiceSteps.forEach((step, index) => {
      const hint = step.querySelector('.practice-hint');
      const hintToggle = step.querySelector('.practice-hint-toggle');
      hintToggle.addEventListener('click', () => {
        hint.hidden = !hint.hidden;
        hintToggle.setAttribute('aria-expanded', String(!hint.hidden));
        hintToggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
      });
      step.querySelector('.practice-check').addEventListener('click', () => {
        const selected = [...step.querySelectorAll('input:checked')].map((input) => input.value).sort();
        const expected = [...correctAnswers[index]].sort();
        const correct = selected.length === expected.length && selected.every((value, answerIndex) => value === expected[answerIndex]);
        if (!correct) {
          setPracticeFeedback(step, retryMessages[index]);
          hint.hidden = false;
          hintToggle.setAttribute('aria-expanded', 'true');
          hintToggle.textContent = '힌트 닫기';
          return;
        }
        setPracticeFeedback(step, correctMessages[index], true);
        if (index < practiceSteps.length - 1) {
          showPracticeStep(index + 1);
          practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        saveAchievement();
        practiceForm.hidden = true;
        practiceResult.hidden = false;
        practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }
  const specialRobotPractice = document.querySelector('#special-robot-practice');
  if (specialRobotPractice) {
    const practiceForm = specialRobotPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialRobotPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialRobotPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialRobotPractice.querySelector('.practice-restart');
    const practiceAchievement = specialRobotPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'special-safety-robot';
    const correctAnswers = [['verify'], ['procedure'], ['movement'], ['mismatch', 'safeguard', 'unexpected']];
    const correctMessages = ['✓ 접근 전 운전·에너지 상태와 안전조건을 확인했습니다.','✓ 정지·안전절차 후 접근하는 원칙을 확인했습니다.','✓ Teach Mode에서도 동작범위와 작업자 위치를 확인했습니다.','✓ 작업을 계속하면 안 되는 세 가지 상태를 확인했습니다.'];
    const retryMessages = ['정지해 보이는 상태가 실제 안전상태인지 다시 생각해보세요.','자동운전 중 위험구역에 접근하기 전에 무엇을 해야 하는지 확인하세요.','Teach Mode에서도 로봇이 실제로 움직일 수 있음을 기억하세요.','안전장치, 로봇 동작과 작업자 간 상태 인식이 명확한지 다시 확인하세요.'];
    const showPracticeStep = (index) => practiceSteps.forEach((step, stepIndex) => { step.classList.toggle('is-active', stepIndex === index); step.disabled = stepIndex > index; });
    const setPracticeFeedback = (step, message, correct = false) => { const feedback = step.querySelector('.practice-feedback'); feedback.textContent = message; feedback.classList.toggle('is-correct', correct); };
    const readAchievements = () => { try { const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}'); return saved && typeof saved === 'object' ? saved : {}; } catch { return {}; } };
    const showAchievement = (achievement) => { if (!achievement || achievement.status !== 'completed') return; const completedDate = achievement.completedAt ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt)) : ''; const completedAt = practiceAchievement.querySelector('time'); completedAt.dateTime = achievement.completedAt || ''; completedAt.textContent = completedDate; practiceAchievement.hidden = false; };
    const saveAchievement = () => { const achievements = readAchievements(); const achievement = achievements[achievementId]?.status === 'completed' ? achievements[achievementId] : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 }; achievements[achievementId] = achievement; try { localStorage.setItem(achievementStorageKey, JSON.stringify(achievements)); } catch { /* Completion remains visible for this session. */ } showAchievement(achievement); };
    const resetPractice = () => { practiceForm.reset(); practiceSteps.forEach((step) => { setPracticeFeedback(step, ''); const hint = step.querySelector('.practice-hint'); const toggle = step.querySelector('.practice-hint-toggle'); hint.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '힌트 보기'; }); practiceForm.hidden = false; practiceResult.hidden = true; showPracticeStep(0); specialRobotPractice.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
    practiceSteps.forEach((step, index) => { const hint = step.querySelector('.practice-hint'); const toggle = step.querySelector('.practice-hint-toggle'); toggle.addEventListener('click', () => { hint.hidden = !hint.hidden; toggle.setAttribute('aria-expanded', String(!hint.hidden)); toggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기'; }); step.querySelector('.practice-check').addEventListener('click', () => { const selected = [...step.querySelectorAll('input:checked')].map((input) => input.value).sort(); const expected = [...correctAnswers[index]].sort(); const correct = selected.length === expected.length && selected.every((value, answerIndex) => value === expected[answerIndex]); if (!correct) { setPracticeFeedback(step, retryMessages[index]); hint.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = '힌트 닫기'; return; } setPracticeFeedback(step, correctMessages[index], true); if (index < practiceSteps.length - 1) { showPracticeStep(index + 1); practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' }); return; } saveAchievement(); practiceForm.hidden = true; practiceResult.hidden = false; practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' }); }); });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const specialChemicalPractice = document.querySelector('#special-chemical-practice');
  if (specialChemicalPractice) {
    const practiceForm = specialChemicalPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialChemicalPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialChemicalPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialChemicalPractice.querySelector('.practice-restart');
    const practiceAchievement = specialChemicalPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'special-safety-chemical';
    const correctAnswers = [['stop'], ['handling', 'hazard', 'ppe', 'storage'], ['designated'], ['no']];
    const correctMessages = ['✓ 제품과 안전정보를 확인한 뒤 사용하는 원칙을 확인했습니다.','✓ MSDS에서 우선 확인할 네 가지 안전정보를 확인했습니다.','✓ 지정된 보관·폐기방법을 따르는 행동을 확인했습니다.','✓ 보호장갑이 환기 확인을 대신할 수 없음을 확인했습니다.'];
    const retryMessages = ['제품과 안전정보가 불명확한 상태에서 가장 먼저 해야 할 행동을 확인하세요.','작업자의 노출 예방과 취급·보관에 직접 필요한 정보를 다시 선택하세요.','사용 후 잔류물이 있는 자재의 관리방법을 다시 생각해보세요.','보호구와 환기·작업환경 통제의 역할을 구분해보세요.'];
    const showPracticeStep = (index) => practiceSteps.forEach((step, stepIndex) => { step.classList.toggle('is-active', stepIndex === index); step.disabled = stepIndex > index; });
    const setPracticeFeedback = (step, message, correct = false) => { const feedback = step.querySelector('.practice-feedback'); feedback.textContent = message; feedback.classList.toggle('is-correct', correct); };
    const readAchievements = () => { try { const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}'); return saved && typeof saved === 'object' ? saved : {}; } catch { return {}; } };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt)) : '';
      const completedAt = practiceAchievement.querySelector('time'); completedAt.dateTime = achievement.completedAt || ''; completedAt.textContent = completedDate; practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed' ? achievements[achievementId] : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try { localStorage.setItem(achievementStorageKey, JSON.stringify(achievements)); } catch { /* Completion remains visible for this session. */ }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => { setPracticeFeedback(step, ''); const hint = step.querySelector('.practice-hint'); const toggle = step.querySelector('.practice-hint-toggle'); hint.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '힌트 보기'; });
      practiceForm.hidden = false; practiceResult.hidden = true; showPracticeStep(0); specialChemicalPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    practiceSteps.forEach((step, index) => {
      const hint = step.querySelector('.practice-hint'); const toggle = step.querySelector('.practice-hint-toggle');
      toggle.addEventListener('click', () => { hint.hidden = !hint.hidden; toggle.setAttribute('aria-expanded', String(!hint.hidden)); toggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기'; });
      step.querySelector('.practice-check').addEventListener('click', () => {
        const selected = [...step.querySelectorAll('input:checked')].map((input) => input.value).sort(); const expected = [...correctAnswers[index]].sort();
        const correct = selected.length === expected.length && selected.every((value, answerIndex) => value === expected[answerIndex]);
        if (!correct) { setPracticeFeedback(step, retryMessages[index]); hint.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = '힌트 닫기'; return; }
        setPracticeFeedback(step, correctMessages[index], true);
        if (index < practiceSteps.length - 1) { showPracticeStep(index + 1); practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
        saveAchievement(); practiceForm.hidden = true; practiceResult.hidden = false; practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }

  const specialElectricalPractice = document.querySelector('#special-electrical-practice');
  if (specialElectricalPractice) {
    const practiceForm = specialElectricalPractice.querySelector('.risk-practice-form');
    const practiceSteps = [...specialElectricalPractice.querySelectorAll('.risk-practice-step')];
    const practiceResult = specialElectricalPractice.querySelector('.risk-practice-result');
    const practiceRestart = specialElectricalPractice.querySelector('.practice-restart');
    const practiceAchievement = specialElectricalPractice.querySelector('.risk-practice-achievement');
    const achievementStorageKey = 'onoff-academy-achievements';
    const achievementId = 'special-safety-electrical';
    const correctAnswers = [['verify'], ['restart'], ['missing-ppe', 'target', 'voltage'], ['impossible']];
    const correctMessages = [
      '✓ LOTO와 무전압 상태를 확인한 뒤 작업하는 원칙을 확인했습니다.',
      '✓ 예상하지 못한 재가동을 방지하는 LOTO의 목적을 확인했습니다.',
      '✓ 작업을 시작하면 안 되는 세 가지 조건을 확인했습니다.',
      '✓ 보호구가 전원 차단 절차를 대신할 수 없음을 확인했습니다.'
    ];
    const retryMessages = [
      'OFF 표시만으로 실제 무전압 상태가 확인되는지 다시 생각해보세요.',
      '작업 중 다른 사람이 설비를 다시 가동하지 못하게 하는 목적을 확인하세요.',
      '전원 상태, 차단 대상, 절연보호구가 모두 준비되었는지 다시 확인하세요.',
      '보호구와 에너지 통제는 서로 다른 안전조치입니다.'
    ];
    const showPracticeStep = (index) => {
      practiceSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
        step.disabled = stepIndex > index;
      });
    };
    const setPracticeFeedback = (step, message, correct = false) => {
      const feedback = step.querySelector('.practice-feedback');
      feedback.textContent = message;
      feedback.classList.toggle('is-correct', correct);
    };
    const readAchievements = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(achievementStorageKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
      } catch {
        return {};
      }
    };
    const showAchievement = (achievement) => {
      if (!achievement || achievement.status !== 'completed') return;
      const completedDate = achievement.completedAt
        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(achievement.completedAt))
        : '';
      const completedAt = practiceAchievement.querySelector('time');
      completedAt.dateTime = achievement.completedAt || '';
      completedAt.textContent = completedDate;
      practiceAchievement.hidden = false;
    };
    const saveAchievement = () => {
      const achievements = readAchievements();
      const achievement = achievements[achievementId]?.status === 'completed'
        ? achievements[achievementId]
        : { achievementId, status: 'completed', completedAt: new Date().toISOString(), version: 1 };
      achievements[achievementId] = achievement;
      try {
        localStorage.setItem(achievementStorageKey, JSON.stringify(achievements));
      } catch {
        // Completion remains visible for this session when browser storage is unavailable.
      }
      showAchievement(achievement);
    };
    const resetPractice = () => {
      practiceForm.reset();
      practiceSteps.forEach((step) => {
        setPracticeFeedback(step, '');
        const hint = step.querySelector('.practice-hint');
        const hintToggle = step.querySelector('.practice-hint-toggle');
        hint.hidden = true;
        hintToggle.setAttribute('aria-expanded', 'false');
        hintToggle.textContent = '힌트 보기';
      });
      practiceForm.hidden = false;
      practiceResult.hidden = true;
      showPracticeStep(0);
      specialElectricalPractice.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    practiceSteps.forEach((step, index) => {
      const hint = step.querySelector('.practice-hint');
      const hintToggle = step.querySelector('.practice-hint-toggle');
      hintToggle.addEventListener('click', () => {
        hint.hidden = !hint.hidden;
        hintToggle.setAttribute('aria-expanded', String(!hint.hidden));
        hintToggle.textContent = hint.hidden ? '힌트 보기' : '힌트 닫기';
      });
      step.querySelector('.practice-check').addEventListener('click', () => {
        const selected = [...step.querySelectorAll('input:checked')].map((input) => input.value).sort();
        const expected = [...correctAnswers[index]].sort();
        const correct = selected.length === expected.length && selected.every((value, answerIndex) => value === expected[answerIndex]);
        if (!correct) {
          setPracticeFeedback(step, retryMessages[index]);
          hint.hidden = false;
          hintToggle.setAttribute('aria-expanded', 'true');
          hintToggle.textContent = '힌트 닫기';
          return;
        }
        setPracticeFeedback(step, correctMessages[index], true);
        if (index < practiceSteps.length - 1) {
          showPracticeStep(index + 1);
          practiceSteps[index + 1].scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        saveAchievement();
        practiceForm.hidden = true;
        practiceResult.hidden = false;
        practiceResult.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    practiceRestart.addEventListener('click', resetPractice);
    showAchievement(readAchievements()[achievementId]);
  }
  Object.entries(mobileChapterData).forEach(([chapterId, data]) => mountFigmaMobileChapter(chapterId, data));
  document.querySelectorAll('.risk-practice-form').forEach((form) => {
    form.addEventListener('change', (event) => {
      const input = event.target.closest('input[type="radio"],input[type="checkbox"]');
      const step = input?.closest('.risk-practice-step');
      if (!step) return;
      step.querySelectorAll(':scope > label').forEach((label) => {
        const choice = label.querySelector('input');
        label.classList.toggle('is-selected', Boolean(choice?.checked));
        label.classList.remove('is-correct', 'is-incorrect');
      });
    });
    form.querySelectorAll('.practice-check').forEach((check) => check.addEventListener('click', () => {
      const step = check.closest('.risk-practice-step');
      window.setTimeout(() => {
        const feedback = step?.querySelector('.practice-feedback');
        if (!feedback?.textContent.trim()) return;
        const correct = feedback.classList.contains('is-correct');
        step.querySelectorAll(':scope > label').forEach((label) => {
          const selected = Boolean(label.querySelector('input')?.checked);
          label.classList.remove('is-selected');
          label.classList.toggle('is-correct', selected && correct);
          label.classList.toggle('is-incorrect', selected && !correct);
        });
      });
    }));
    form.closest('.risk-practice')?.querySelector('.practice-restart')?.addEventListener('click', () => window.setTimeout(() => {
      form.querySelectorAll('.risk-practice-step > label').forEach((label) => label.classList.remove('is-selected', 'is-correct', 'is-incorrect'));
    }));
  });
  mountPlatformMobileShell();
  [
    ['philosophy', 'why', '.platform-summary'],
    ['philosophy', 'why', '.callout'],
    ['tbm-purpose', 'why', '.callout'],
    ['tbm-life-rules', 'action', '.callout']
  ].forEach(([chapterId, lessonKey, selector]) => {
    const block = document.querySelector(`#${chapterId} ${selector}`);
    if (!block) return;
    block.classList.add('academy-lesson');
    block.dataset.lesson = lessonKey;
  });
  bookChapterForm.forEach((item) => {
    const chapter = document.getElementById(item.id);
    chapter?.querySelector('.chapter-reading-nav')?.insertAdjacentHTML('beforebegin', `<div class="chapter-complete-label" hidden><button type="button" data-learning-complete="${item.id}">학습 완료</button></div>`);
  });
  document.querySelectorAll('.book-chapters a[href^="#"]').forEach((link) => {
    const chapterId = link.hash.slice(1);
    const firstLesson = lessonsByChapter.get(chapterId)?.[0];
    if (firstLesson) link.hash = firstLesson.route;
  });
  [
    ['#safety-book .book-chapters', 'platform'],
    ['#tbm-book .book-chapters', 'tbm'],
    ['#risk-book .book-chapters', 'risk']
    ,['#sop-book .book-chapters', 'sop']
    ,['#special-book .book-chapters', 'special']
  ].forEach(([selector, book]) => {
    const toc = document.querySelector(selector);
    const firstLesson = lessonCatalog.find((lesson) => lesson.book === book);
    if (toc && firstLesson) toc.insertAdjacentHTML('beforeend', `<a class="toc-start-learning" href="#${firstLesson.route}"><span>학습 시작하기</span><b aria-hidden="true">→</b></a>`);
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const documentScroller = document.querySelector('.document');
  const resetViewScroll = () => {
    window.scrollTo(0, 0);
    if (documentScroller) documentScroller.scrollTop = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (documentScroller) documentScroller.scrollTop = 0;
    }));
    window.setTimeout(() => {
      window.scrollTo(0, 0);
      if (documentScroller) documentScroller.scrollTop = 0;
    }, 120);
  };
  let selectedLearningMode = sessionStorage.getItem('academy-learning-mode') || 'book';
  const floatingLessonNavigation = document.createElement('nav');
  floatingLessonNavigation.className = 'chapter-reading-nav floating-lesson-navigation';
  floatingLessonNavigation.setAttribute('aria-label', 'Floating Lesson 이동');
  floatingLessonNavigation.hidden = true;
  document.body.append(floatingLessonNavigation);
  let floatingLessonEnabled = false;
  const updateFloatingLessonNavigation = () => {
    floatingLessonNavigation.hidden = !floatingLessonEnabled;
  };
  floatingLessonNavigation.addEventListener('click', (event) => {
    const topLink = event.target.closest('[data-lesson-top]');
    if (!topLink) return;
    event.preventDefault();
    (documentScroller || window).scrollTo({ top: 0, behavior: 'smooth' });
  });
  (documentScroller || window).addEventListener('scroll', updateFloatingLessonNavigation, { passive: true });

  const progressStorageKey = 'onoff-academy-progress-v1';
  const progressStorageVersion = 1;
  const tbmIntroSeenStorageKey = 'onoff-academy-tbm-intro-seen-v1';
  const hasSeenTbmIntro = () => {
    try { return localStorage.getItem(tbmIntroSeenStorageKey) === 'true'; } catch (_) { return false; }
  };
  const markTbmIntroSeen = () => {
    try { localStorage.setItem(tbmIntroSeenStorageKey, 'true'); } catch (_) { /* Storage may be unavailable in private or embedded contexts. */ }
  };
  const learningStates = new Set(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
  const progressLearningOverrides = new Map([
    ['tbm', ['tbm-nine-steps', 'tbm-scenario', 'tbm-life-rules']]
  ]);
  const getProgressLearningIds = (course) => progressLearningOverrides.get(course.id)
    || course.chapters.map(([learningId]) => learningId);
  const progressCourseByLearning = new Map();
  entryCourseCatalog.forEach((course) => getProgressLearningIds(course).forEach((learningId) => progressCourseByLearning.set(learningId, course.id)));
  const createDefaultProgress = () => ({
    version: progressStorageVersion,
    courses: Object.fromEntries(entryCourseCatalog.map((course) => [course.id, {
      lastLearning: null,
      learnings: Object.fromEntries(getProgressLearningIds(course).map((learningId) => [learningId, { state: 'NOT_STARTED', completedAt: null }]))
    }]))
  });
  const loadProgress = () => {
    const fallback = createDefaultProgress();
    try {
      const stored = JSON.parse(localStorage.getItem(progressStorageKey));
      if (!stored || stored.version !== progressStorageVersion || typeof stored.courses !== 'object') return fallback;
      entryCourseCatalog.forEach((course) => {
        const storedCourse = stored.courses[course.id];
        if (!storedCourse || typeof storedCourse.learnings !== 'object') return;
        const progressLearningIds = getProgressLearningIds(course);
        progressLearningIds.forEach((learningId) => {
          const storedLearning = storedCourse.learnings[learningId];
          if (!storedLearning || !learningStates.has(storedLearning.state)) return;
          fallback.courses[course.id].learnings[learningId] = {
            state: storedLearning.state,
            completedAt: storedLearning.state === 'COMPLETED' && typeof storedLearning.completedAt === 'string' ? storedLearning.completedAt : null
          };
        });
        if (progressLearningIds.includes(storedCourse.lastLearning)) fallback.courses[course.id].lastLearning = storedCourse.lastLearning;
      });
    } catch (_) {
      return fallback;
    }
    return fallback;
  };
  let academyProgress = loadProgress();
  const saveProgress = () => {
    try { localStorage.setItem(progressStorageKey, JSON.stringify(academyProgress)); } catch (_) { /* Storage may be unavailable in private or embedded contexts. */ }
  };
  const getCourseSummary = (course) => {
    const storedCourse = academyProgress.courses[course.id];
    const progressLearningIds = getProgressLearningIds(course);
    const states = progressLearningIds.map((learningId) => storedCourse.learnings[learningId].state);
    const completed = states.filter((state) => state === 'COMPLETED').length;
    const inProgress = states.some((state) => state === 'IN_PROGRESS');
    const state = completed === progressLearningIds.length ? 'COMPLETED' : (completed > 0 || inProgress ? 'IN_PROGRESS' : 'NOT_STARTED');
    const lastInProgress = storedCourse.lastLearning && storedCourse.learnings[storedCourse.lastLearning]?.state === 'IN_PROGRESS' ? storedCourse.lastLearning : null;
    let target = lastInProgress
      || progressLearningIds.find((learningId) => storedCourse.learnings[learningId].state === 'IN_PROGRESS')
      || progressLearningIds.find((learningId) => storedCourse.learnings[learningId].state === 'NOT_STARTED')
      || progressLearningIds[0];
    if (course.id === 'tbm' && state === 'NOT_STARTED') target = hasSeenTbmIntro() ? 'tbm-nine-steps' : 'tbm-purpose';
    return { completed, percent: Math.round((completed / progressLearningIds.length) * 100), state, target, total: progressLearningIds.length };
  };
  const statePresentation = {
    NOT_STARTED: { course: '대기중', learning: '미진입', cta: '시작하기' },
    IN_PROGRESS: { course: '학습진행', learning: '학습중', cta: '이어 학습하기' },
    COMPLETED: { course: '이수완료', learning: '✓ 완료', cta: '복습하기' }
  };
  const refreshProgressUI = () => {
    let totalCompleted = 0;
    let totalLearnings = 0;
    let activeCourses = 0;
    let pendingAssessments = 0;
    entryCourseCatalog.forEach((course) => {
      const summary = getCourseSummary(course);
      totalCompleted += summary.completed;
      totalLearnings += summary.total;
      if (summary.state !== 'NOT_STARTED') activeCourses += 1;
      if (summary.state === 'IN_PROGRESS') pendingAssessments += 1;
      document.querySelectorAll(`[data-progress-course="${course.id}"]`).forEach((scope) => {
        scope.classList.remove('is-course-not-started', 'is-course-in-progress', 'is-course-completed');
        scope.classList.add(`is-course-${summary.state.toLowerCase().replace('_', '-')}`);
        scope.querySelectorAll('[data-course-state]').forEach((element) => { element.textContent = statePresentation[summary.state].course; });
        scope.querySelectorAll('[data-course-progress]').forEach((element) => {
          element.textContent = element.closest('.figma-home-course') ? `진행상황: ${summary.percent}%` : `${summary.percent}% · ${summary.completed}/${summary.total} 완료`;
        });
        scope.querySelectorAll('[data-course-cta]').forEach((element) => {
          if (element.classList.contains('desktop-cta')) element.innerHTML = `${statePresentation[summary.state].cta} <i aria-hidden="true">→</i>`;
          else element.textContent = `${statePresentation[summary.state].cta} →`;
        });
        scope.querySelectorAll('[data-course-continue]').forEach((element) => {
          element.href = `#${summary.target}`;
          if (!element.hasAttribute('data-hero-fixed-label')) element.innerHTML = `${statePresentation[summary.state].cta} <i aria-hidden="true">→</i>`;
        });
        scope.querySelectorAll('[data-progress-learning]').forEach((row) => {
          const learningState = academyProgress.courses[course.id].learnings[row.dataset.progressLearning]?.state || 'NOT_STARTED';
          row.classList.remove('is-not-started', 'is-current', 'is-complete');
          row.classList.add(learningState === 'COMPLETED' ? 'is-complete' : learningState === 'IN_PROGRESS' ? 'is-current' : 'is-not-started');
          row.querySelectorAll('[data-learning-state]').forEach((element) => { element.textContent = statePresentation[learningState].learning; });
        });
      });
    });
    const totalPercent = totalLearnings ? Math.round((totalCompleted / totalLearnings) * 100) : 0;
    document.querySelectorAll('[data-academy-total-progress]').forEach((element) => { element.textContent = `내 학습 진행률 ${totalPercent}%`; });
    document.querySelectorAll('[data-academy-total-progress-bar]').forEach((element) => { element.style.setProperty('--academy-progress', `${totalPercent}%`); });
    document.querySelectorAll('[data-home-active-courses]').forEach((element) => { element.textContent = `${activeCourses}개 과정`; });
    document.querySelectorAll('[data-home-pending-assessments]').forEach((element) => { element.textContent = `${pendingAssessments}개 대기`; });
    const continueCourse = entryCourseCatalog.find((course) => getCourseSummary(course).state === 'IN_PROGRESS')
      || entryCourseCatalog.find((course) => getCourseSummary(course).state === 'NOT_STARTED')
      || entryCourseCatalog[0];
    const continueSummary = getCourseSummary(continueCourse);
    document.querySelectorAll('[data-academy-continue]').forEach((link) => {
      link.href = `#${continueSummary.target}`;
      link.textContent = continueSummary.state === 'NOT_STARTED' ? '안전학습 시작하기' : continueSummary.state === 'COMPLETED' ? '안전학습 복습하기' : '이어서 안전학습하기';
    });
    document.querySelectorAll('[data-learning-complete]').forEach((button) => {
      const courseId = progressCourseByLearning.get(button.dataset.learningComplete);
      const completed = courseId && academyProgress.courses[courseId].learnings[button.dataset.learningComplete].state === 'COMPLETED';
      button.textContent = completed ? '✓ 학습 완료' : '학습 완료';
      button.disabled = Boolean(completed);
    });
    const platformL01State = academyProgress.courses.platform.learnings.philosophy.state;
    const platformL01Percent = platformL01State === 'COMPLETED' ? 100 : 0;
    document.querySelectorAll('[data-platform-l01-percent]').forEach((element) => { element.textContent = `${platformL01Percent}%`; });
    document.querySelectorAll('[data-platform-l01-bar]').forEach((element) => { element.style.width = `${platformL01Percent}%`; });
    const platformCourseProgress = getCourseSummary(entryCourseCatalog[0]).percent;
    document.querySelectorAll('[data-platform-l02-percent]').forEach((element) => { element.textContent = `${platformCourseProgress}% 완료`; });
    document.querySelectorAll('[data-platform-l02-bar]').forEach((element) => { element.style.width = `${platformCourseProgress}%`; });
    document.querySelectorAll('[data-platform-l03-percent]').forEach((element) => { element.textContent = '학습 03 / 04'; });
    document.querySelectorAll('[data-platform-l03-bar]').forEach((element) => { element.style.width = `${platformCourseProgress}%`; });
    document.querySelectorAll('[data-platform-l04-percent]').forEach((element) => { element.textContent = '학습 04 / 04'; });
    document.querySelectorAll('[data-platform-l04-bar]').forEach((element) => { element.style.width = `${platformCourseProgress}%`; });
  };
  const markLearningEntered = (learningId) => {
    const courseId = progressCourseByLearning.get(learningId);
    if (!courseId) return;
    const courseProgress = academyProgress.courses[courseId];
    if (courseProgress.learnings[learningId].state === 'NOT_STARTED') courseProgress.learnings[learningId].state = 'IN_PROGRESS';
    courseProgress.lastLearning = learningId;
    saveProgress();
    refreshProgressUI();
  };
  const markLearningCompleted = (learningId) => {
    const courseId = progressCourseByLearning.get(learningId);
    if (!courseId) return;
    const learning = academyProgress.courses[courseId].learnings[learningId];
    learning.state = 'COMPLETED';
    learning.completedAt ||= new Date().toISOString();
    academyProgress.courses[courseId].lastLearning = learningId;
    saveProgress();
    refreshProgressUI();
  };
  mountExactPlatformDesktopLearning();
  syncPurePlatformDesktopContent();
  mountExactSpecialDesktopLearning();
  mountExactRiskDesktopLearning();
  document.addEventListener('click', (event) => {
    const platformL02Retry = event.target.closest?.('.platform-ready-02-practice [data-ready-retry]');
    if (!platformL02Retry) return;
    const practice = platformL02Retry.closest('.platform-ready-02-practice');
    practice.querySelectorAll('[data-ready-choice]').forEach((choice) => { choice.disabled = false; choice.classList.remove('is-selected','is-correct','is-incorrect'); });
    practice.querySelector('[data-ready-check]').disabled = true;
    practice.querySelector(':scope > aside').hidden = true;
    platformL02Retry.hidden = true;
  });
  document.querySelectorAll('[data-learning-complete]').forEach((button) => button.addEventListener('click', () => markLearningCompleted(button.dataset.learningComplete)));
  document.querySelectorAll('[data-complete-on-navigation]').forEach((link) => link.addEventListener('click', () => markLearningCompleted(link.dataset.completeOnNavigation)));
  document.querySelector('.tbm-ready-intro .tbm-ready-nav a[href="#tbm-nine-steps"]')?.addEventListener('click', () => {
    markTbmIntroSeen();
    refreshProgressUI();
  });
  window.onoffAcademyProgressQA = Object.freeze({
    reset() {
      localStorage.removeItem(progressStorageKey);
      localStorage.removeItem(tbmIntroSeenStorageKey);
      academyProgress = createDefaultProgress();
      refreshProgressUI();
      if (location.hash !== '#home') location.hash = 'home';
    },
    inspect() { return JSON.parse(JSON.stringify(academyProgress)); }
  });

  const applyLearningMode = (mode) => {
    selectedLearningMode = mode === 'action' ? 'action' : 'book';
    sessionStorage.setItem('academy-learning-mode', selectedLearningMode);
    if (modeName) modeName.textContent = selectedLearningMode === 'action' ? 'Action Mode' : 'Book Mode';
    if (modeDescription) modeDescription.textContent = selectedLearningMode === 'action' ? '한 Scene · 한 Action · Platform Help' : '스크롤 기반 Documentation';
    document.body.dataset.learningMode = selectedLearningMode;
  };

  const renderAcademyFlow = () => {
    const route = location.hash.slice(1) || 'home';
    syncDesktopHomeShell(route);
    document.body.dataset.academyView = route;
    resetViewScroll();
    const selectedLesson = lessonCatalog.find((lesson) => lesson.route === route)
      || lessonsByChapter.get(route)?.[0]
      || null;
    const isDesktopLearning = desktopHomeMedia.matches && Boolean(selectedLesson);
    document.body.classList.toggle('is-academy-desktop-learning', isDesktopLearning);
    document.body.dataset.desktopLearningCourse = selectedLesson?.book || '';
    if (selectedLesson) markLearningEntered(selectedLesson.chapter);
    const isPlatformFigmaChapter = selectedLesson?.book === 'platform' && platformMobileChapters.some((item) => item.id === selectedLesson.chapter);
    document.body.classList.toggle('is-platform-figma-chapter', isPlatformFigmaChapter);
    document.body.classList.toggle('is-ch03-mobile-golden', selectedLesson?.chapter === 'daily-work');
    if (isPlatformFigmaChapter) {
      platformMobileToc.querySelectorAll('[data-platform-toc-chapter]').forEach((link) => {
        const current = link.dataset.platformTocChapter === selectedLesson.chapter;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    } else {
      closePlatformMobileToc();
    }
    if (activeStickyChapterHeader) {
      document.getElementById(activeStickyChapterHeader.dataset.chapterOwner)?.insertAdjacentElement('afterbegin', activeStickyChapterHeader);
      activeStickyChapterHeader = null;
    }
    lessonStickyStack.hidden = !selectedLesson || isDesktopLearning;
    floatingLessonEnabled = false;
    floatingLessonNavigation.hidden = true;
    document.querySelectorAll('.lesson-progress-indicator').forEach((indicator) => indicator.remove());
    document.body.classList.toggle('is-lesson-view', Boolean(selectedLesson));
    document.body.classList.toggle('is-toc-view', route.endsWith('-book-toc'));
    document.body.dataset.lessonType = selectedLesson?.title.toLowerCase() || '';
    const chapterRoute = selectedLesson?.chapter || (route === 'workflow-action' || route.startsWith('scene-') ? 'workflow' : route);
    const homeRoutes = new Set(['home', 'library', 'safety-book', 'safety-book-mode', 'safety-book-complete', 'continue-reading', 'my-academy', ...bookRouteRegistry.keys()]);
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
      lesson.hidden = Boolean(selectedLesson) && (lesson.closest('.manual-section')?.id !== selectedLesson.chapter || (!isDesktopLearning && lesson.dataset.lesson !== selectedLesson.key));
    });
    if (selectedLesson) {
      const handbookLessons = lessonCatalog.filter((lesson) => lesson.book === selectedLesson.book);
      const lessonIndex = handbookLessons.indexOf(selectedLesson);
      const previous = handbookLessons[lessonIndex - 1];
      const next = handbookLessons[lessonIndex + 1];
      const previousCrossesChapter = Boolean(previous && previous.chapter !== selectedLesson.chapter);
      const previousItem = previous
        ? previousCrossesChapter
          ? `<a href="#${previous.route}">← 이전 학습</a>`
          : `<a href="#${previous.route}">← 이전 Lesson</a>`
        : '<span aria-disabled="true">← 이전 Lesson</span>';
      const isLastLesson = handbookLessons.at(-1) === selectedLesson;
      const nextCrossesChapter = Boolean(next && next.chapter !== selectedLesson.chapter);
      const nextItem = isLastLesson
        ? '<a class="handbook-complete" href="#home">다음 과정 →</a>'
        : nextCrossesChapter
          ? `<a href="#${next.route}">다음 학습 →</a>`
          : `<a href="#${next.route}">다음 Lesson →</a>`;
      const lessonNavigation = document.querySelector(`#${selectedLesson.chapter} .chapter-reading-nav`);
      const tocTarget = selectedLesson.book === 'tbm' ? 'tbm-course'
        : selectedLesson.book === 'risk' ? 'risk-course'
        : selectedLesson.book === 'practical' ? 'risk-practical-course'
        : selectedLesson.book === 'sop' ? 'sop-course'
        : selectedLesson.book === 'special' ? 'special-course'
        : 'platform-course';
      const chapterHeader = document.querySelector(`#${selectedLesson.chapter} .book-chapter-start`);
      if (isDesktopLearning) {
        const desktopCourse = desktopLearningCatalog[selectedLesson.book];
        const desktopIndex = desktopCourse?.sequence.findIndex(([chapterId]) => chapterId === selectedLesson.chapter) ?? -1;
        const previousChapter = desktopIndex > 0 ? desktopCourse.sequence[desktopIndex - 1] : null;
        const nextChapter = desktopIndex >= 0 ? desktopCourse.sequence[desktopIndex + 1] : null;
        const nextCourseIndex = entryCourseCatalog.findIndex((course) => course.id === selectedLesson.book) + 1;
        const nextCourse = entryCourseCatalog[nextCourseIndex];
        const desktopPrevious = previousChapter
          ? `<a href="#${previousChapter[0]}">← 이전 학습</a>`
          : '<span aria-disabled="true">← 이전 학습</span>';
        const desktopNext = nextChapter
          ? `<a href="#${nextChapter[0]}">다음 학습 →</a>`
          : `<a class="handbook-complete" href="#${nextCourse?.route || 'home'}">다음 과정 →</a>`;
        if (lessonNavigation) lessonNavigation.innerHTML = `${desktopPrevious}<a href="#${tocTarget}">학습 목록</a>${desktopNext}`;
      } else if (lessonNavigation) {
        lessonNavigation.innerHTML = `${previousItem}<a href="#${tocTarget}">학습 목록</a>${nextItem}`;
      }
      if (chapterHeader && !isDesktopLearning) {
        chapterHeader.dataset.chapterOwner = selectedLesson.chapter;
        lessonStickyStack.append(chapterHeader);
        activeStickyChapterHeader = chapterHeader;
      }
      const handbookChapters = bookChapterForm.filter((chapter) => chapter.book === selectedLesson.book && chapter.countInProgress !== false);
      const chapterProgressIndex = handbookChapters.findIndex((chapter) => chapter.id === selectedLesson.chapter) + 1;
      const chapterProgressTotal = handbookChapters.find((chapter) => chapter.id === selectedLesson.chapter)?.progressTotal || handbookChapters.length;
      if (!isDesktopLearning) {
        chapterHeader?.insertAdjacentHTML('beforeend', `<div class="lesson-progress-indicator"><span>학습 진행</span><strong>${chapterProgressIndex} / ${chapterProgressTotal}</strong></div>`);
        floatingLessonEnabled = true;
        floatingLessonNavigation.innerHTML = `${previousItem}<a href="#${tocTarget}">학습 목록</a>${nextItem}`;
        updateFloatingLessonNavigation();
      }
      const chapterLessons = lessonsByChapter.get(selectedLesson.chapter) || [];
      const completeLabel = document.querySelector(`#${selectedLesson.chapter} .chapter-complete-label`);
      if (completeLabel) {
        completeLabel.hidden = isDesktopLearning ? false : chapterLessons.at(-1) !== selectedLesson;
      }
    }
    if (!homeSection || !isHomeRoute) {
      resetViewScroll();
      return;
    }
    const visiblePart = route === 'library' ? 'library'
      : ['safety-book', 'safety-book-mode', 'safety-book-complete'].includes(route) ? 'safety-book'
      : bookRouteRegistry.get(route)
      || (route === 'my-academy' ? 'my-academy' : 'home');
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

  mountRemainingReadyDesktopLearning();
  document.querySelectorAll('[data-learning-mode-choice]').forEach((link) => link.addEventListener('click', () => applyLearningMode(link.dataset.learningModeChoice)));
  window.addEventListener('hashchange', renderAcademyFlow);
  desktopHomeMedia.addEventListener('change', renderAcademyFlow);
  desktopHomeMedia.addEventListener('change', syncPurePlatformDesktopContent);
  window.addEventListener('pageshow', resetViewScroll);
  applyLearningMode(selectedLearningMode);
  refreshProgressUI();
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
  const renderResults = (query) => { if (!searchResults) return; const value = query.trim().toLocaleLowerCase('ko'); const results = value ? chapterIndex.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('ko').includes(value)) : []; searchResults.innerHTML = !value ? '<p>검색어를 입력하면 관련 학습이 표시됩니다.</p>' : results.length ? results.map((item) => `<a href="#${item.id}"><strong>${item.title}</strong><span>${item.description}</span></a>`).join('') : '<p>일치하는 문서를 찾지 못했습니다.</p>'; };
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
      next.innerHTML = `<div><span>CONTINUE LEARNING</span><strong>다음 학습으로 이어가기</strong><p>현재 학습과 연결되는 Workflow를 계속 확인하세요.</p></div>${profile.next.map(([label, target]) => `<a href="#${target}">${label}<span>→</span></a>`).join('')}`;
      chapter.append(next);
    }
  });
})();
