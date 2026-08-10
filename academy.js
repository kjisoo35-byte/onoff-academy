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
  const modeName = document.querySelector('[data-selected-learning-mode]');
  const modeDescription = document.querySelector('[data-selected-mode-description]');
  const globalPager = document.querySelector('.document > .chapter-pager');
  const lessonStickyStack = document.createElement('div');
  lessonStickyStack.className = 'lesson-sticky-stack';
  lessonStickyStack.hidden = true;
  breadcrumb?.insertAdjacentElement('beforebegin', lessonStickyStack);
  if (breadcrumb) lessonStickyStack.append(breadcrumb);
  let activeStickyChapterHeader = null;
  document.querySelectorAll('.academy-hero,.home-discovery,.library-section,.book-overview,.learning-mode-section,.book-complete-view,.book-platform-link,.my-academy-card').forEach((element) => element.remove());
  const bookChapterForm = [
    { id: 'philosophy', book: 'platform', part: '01', partTitle: 'Platform', chapter: '01', title: 'Platform Philosophy', next: 'workflow' },
    { id: 'workflow', book: 'platform', chapter: '02', title: '전체 Workflow', previous: 'philosophy', next: 'daily-work' },
    { id: 'daily-work', book: 'platform', part: '02', partTitle: 'Daily Safety', chapter: '03', title: "Today's Work", previous: 'workflow', next: 'safety-report' },
    { id: 'safety-report', book: 'platform', part: '03', partTitle: 'Safety Operation', chapter: '04', title: 'Safety Report', previous: 'daily-work' },
    { id: 'tbm-purpose', book: 'tbm', chapter: '01', title: 'TBM이란 무엇인가?' },
    { id: 'tbm-nine-steps', book: 'tbm', chapter: '02', title: 'TBM 진행 9단계' },
    { id: 'tbm-scenario', book: 'tbm', chapter: '03', title: 'TBM 진행 시나리오' },
    { id: 'tbm-life-rules', book: 'tbm', chapter: '04', title: '생명안전수칙 10' },
    { id: 'sop-purpose', book: 'sop', chapter: '01', title: 'SOP란 무엇인가?', progressTotal: 4 },
    { id: 'sop-reading', book: 'sop', chapter: '02', title: 'SOP 읽는 방법', progressTotal: 4 },
    { id: 'sop-structure', book: 'sop', chapter: '03', title: 'SOP 구성과 작성 구조', progressTotal: 4 },
    { id: 'sop-practice', book: 'sop', chapter: 'PRACTICE', label: 'PRACTICE 01', title: '작업순서와 Safety Step 찾아보기', progressTotal: 4, countInProgress: false },
    { id: 'sop-platform', book: 'sop', part: '2', chapter: '04', title: 'Platform에서 SOP 활용', progressTotal: 4 },
    { id: 'risk-assessment-purpose', book: 'risk', part: '1', chapter: '01', title: '위험성평가란 무엇인가?', progressTotal: 4 },
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
    const chapterLabel = item.label || (item.part ? `PART ${item.part} · CHAPTER ${item.chapter}` : `CHAPTER ${item.chapter}`);
    start.innerHTML = `<p>${chapterLabel}</p><h1>${item.title}</h1><span>${description}</span>`;
    chapter.insertAdjacentElement('afterbegin', start);
  });
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
    chapter?.querySelector('.chapter-reading-nav')?.insertAdjacentHTML('beforebegin', '<p class="chapter-complete-label" hidden>Chapter Complete</p>');
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
    ,['#special-book .book-chapters', 'special']
  ].forEach(([selector, book]) => {
    const toc = document.querySelector(selector);
    const firstLesson = lessonCatalog.find((lesson) => lesson.book === book);
    if (toc && firstLesson) toc.insertAdjacentHTML('beforeend', `<a class="toc-start-learning" href="#${firstLesson.route}"><span>처음부터 학습하기</span><b aria-hidden="true">→</b></a>`);
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
    if (activeStickyChapterHeader) {
      document.getElementById(activeStickyChapterHeader.dataset.chapterOwner)?.insertAdjacentElement('afterbegin', activeStickyChapterHeader);
      activeStickyChapterHeader = null;
    }
    lessonStickyStack.hidden = !selectedLesson;
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
        ? '<a class="handbook-complete" href="#home">처음으로(Home)</a>'
        : `<a href="#${next.route}">다음 Lesson →</a>`;
      const lessonNavigation = document.querySelector(`#${selectedLesson.chapter} .chapter-reading-nav`);
      const tocTarget = selectedLesson.book === 'tbm' ? 'tbm-book-toc'
        : selectedLesson.book === 'risk' ? 'risk-book-toc'
        : selectedLesson.book === 'sop' ? 'sop-book-toc'
        : selectedLesson.book === 'special' ? 'special-book-toc'
        : 'safety-book-toc';
      if (lessonNavigation) lessonNavigation.innerHTML = `${previousItem}<a href="#${tocTarget}">목차</a>${nextItem}`;
      const chapterHeader = document.querySelector(`#${selectedLesson.chapter} .book-chapter-start`);
      if (chapterHeader) {
        chapterHeader.dataset.chapterOwner = selectedLesson.chapter;
        lessonStickyStack.append(chapterHeader);
        activeStickyChapterHeader = chapterHeader;
      }
      const handbookChapters = bookChapterForm.filter((chapter) => chapter.book === selectedLesson.book && chapter.countInProgress !== false);
      const chapterProgressIndex = handbookChapters.findIndex((chapter) => chapter.id === selectedLesson.chapter) + 1;
      const chapterProgressTotal = handbookChapters.find((chapter) => chapter.id === selectedLesson.chapter)?.progressTotal || handbookChapters.length;
      chapterHeader?.insertAdjacentHTML('beforeend', `<div class="lesson-progress-indicator"><span>Chapter Progress</span><strong>${chapterProgressIndex} / ${chapterProgressTotal}</strong></div>`);
      floatingLessonEnabled = true;
      floatingLessonNavigation.innerHTML = `${previousItem}<a href="#${tocTarget}">목차</a>${nextItem}`;
      updateFloatingLessonNavigation();
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
