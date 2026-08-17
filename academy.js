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
    { id: 'platform', route: 'platform-course', view: 'platform-landing', number: '01', tag: '기초 필수', title: 'ONOFF Safety Platform', description: '안전 관리 플랫폼의 설계 사상과 오늘 작업 선택부터 실제 서명까지의 핵심 Workflow를 학습합니다.', hero: 'assets/course-heroes/platform.png', time: '60분', standard: '퀴즈 80점', chapters: [['philosophy','ONOFF의 안전철학과 Platform 구조','플랫폼 도입 목적과 핵심 안전 흐름'],['workflow','Safety Start','안전정보 준비'],['daily-work','오늘 작업과 Daily Safety','오늘의 안전확인'],['safety-report','작업 중과 작업 종료','비정상 상황 대처 및 작업 종료']] },
    { id: 'risk', route: 'risk-course', view: 'risk-landing', number: '02', tag: '평가 관리', title: '위험성평가 (Risk Assessment)', description: '잠재적 유해·위험요인을 발견하고 위험성을 결정하여 체계적인 감소대책을 수립합니다.', hero: 'assets/course-heroes/risk-assessment.png', finalHero: 'assets/course-heroes/final-risk.png', time: '75분', standard: '제출물 통과', chapters: [['risk-assessment-purpose','위험성평가의 목적과 기본 원칙','법적 근거와 기본 원칙'],['risk-assessment-structure','위험성 판단과 감소대책','위험 수준 산정과 제거 방안'],['risk-assessment-stra','현장 실행과 지속 관리','대책 실행과 모니터링'],['risk-assessment-platform','ONOFF Platform 연결','결과 반영과 이행 확인']] },
    { id: 'practical', route: 'risk-practical-course', view: 'risk-practical-landing', number: '03', tag: '실무 서식 실습', title: '위험성평가 실무 작성', description: '현장 양식과 산업안전 보건지표 조사표를 직접 열어보고 정해진 서식을 기록하는 실무 코스입니다.', hero: 'assets/course-heroes/risk-practical.png', finalHero: 'assets/course-heroes/final-risk-practical.png', time: '3시간', standard: '4개 실습 제출', chapters: [['risk-practical-01','작업 확인과 위험요인 파악','공정별 표준 위험요인 매핑'],['risk-practical-02','최초 위험성과 안전조치','위험지수 산출과 조치 작성'],['risk-practical-03','감소대책과 재평가','대책 적용 후 재평가'],['risk-practical-04','개선 실행과 완료 확인','완료 증빙과 최종 검토']] },
    { id: 'sop', route: 'sop-course', view: 'sop-landing', number: '04', tag: '절차 이행', title: 'SOP 표준작업절차서', description: '고위험 공정의 안전수칙을 명확히 정의하고 올바르게 작업을 실행·이행하는 체계를 학습합니다.', hero: 'assets/course-heroes/sop.png', finalHero: 'assets/course-heroes/final-sop.png', time: '50분', standard: 'SOP 서명', chapters: [['sop-purpose','SOP의 목적과 핵심 구조','SOP의 정의와 도입 목적'],['sop-reading','작업 준비와 실행','필수 Sequence 수행'],['sop-structure','변경과 비정상 상황','중지와 관리자 알림'],['sop-platform','ONOFF Platform 연결','이행 결과 확인과 보존']] },
    { id: 'tbm', route: 'tbm-course', view: 'tbm-landing', number: '05', tag: '매일 진행', title: 'TBM (Tool Box Meeting)', description: '작업 개시 전 감독자를 중심으로 현장에서 직접 소통하는 10분 밀착 미팅의 핵심 가이드를 익힙니다.', hero: 'assets/course-heroes/tbm.png', finalHero: 'assets/course-heroes/final-tbm.png', time: '30분', standard: '서명 참여율', chapters: [['tbm-purpose','TBM의 목적과 기본 원칙','컨디션과 보호구 확인'],['tbm-nine-steps','위험 공유와 사고사례','작업별 위험요인 공유'],['tbm-scenario','대응 준비와 작업 시작','비상행동과 미팅 마감']] },
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
  desktopGlobalHeader.innerHTML = `<a href="#home"><i>O</i><strong>ONOFF Academy</strong></a><nav aria-label="Academy Global Navigation"><a href="#home">학습 라이브러리</a><span aria-disabled="true" title="V2 예정">나의 강의실</span><span aria-disabled="true" title="V2 예정">안전 자료실</span><b title="V2 예정">● 홍길동 작업자</b></nav>`;
  document.querySelector('.academy-shell')?.before(desktopGlobalHeader);
  const syncDesktopHomeShell = (route) => {
    const useDesktopAcademyShell = desktopHomeMedia.matches;
    const useFigmaHomeShell = route === 'home' && useDesktopAcademyShell;
    const useCourseLandingHeader = useDesktopAcademyShell && entryCourseCatalog.some((course) => course.route === route);
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
  const renderDesktopCourseHeader = () => `<header class="figma-course-global-header"><a href="#home"><i>O</i><strong>ONOFF Academy</strong></a><div><a href="#home">← 학습 라이브러리</a><span class="is-reserved" aria-disabled="true" title="V2 예정">나의 강의실</span><span class="is-reserved" aria-disabled="true" title="V2 예정">안전 자료실</span><span class="user-context">● 홍길동 작업자</span></div></header>`;
  const renderDesktopCourseHero = (course) => `<section class="academy-course-hero figma-course-hero" style="--course-art:url('${course.hero}')">${course.id === 'platform' ? `<div class="figma-platform-hero-artwork" aria-hidden="true"><img class="figma-platform-art-image" src="${course.hero}" alt=""><span class="figma-platform-art-multiply"></span><span class="figma-platform-art-color"></span><span class="figma-platform-art-left"></span><img class="figma-platform-art-top" src="assets/course-heroes/platform-gradient-top.png" alt=""><img class="figma-platform-art-bottom" src="assets/course-heroes/platform-gradient-bottom.png" alt=""><span class="figma-platform-art-right"></span></div>` : `<img class="academy-course-hero-artwork" src="${course.finalHero}" alt="" aria-hidden="true">`}<div class="figma-course-hero-copy"><div class="figma-course-module"><b>${course.number}</b><span><small>COURSE MODULE</small>${course.tag}</span><em>${course.tag}</em></div><h1>${course.title}</h1><strong>${course.description}</strong><div class="figma-course-hero-actions"><a href="#${course.chapters[0][0]}" data-course-continue>학습 시작하기 <i>→</i></a></div></div></section>`;
  const renderDesktopLearningPoints = (data) => `<section class="academy-course-section academy-course-learning-points figma-course-intro"><h2>${data.pointsTitle || '무엇을 배우게 되나요? <small>(What You Will Learn)</small>'}</h2><div>${data.points.map(([title,description],index) => `<article><span>${String(index+1).padStart(2,'0')}</span><div><strong>${title}</strong><p>${description}</p></div></article>`).join('')}</div></section>`;
  const renderDesktopCurriculum = (course) => `<section class="academy-course-section academy-course-curriculum figma-course-curriculum"><header><h2>커리큘럼 및 학습 목차</h2><span data-course-progress>0% · 0/${course.chapters.length} 완료</span></header><ol>${course.chapters.map(([route,title,description],index) => `<li class="is-not-started" data-progress-learning="${route}"><a href="#${route}"><span>${String(index+1).padStart(2,'0')}</span><div><strong>학습 ${String(index+1).padStart(2,'0')} — ${title}</strong><p>${description}</p></div><em data-learning-state>미진입</em></a></li>`).join('')}</ol></section>`;
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
  const documentRoot = document.querySelector('.document');
  riskPracticalLearning.forEach((learning) => {
    const section = document.createElement('section');
    section.className = 'manual-section risk-practical-learning';
    section.id = learning.id;
    section.hidden = true;
    section.innerHTML = `<section class="risk-practical-content"><header class="risk-practical-hero"><p>COURSE 03 · RISK PRACTICAL · 학습 ${learning.number}</p><strong>${learning.number}</strong><h2>${learning.title}</h2><span>${learning.description}</span><div><small>진행률 ${Number(learning.number) * 25}%</small><small>학습 ${learning.number} / 04</small></div></header><div class="risk-practical-sections">${learning.sections.map(([tag,title,body]) => `<section><b>${tag}</b><h2>${title}</h2><p>${body}</p></section>`).join('')}</div><section class="risk-practical-forms"><header><b>ACTUAL FORM</b><h2>실제 양식에서 확인하기</h2><p>확대하여 실제 작성 영역과 항목을 확인합니다.</p></header><div>${learning.forms.map((form) => `<figure><img src="assets/risk-practical/forms/form-${form}.png" alt="FORM-${form} 위험성평가 실무 양식" loading="lazy"><figcaption>FORM-${form}</figcaption></figure>`).join('')}</div></section>${(learning.practices || [learning.practice]).map(renderRiskPracticalPractice).join('')}${learning.number === '04' ? '<section class="risk-practical-course-complete"><b>COURSE COMPLETE</b><h2>위험성평가 실무 작성 교육 완료</h2><p>위험요인 확인부터 현장 개선 완료 증빙까지 실무 작성의 전체 흐름을 확인했습니다.</p></section>' : ''}</section><nav class="chapter-reading-nav" aria-label="학습 이동"></nav>`;
    documentRoot?.append(section);
    chapters.push(section);
    chapterIndex.push({ id: learning.id, title: learning.title, description: learning.description });
    section.querySelectorAll('.risk-practical-practice').forEach((practiceRoot) => {
      const choices = [...practiceRoot.querySelectorAll('[data-risk-practical-answer]')];
      const check = practiceRoot.querySelector('[data-risk-practical-check]');
      const result = practiceRoot.querySelector(':scope > aside');
      choices.forEach((choice) => choice.addEventListener('click', () => { choices.forEach((item) => item.classList.toggle('is-selected', item === choice)); check.disabled = false; }));
      check.addEventListener('click', () => { const selected = choices.find((item) => item.classList.contains('is-selected')); if (!selected) return; const correct = selected.dataset.riskPracticalAnswer === practiceRoot.dataset.answer; choices.forEach((item) => { item.disabled = true; item.classList.remove('is-selected'); item.classList.toggle('is-correct', item.dataset.riskPracticalAnswer === practiceRoot.dataset.answer); item.classList.toggle('is-incorrect', item === selected && !correct); }); check.disabled = true; result.hidden = false; result.querySelector('strong').textContent = correct ? 'Correct' : 'Incorrect'; });
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
  window.addEventListener('popstate', () => { if (academyImageViewer.open) closeAcademyImageViewer({ fromHistory: true }); });
  document.querySelectorAll('.manual-section figure img').forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `${image.alt || '학습 이미지'} 확대 보기`);
  });
  const openLearningFigure = (image) => openAcademyImageViewer({ src: image.currentSrc || image.src, alt: image.alt, title: image.closest('figure')?.querySelector('figcaption')?.textContent.trim() || image.alt, trigger: image });
  document.addEventListener('click', (event) => {
    const image = event.target.closest?.('.manual-section figure img');
    if (image) openLearningFigure(image);
  });
  document.addEventListener('keydown', (event) => {
    const image = event.target.closest?.('.manual-section figure img');
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
      if (courseId === 'platform' || courseId === 'risk') return;
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
      <article class="risk-ready-desktop-learning" data-figma-source="174:4" data-ready-inventory="why|what|definition|flow|find|example|method|chain-diagram|perspective|seven-step-flow|summary|practice|complete" aria-labelledby="risk-ready-01-title">
        <header class="risk-ready-hero"><div><p><strong>01</strong><span><b>PART 01 · 위험성평가 기초</b><small>CH01 · 1 / 4 Lessons</small></span></p><h1 id="risk-ready-01-title">위험성평가의 이해</h1><h2>위험을 미리 찾고 체계적으로 이해하는 안전의 첫걸음</h2><p>위험성평가는 사고가 발생하기 전 현장 곳곳의 위험요인을 찾아 개선대책을 세우는 핵심 예방 프로세스입니다.</p></div><aside><b>이 Chapter에서 배울 내용</b>${['위험성평가가 현장에 필요한 이유','숨겨진 유해·위험요인을 찾는 방법','조건에 따라 위험을 바라보는 관점'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
        <section class="risk-ready-section" data-ready-section="why"><b class="risk-ready-tag">WHY</b><h2>왜 위험성평가가 필요한가</h2><blockquote>“사고는 예측할 수 없지만, 위험은 미리 찾을 수 있습니다.”</blockquote><div class="risk-ready-compare"><article><strong>위험성평가 없이</strong><p>현장의 고유 위험을 인지하지 못하고 작업을 시작합니다.</p><small>사고 발생 후 대응</small></article><article><strong>위험성평가 후</strong><p>작업 전에 위험요인을 찾아 제거하고 대책을 공유합니다.</p><small>사고 발생 전 예방</small></article></div></section>
        <section class="risk-ready-section" data-ready-section="what"><b class="risk-ready-tag">WHAT</b><h2>위험성평가란 무엇인가</h2><p>작업의 위험요인을 미리 찾고 위험의 크기를 판단하여 사고가 발생하기 전에 개선하는 현장 안전활동입니다.</p>${cards([['위험요인 발견','작업 과정에서 발생할 수 있는 위험을 찾습니다.'],['위험성 판단','발견한 위험이 얼마나 중요한지 평가합니다.'],['개선대책 수립','위험을 제거하거나 낮출 방법을 결정합니다.'],['작업자 공유','평가 결과와 안전조치를 전달합니다.']])}</section>
        <section class="risk-ready-section" data-ready-section="definition"><b class="risk-ready-tag">DEFINITION</b><h2>서류가 아니라 예방 활동입니다</h2><p>평가표 작성 자체가 목적이 아닙니다. 현장의 위험이 실제로 낮아지고 작업자가 대책을 이해해야 완료됩니다.</p><aside class="risk-ready-callout">평가표의 완료가 아니라 현장의 위험이 실제로 낮아졌는지 확인합니다.</aside></section>
        <section class="risk-ready-section" data-ready-section="flow"><b class="risk-ready-tag">FLOW</b><h2>위험성평가 기본 흐름</h2>${flow(['작업 확인','위험요인 발굴','위험성 평가','개선대책','작업자 공유','작업','재평가'])}</section>
        <section class="risk-ready-section risk-ready-visual" data-ready-section="find"><b class="risk-ready-tag">FIND</b><h2>현장의 위험을 찾습니다</h2><figure><img src="assets/risk-assessment/chapter-01-why-v2.png" alt="작업 정의부터 위험요인 발견, 평가, 안전조치와 재평가까지의 위험성평가 Summary"></figure></section>
        <section class="risk-ready-section" data-ready-section="example"><b class="risk-ready-tag">EXAMPLE</b><h2>같은 작업도 조건에 따라 위험이 달라집니다</h2>${cards([['설비','가동·정지·정비 상태'],['장소','높이·통로·주변 작업'],['사람','숙련도·협업·접근'],['환경','조도·소음·날씨']])}</section>
        <section class="risk-ready-section" data-ready-section="method"><b class="risk-ready-tag">METHOD</b><h2>위험을 빠뜨리지 않는 질문</h2>${cards([['무엇을 하는가','작업 단계와 범위'],['무엇 때문에 위험한가','유해·위험요인'],['어떤 사고가 가능한가','재해 형태와 원인'],['어떻게 낮출 것인가','실제 적용할 대책']])}</section>
        <section class="risk-ready-section" data-ready-section="chain-diagram"><b class="risk-ready-tag">CHAIN</b><h2>위험은 연결되어 사고가 됩니다</h2>${flow(['작업 조건','유해·위험요인','위험 노출','사고 발생','피해 결과'])}</section>
        <section class="risk-ready-section" data-ready-section="perspective"><b class="risk-ready-tag">PERSPECTIVE</b><h2>작업자가 함께 봐야 합니다</h2><p>관리자의 문서만으로는 실제 작업의 모든 변화를 찾기 어렵습니다. 작업자가 경험한 아차사고와 불편, 조건 변화를 함께 확인합니다.</p><aside class="risk-ready-callout">오늘의 설비·장소·작업 조건에서 새롭게 발생한 위험이 없는지 함께 확인합니다.</aside></section>
        <section class="risk-ready-section" data-ready-section="seven-step-flow"><b class="risk-ready-tag">7 STEP</b><h2>예방에서 재평가까지</h2>${flow(['작업 범위 확인','위험 발굴','가능성 판단','중대성 판단','대책 수립','현장 적용','개선 후 재평가'])}</section>
        <section class="risk-ready-section" data-ready-section="summary"><b class="risk-ready-tag">SUMMARY</b><h2>핵심 정리</h2>${cards([['사전 예방','사고가 나기 전에 찾습니다.'],['현장 참여','작업자가 위험 발굴에 참여합니다.'],['실제 반영','SOP와 TBM, 작업에 연결합니다.'],['지속 개선','조치 후 다시 확인합니다.']])}</section>
        ${practice('위험성평가의 가장 중요한 목적은 무엇일까요?','B',[['A','문서를 많이 만드는 것'],['B','작업 전 위험을 찾아 사고를 예방하는 것'],['C','사고 뒤 책임자를 찾는 것'],['D','모든 작업을 같은 기준으로 처리하는 것']],'정답은 B입니다. 위험성평가는 작업 전에 위험을 찾아 실제 사고 가능성을 낮추는 예방 활동입니다.')}
        ${complete('risk-assessment-purpose','위험성평가의 이해',['작업 전 위험요인을 찾습니다.','위험의 크기를 판단합니다.','대책을 현장에 적용하고 다시 평가합니다.'],null,'risk-assessment-structure')}
      </article>`);

    const risk02 = document.getElementById('risk-assessment-structure');
    if (risk02 && !risk02.querySelector(':scope > .risk-ready-desktop-learning')) risk02.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning" data-figma-source="174:332" data-ready-inventory="visual-example|risk-matrix|decision-flow|step-matrix|rating-cards|scenarios|hierarchy-diagram|practice|complete" aria-labelledby="risk-ready-02-title">
        <header class="risk-ready-hero"><div><p><strong>02</strong><span><b>PART 02 · 위험성 판단</b><small>CH02 · 2 / 4 Lessons</small></span></p><h1 id="risk-ready-02-title">위험성 판단과 감소대책</h1><h2>작업과 위험, 판단과 조치를 하나의 흐름으로 읽습니다</h2><p>위험성평가표의 구조를 이해하고 위험수준을 판단한 뒤 가장 효과적인 감소대책을 선택합니다.</p></div><aside><b>이 Chapter에서 배울 내용</b>${['평가표를 읽는 순서','위험수준 판단 기준','감소대책의 우선순위'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
        <section class="risk-ready-section risk-ready-visual" data-ready-section="visual-example"><b class="risk-ready-tag">VISUAL EXAMPLE</b><h2>실제 평가표를 왼쪽에서 오른쪽으로 읽습니다</h2><figure><img src="assets/risk-assessment/chapter-02/page-02-work-and-hazard.png" alt="작업과 유해 위험요인을 보여주는 S-TRA 평가표"></figure>${flow(['작업 확인','유해·위험요인','재해·발생원인','최초 위험성','안전조치','현재 위험성'])}</section>
        <section class="risk-ready-section risk-ready-visual" data-ready-section="risk-matrix"><b class="risk-ready-tag">RISK MATRIX</b><h2>가능성과 중대성으로 위험수준을 판단합니다</h2><figure><img src="assets/risk-assessment/chapter-03/risk-matrix.png" alt="가능성과 중대성을 조합한 위험성 판단 Matrix"></figure></section>
        <section class="risk-ready-section" data-ready-section="decision-flow"><b class="risk-ready-tag">DECISION FLOW</b><h2>점수보다 판단의 근거가 먼저입니다</h2>${flow(['현재 조건 확인','가능성 판단','중대성 판단','위험등급 결정','허용 여부 판단'])}</section>
        <section class="risk-ready-section" data-ready-section="step-matrix"><b class="risk-ready-tag">STEP MATRIX</b><h2>하나의 Row를 끝까지 연결합니다</h2>${cards([['작업','무슨 작업인가'],['위험','무엇 때문에 위험한가'],['사고','어떤 결과가 가능한가'],['대책','무엇을 적용했는가'],['재평가','위험이 낮아졌는가']])}</section>
        <section class="risk-ready-section" data-ready-section="rating-cards"><b class="risk-ready-tag">RATING</b><h2>현재 위험성과 잔여 위험을 구분합니다</h2>${cards([['최초 위험성','조치 전 위험수준을 평가합니다.'],['현재 위험성','기존 조치를 반영한 수준입니다.'],['잔여 위험','추가 대책 뒤에도 남는 위험입니다.']])}</section>
        <section class="risk-ready-section risk-ready-visual" data-ready-section="scenarios"><b class="risk-ready-tag">SCENARIO</b><h2>수직 사다리 작업 사례</h2><div class="risk-ready-gallery"><img src="assets/risk-assessment/chapter-02/page-03-work.png" alt="수직 사다리 작업"><img src="assets/risk-assessment/chapter-02/page-03-hazard.png" alt="사다리 작업 위험요인"><img src="assets/risk-assessment/chapter-02/page-03-controls.png" alt="사다리 작업 안전조치"><img src="assets/risk-assessment/chapter-02/page-03-current-risk.png" alt="조치 후 현재 위험성"></div></section>
        <section class="risk-ready-section" data-ready-section="hierarchy-diagram"><b class="risk-ready-tag">CONTROL HIERARCHY</b><h2>위험 감소대책의 우선순위</h2>${flow(['제거','대체','공학적 제어','관리적 제어','개인보호구'])}<aside class="risk-ready-callout">가능하면 위험 자체를 제거하고, 개인보호구는 마지막 방어수단으로 사용합니다.</aside></section>
        ${practice('위험성평가표를 읽을 때 가장 먼저 확인해야 하는 것은?','A',[['A','평가 대상 작업'],['B','최종 점수'],['C','작성자 이름'],['D','개인보호구 종류']],'정답은 A입니다. 먼저 무슨 작업을 평가하는지 확인한 뒤 위험과 조치를 연결합니다.')}
        ${complete('risk-assessment-structure','위험성 판단과 감소대책',['평가표는 작업에서 시작해 위험과 대책으로 읽습니다.','가능성과 중대성의 근거를 확인합니다.','감소대책은 제거부터 우선 검토합니다.'],'risk-assessment-purpose','risk-assessment-stra')}
      </article>`);

    const risk03 = document.getElementById('risk-assessment-stra');
    if (risk03 && !risk03.querySelector(':scope > .risk-ready-desktop-learning')) risk03.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning" data-figma-source="174:658" data-ready-inventory="execution|key-concept|participation|documentation|change-management|trigger-cards|flow-diagram|continuous-cycle|step-summary|practice|complete" aria-labelledby="risk-ready-03-title">
        <header class="risk-ready-hero"><div><p><strong>03</strong><span><b>PART 03 · 현장 실행</b><small>CH03 · 3 / 4 Lessons</small></span></p><h1 id="risk-ready-03-title">현장 실행과 지속 관리</h1><h2>평가 결과를 작업에 적용하고 변화에 따라 다시 확인합니다</h2><p>위험성평가를 현장 행동으로 전환하고 작업자 참여, 기록, 변경관리를 통해 지속적으로 개선합니다.</p></div><aside><b>이 Chapter에서 배울 내용</b>${['평가 결과의 현장 실행','작업자 참여와 기록','변경 시 재평가 기준'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
        <section class="risk-ready-section" data-ready-section="execution"><b class="risk-ready-tag">EXECUTION</b><h2>대책이 현장에서 실행되어야 합니다</h2><p>평가표에 적힌 안전조치가 설비, 작업방법, 교육과 보호구에 실제 반영되었는지 확인합니다.</p>${flow(['대책 결정','담당자 지정','현장 적용','작업자 확인','효과 확인'])}</section>
        <section class="risk-ready-section" data-ready-section="key-concept"><b class="risk-ready-tag">KEY CONCEPT</b><h2>위험성평가는 살아있는 기준입니다</h2><blockquote>작업이 변하면 위험도 다시 봐야 합니다.</blockquote><aside class="risk-ready-callout">한 번 작성한 평가를 영구 기준으로 사용하지 않습니다.</aside></section>
        <section class="risk-ready-section" data-ready-section="participation"><b class="risk-ready-tag">PARTICIPATION</b><h2>작업자가 위험 발굴에 참여합니다</h2>${cards([['작업 경험','실제 작업에서 느낀 위험'],['아차사고','사고로 이어질 뻔한 상황'],['불편·이상','반복되는 문제와 변화'],['개선 제안','현장에서 가능한 대책']])}</section>
        <section class="risk-ready-section" data-ready-section="documentation"><b class="risk-ready-tag">DOCUMENTATION</b><h2>판단과 조치의 근거를 남깁니다</h2><p>평가일, 참여자, 작업조건, 판단 근거, 적용한 대책과 확인 결과를 기록해 다음 작업에서 다시 확인할 수 있게 합니다.</p></section>
        <section class="risk-ready-section" data-ready-section="change-management"><b class="risk-ready-tag">CHANGE MANAGEMENT</b><h2>변경은 재평가의 신호입니다</h2>${cards([['설비 변경','기계·도구·보호장치'],['작업방법 변경','순서·인원·시간'],['물질 변경','원료·화학물질'],['환경 변경','장소·날씨·주변 작업']])}</section>
        <section class="risk-ready-section" data-ready-section="trigger-cards"><b class="risk-ready-tag">TRIGGER</b><h2>즉시 다시 확인해야 하는 상황</h2>${cards([['사고·아차사고','기존 평가가 충분했는지 확인'],['새로운 위험 발견','평가 대상과 대책에 반영'],['대책 효과 부족','추가 감소대책 검토'],['법규·기준 변경','평가 기준 업데이트']])}</section>
        <section class="risk-ready-section" data-ready-section="flow-diagram"><b class="risk-ready-tag">FLOW</b><h2>변경 발견에서 재평가까지</h2>${flow(['변경·이상 발견','작업 조건 확인','위험 재판단','추가 대책 적용','작업자 공유','재개 여부 결정'])}</section>
        <section class="risk-ready-section" data-ready-section="continuous-cycle"><b class="risk-ready-tag">CONTINUOUS CYCLE</b><h2>지속적인 개선 Cycle</h2>${flow(['평가','대책','실행','확인','개선','재평가'])}</section>
        <section class="risk-ready-section" data-ready-section="step-summary"><b class="risk-ready-tag">SUMMARY</b><h2>현장 실행 핵심</h2>${cards([['실행','정한 대책을 실제 적용합니다.'],['참여','작업자의 경험을 반영합니다.'],['기록','판단과 조치의 근거를 남깁니다.'],['재평가','변화와 결과를 다시 확인합니다.']])}</section>
        ${practice('작업조건이 기존 평가와 달라졌을 때 가장 먼저 해야 할 행동은?','C',[['A','기존 평가대로 계속 작업'],['B','개인보호구만 추가'],['C','작업을 멈추고 변경된 위험을 다시 확인'],['D','작업 종료 후 기록']],'정답은 C입니다. 조건이 달라졌다면 작업을 계속하기 전에 위험과 추가 조치를 다시 확인합니다.')}
        ${complete('risk-assessment-stra','현장 실행과 지속 관리',['대책은 현장에 실제 적용되어야 합니다.','작업자 참여와 기록이 필요합니다.','변경이 생기면 위험을 다시 평가합니다.'],'risk-assessment-structure','risk-assessment-platform')}
      </article>`);

    const risk04 = document.getElementById('risk-assessment-platform');
    if (risk04 && !risk04.querySelector(':scope > .risk-ready-desktop-learning')) risk04.insertAdjacentHTML('beforeend', `
      <article class="risk-ready-desktop-learning" data-figma-source="174:999" data-ready-inventory="daily-safety|key-concept|flow-visualizer|path-a|path-b|summary|comparison-table|practice|course-complete" aria-labelledby="risk-ready-04-title">
        <header class="risk-ready-hero"><div><p><strong>04</strong><span><b>PART 04 · ONOFF PLATFORM PRACTICE</b><small>CH04 · 4 / 4 · COURSE FINAL</small></span></p><h1 id="risk-ready-04-title">ONOFF Platform 연결</h1><h2>위험성평가를 ONOFF에서 어떻게 이어가는가</h2><p>위험성평가 이론과 판단 기준을 Daily Safety의 실제 작업 흐름에 연결합니다.</p></div><aside><b>이 Chapter에서 배울 내용</b>${['Daily Safety 연결 방식','연결·미연결 두 경로의 차이','위험성평가 전체 내용 종합 확인'].map((item,index)=>`<p><span>${index+1}</span>${item}</p>`).join('')}</aside></header>
        <section class="risk-ready-section" data-ready-section="daily-safety"><b class="risk-ready-tag">ONOFF</b><h2>ONOFF Daily Safety와 위험성평가</h2><p>오늘 작업 확인 후 정식 위험성평가 데이터의 연결 여부에 따라 필요한 안전 확인 경로가 열립니다.</p></section>
        <section class="risk-ready-section" data-ready-section="key-concept"><b class="risk-ready-tag">KEY CONCEPT</b><h2>실체적 행동으로 이어지는 연결망</h2><blockquote>“위험성평가를 읽는 것에서 오늘의 안전행동으로.”</blockquote></section>
        <section class="risk-ready-section" data-ready-section="flow-visualizer"><b class="risk-ready-tag">DAILY SAFETY FLOW</b><h2>작업 확인에서 Safety Start까지</h2>${flow(['오늘 작업 확인','위험성평가 매핑','분기 경로 진입','위험·조치 확인','전자서명','Safety Start'])}</section>
        <section class="risk-ready-section" data-ready-section="path-a"><b class="risk-ready-tag">PATH A · LINKED</b><h2>정식 위험성평가가 있는 작업</h2>${flow(['오늘 작업 선택','연결된 평가 확인','핵심 위험 확인','안전조치 확인','관련 SOP','전자서명','Safety Start'])}<aside class="risk-ready-callout">평가서를 매일 다시 작성하지 않고 오늘도 위험과 조치가 유효한지 확인합니다.</aside></section>
        <section class="risk-ready-section" data-ready-section="path-b"><b class="risk-ready-tag">PATH B · UNLINKED</b><h2>정식 위험성평가가 없는 작업</h2>${flow(['작업·대응유형 확인','Daily Risk Check','위험유형 선택','핵심 안전조치','관련 SOP','전자서명','Safety Start'])}<aside class="risk-ready-callout">Daily Risk Check는 정식 위험성평가를 즉석에서 작성하거나 대체하는 기능이 아닙니다.</aside></section>
        <section class="risk-ready-section" data-ready-section="summary"><b class="risk-ready-tag">SUMMARY</b><h2>두 경로의 공통 목표</h2>${cards([['위험 확인','오늘 작업의 실제 위험을 확인합니다.'],['조치 확인','필요한 안전조치의 적용 상태를 봅니다.'],['절차 연결','관련 SOP와 전자서명을 확인합니다.'],['안전 시작','확인 완료 후 Safety Start로 이동합니다.']])}</section>
        <section class="risk-ready-section" data-ready-section="comparison-table"><b class="risk-ready-tag">COMPARISON</b><h2>Path A와 Path B</h2><div class="risk-ready-table"><div><b>구분</b><b>Path A · 연결됨</b><b>Path B · 미연결</b></div><div><span>기준</span><span>정식 위험성평가</span><span>Daily Risk Check</span></div><div><span>확인</span><span>기존 위험·안전조치</span><span>오늘의 위험유형·조치</span></div><div><span>공통</span><span>관련 SOP · 전자서명 · Safety Start</span><span>관련 SOP · 전자서명 · Safety Start</span></div></div></section>
        ${practice('정식 위험성평가가 연결되지 않은 작업에서 수행해야 하는 것은?','B',[['A','위험 확인 없이 작업 시작'],['B','Daily Risk Check로 위험유형과 조치 확인'],['C','즉석에서 정식 S-TRA 작성'],['D','SOP 확인 생략']],'정답은 B입니다. 정식 평가가 없으면 Daily Risk Check로 오늘의 위험과 안전조치를 확인합니다.')}
        ${complete('risk-assessment-platform','ONOFF Platform 연결',['위험성평가는 Daily Safety에서 오늘의 작업과 연결됩니다.','연결 여부에 따라 두 경로로 안전을 확인합니다.','두 경로 모두 SOP, 전자서명, Safety Start로 이어집니다.'],'risk-assessment-stra',null)}
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
  const learningStates = new Set(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
  const progressCourseByLearning = new Map();
  entryCourseCatalog.forEach((course) => course.chapters.forEach(([learningId]) => progressCourseByLearning.set(learningId, course.id)));
  const createDefaultProgress = () => ({
    version: progressStorageVersion,
    courses: Object.fromEntries(entryCourseCatalog.map((course) => [course.id, {
      lastLearning: null,
      learnings: Object.fromEntries(course.chapters.map(([learningId]) => [learningId, { state: 'NOT_STARTED', completedAt: null }]))
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
        course.chapters.forEach(([learningId]) => {
          const storedLearning = storedCourse.learnings[learningId];
          if (!storedLearning || !learningStates.has(storedLearning.state)) return;
          fallback.courses[course.id].learnings[learningId] = {
            state: storedLearning.state,
            completedAt: storedLearning.state === 'COMPLETED' && typeof storedLearning.completedAt === 'string' ? storedLearning.completedAt : null
          };
        });
        if (course.chapters.some(([learningId]) => learningId === storedCourse.lastLearning)) fallback.courses[course.id].lastLearning = storedCourse.lastLearning;
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
    const states = course.chapters.map(([learningId]) => storedCourse.learnings[learningId].state);
    const completed = states.filter((state) => state === 'COMPLETED').length;
    const inProgress = states.some((state) => state === 'IN_PROGRESS');
    const state = completed === course.chapters.length ? 'COMPLETED' : (completed > 0 || inProgress ? 'IN_PROGRESS' : 'NOT_STARTED');
    const lastInProgress = storedCourse.lastLearning && storedCourse.learnings[storedCourse.lastLearning]?.state === 'IN_PROGRESS' ? storedCourse.lastLearning : null;
    const target = lastInProgress
      || course.chapters.find(([learningId]) => storedCourse.learnings[learningId].state === 'IN_PROGRESS')?.[0]
      || course.chapters.find(([learningId]) => storedCourse.learnings[learningId].state === 'NOT_STARTED')?.[0]
      || course.chapters[0][0];
    return { completed, percent: Math.round((completed / course.chapters.length) * 100), state, target };
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
      totalLearnings += course.chapters.length;
      if (summary.state !== 'NOT_STARTED') activeCourses += 1;
      if (summary.state === 'IN_PROGRESS') pendingAssessments += 1;
      document.querySelectorAll(`[data-progress-course="${course.id}"]`).forEach((scope) => {
        scope.classList.remove('is-course-not-started', 'is-course-in-progress', 'is-course-completed');
        scope.classList.add(`is-course-${summary.state.toLowerCase().replace('_', '-')}`);
        scope.querySelectorAll('[data-course-state]').forEach((element) => { element.textContent = statePresentation[summary.state].course; });
        scope.querySelectorAll('[data-course-progress]').forEach((element) => {
          element.textContent = element.closest('.figma-home-course') ? `진행상황: ${summary.percent}%` : `${summary.percent}% · ${summary.completed}/${course.chapters.length} 완료`;
        });
        scope.querySelectorAll('[data-course-cta]').forEach((element) => {
          if (element.classList.contains('desktop-cta')) element.innerHTML = `${statePresentation[summary.state].cta} <i aria-hidden="true">→</i>`;
          else element.textContent = `${statePresentation[summary.state].cta} →`;
        });
        scope.querySelectorAll('[data-course-continue]').forEach((element) => {
          element.href = `#${summary.target}`;
          element.innerHTML = `${statePresentation[summary.state].cta} <i aria-hidden="true">→</i>`;
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
  window.onoffAcademyProgressQA = Object.freeze({
    reset() {
      localStorage.removeItem(progressStorageKey);
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
