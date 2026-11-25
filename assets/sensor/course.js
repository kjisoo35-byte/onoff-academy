/* Based on the Golden NPN sample. Academy provides the surrounding lesson shell. */
window.AcademySensorCourse = (() => {
  "use strict";
  const scenes = [
    ['왜 센서 배선은 헷갈릴까?', '그림에서 부품 하나를 눌러 보세요. 센서에 전원을 주는 부품은 어디에 있을까요?', '제어반 안의 네 부품', '부품 선택'],
    ['전압이 있어도 전류가 멈출 때', '배터리와 전구 사이의 스위치를 여닫아 보세요. 무엇이 바뀌고 무엇이 그대로일까요?', '배터리 · 스위치 · 전구', '스위치 조작'],
    ['제어반에서 센서까지', '같은 전원에서 출발한 두 갈래를 따라가 보세요. 하나는 센서를 작동시키고, 다른 하나는 PLC 입력회로로 이어집니다.', 'DC 24V 전원 분배', '따라갈 연결 선택'],
    ['하나의 센서 안에 있는 NPN', '센서는 하나의 부품이고, NPN은 센서 내부 출력이 동작하는 방식입니다.', '3선식 근접센서 확대', '바깥에서 안으로'],
    ['센서가 감지하면 PLC는 어떻게 알까?', '전원, 감지, PLC 입력은 같은 센서를 보는 세 가지 관점이에요.', '센서 감지와 PLC 입력', '감지 대상 조작'],
    ['같은 연결을 세 가지 보기로', '세 보기는 같은 배선을 나타내요.', '실물 배선과 매뉴얼 회로', '보기 전환'],
    ['전원은 켜졌는데 X0가 OFF라면?', '그림 속 센서에는 전원이 들어와 있고 감지 대상은 떨어져 있습니다. 어디에서 입력 전류가 끊겼을까요?', '관찰 조건 · 물체가 멀리 있음', '그림에서 이유를 찾아보세요'],
    ['전원에서 입력까지 다시 보기', '3번 장면에서 본 두 갈래 연결을 다시 살펴보세요. 물체를 옮기면 어느 쪽 전류가 달라질까요?', '마지막 감지 체험', '세 가지로 기억하기']
  ];
  const parts={
    supply:['DC 파워서플라이','+24V와 0V 사이에 전압을 유지합니다. 센서 전원과 PLC 입력 경로가 이 전원 계통을 함께 사용합니다.'],
    terminal:['단자대·분배','같은 전위의 단자를 통해 전원을 분배합니다. 이 그림에서는 +24V가 센서 갈색선과 PLC COM으로 나뉩니다. 덕트는 선을 모아 정리합니다.'],
    duct:['배선 덕트','덕트는 여러 선을 정돈하고 보호하는 통로입니다. 전기적인 분기와 접속은 표시된 단자에서 확인할 수 있습니다.'],
    sensor:['3선식 센서','갈색과 청색으로 전원을 받습니다. 감지부가 대상을 인식하면 내부 NPN 출력의 상태가 변합니다.'],
    plc:['PLC 입력모듈','이 예시에서는 COM을 +24V로 둡니다. 내부 입력회로에 전류가 흐르면 X0 입력을 ON으로 읽습니다.'],
    brown:['갈색 · +24V','Brown은 이 센서의 전원 +단자입니다. 감지를 해제해도 센서 전원은 유지됩니다.'],
    blue:['청색 · 0V','Blue는 전원 0V와 이어집니다. 센서 전원회로와 NPN 출력 경로가 0V로 돌아갑니다.'],
    black:['흑색 · OUT','Black OUT은 센서 출력과 PLC X0를 잇습니다. 감지 시 X0 쪽에서 흑색선으로 들어온 전류가 내부 NPN을 거쳐 0V로 흐릅니다.']
  };
  const internals=[
    ['센서 외형','감지면 앞의 대상을 살핍니다. 세 가닥 선과 출력 스위치가 모두 이 센서 하나에 속합니다.'],
    ['전원부·감지부','센서 전원부는 갈색과 청색 사이에 연결됩니다. 감지부가 동작할 수 있게 전력을 공급합니다.'],
    ['NPN 출력','흑색선은 내부 NPN 출력으로 이어집니다. 감지하면 열린 스위치가 닫히는 것으로 동작을 단순화해 볼 수 있습니다.']
  ];
  const reasoning=[
    ['센서 전원이 꺼져 있다','갈색과 청색은 여전히 전원에 연결돼 있습니다. 감지 대상의 위치와 출력 접점을 살펴보세요.'],
    ['NPN 출력이 열려 있다','맞습니다. 대상이 멀어 감지하지 않으므로 NPN 출력이 열립니다. 센서 자체의 전원을 유지해도 X0 입력 전류는 흐르지 않습니다.'],
    ['흑색선이 X0에서 빠져 있다','흑색선은 여전히 X0에 연결돼 있어요. 끊긴 곳은 센서 안의 열린 스위치입니다.']
  ];

  const pathText='+24V → PLC COM → 내부 입력회로 → X0 → 흑색 OUT → 센서 내부 NPN → 0V';
  const assumption='DC 24V · 3선식 NPN NO 센서 · COM이 +24V인 호환 입력모듈을 가정합니다.';
  const deep=[
    ['오픈 컬렉터란?','출력선이 트랜지스터의 컬렉터로 나옵니다. 이 NPN 예에서는 켜질 때 외부 입력회로에서 온 전류가 이미터 쪽 0V로 흐릅니다.',],
    ['NPN과 PNP는 어떻게 다를까?','NPN 출력은 켜질 때 0V 쪽으로 전류를 받아들이고, PNP 출력은 켜질 때 +전원 쪽에서 부하로 전류를 공급합니다. 각 출력에 맞는 입력회로가 필요합니다.',],
    ['B · C · E는 무엇일까?','베이스(B)는 출력을 제어합니다. 여기서 컬렉터(C)는 흑색 출력에, 이미터(E)는 0V 쪽에 해당합니다. 베이스는 센서 내부에서 제어합니다.',],
    ['PLC COM은 왜 필요할까?','COM은 입력 그룹의 공통 연결점입니다. 이 예시에서 입력회로에 +24V를 제공하며, 다른 모듈의 COM 극성과 단자 구성은 기종에 따라 달라집니다.',]
  ];
  function detailFigure(i) {
    const text=(x,y,s)=>`<text x="${x}" y="${y}" fill="#193e51" font-size="13" font-weight="650" text-anchor="middle">${s}</text>`;
    const path=d=>`<path d="${d}" fill="none" stroke="#286277" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    const resistor=path('M110 35h18l4 -5 6 10 6 -10 6 10 6 -10 5 5h13');
    let graph;
    if(i===2)graph=path('M60 35h75m0 -15v30m0 -18 39 -18h27m-66 25 39 18h27m-33 -9 6 9 -11 -1')+text(39,40,'B 제어')+text(240,19,'C 흑색 출력')+text(240,62,'E 청색 0V');
    else if(i===1)graph=text(53,22,'NPN')+text(187,22,'입력 → OUT → 0V')+text(53,54,'PNP')+text(187,54,'+V → OUT → 입력')+path('M82 5v56');
    else if(i===3)graph=text(52,39,'COM (+24V)')+path('M97 35h13m63 0h55')+resistor+text(253,39,'X0')+text(145,62,'PLC 입력회로');
    else graph=text(46,20,'PLC 입력')+path('M82 16h91v7l-25 10m0 -11v28m0 -11 25 13h25m-32 -7 7 7 -9 -1m-62 -15h46')+text(68,41,'내부 제어')+text(211,19,'C · OUT')+text(223,57,'E · 0V');
    return `<svg viewBox="0 0 300 70" role="img" aria-label="${deep[i][0]} 개념도">${graph}</svg>`;
  }
  const titles = ["센서 배선과 전압·전류","전압이 있어도 전류가 멈출 때","DC 전원 분배와 센서 전원·출력","하나의 센서 안에 있는 NPN","센서가 감지하면 PLC는 어떻게 알까?","같은 연결을 세 가지 보기로","전원은 켜졌는데 X0가 OFF라면?","전원에서 입력까지 다시 보기"];
  const id = 'sensor-npn';
  const practiceId = 'sensor-npn-diagnosis:assessment';
  const ids = ['orientation','voltage-current','dc-wiring','inside-npn','plc-com','connection','diagnosis','review'];
  const course = Object.freeze({
    id, route: id + '-course', view: id + '-landing', number: '07', category: 'electrical', tag: '전기·제어',
    title: '센서의 이해', description: '3선식 NPN 센서와 PLC 입력을 학습합니다. 공식 이수에는 8개 학습 완료와 판단 Practice 통과가 필요합니다.',
    hero: 'assets/sensor/cover.svg', finalHero: 'assets/sensor/cover.svg',
    standard: null, time: '25분',
    chapters: ids.map((suffix, i) => [id + '-' + suffix, titles[i], scenes[i][1]])
  });
  const mobile = {
    header: course.title, tag: course.tag, description: course.description,
    metrics: [['','권장 학습시간',course.time],['','학습 수','8개 학습']], section: '학습 목록',
    ctaRoute: course.chapters[0][0], rows: course.chapters.map(() => [''])
  };
  const desktop = {
    time: course.time, audience: '센서와 PLC 입력을 처음 학습하는 작업자',
    points: [[titles[1], scenes[1][1]], [titles[4], scenes[4][1]], [titles[6], scenes[6][1]]]
  };
  const addSections = frame => {
    for (const [id, , lead] of course.chapters) {
      const section = document.createElement('section');
      section.id = id;
      section.className = 'manual-section sensor-lesson';
      section.hidden = true;
      const article = document.createElement('article');
      article.className = 'sensor-experience';
      const description = document.createElement('p');
      description.className = 'sensor-lead';
      description.textContent = lead;
      article.append(description);
      section.append(article);
      frame.append(section);
    }
  };
  const slots = {"views":"<div id=\"guide-tools\" hidden>\n  <div id=\"guide-views\"></div>\n</div>","target":"<div id=\"guide-dock\"><section id=\"detector\" hidden aria-label=\"감지 대상 조작\"><div id=\"switches\"></div></section></div>","modes":"<div id=\"detail-modes\" hidden></div>","review":"<button type=\"button\" id=\"review-view\" data-action=\"detail\" aria-controls=\"drawing\" aria-expanded=\"false\" hidden>전체 회로 다시 보기</button>","wires":"<details id=\"wire-details\" hidden>\n  <summary>배선·COM·심화 보기</summary>\n  <div id=\"wire-options\" class=\"ak-interaction-choices\" role=\"group\" aria-label=\"강조할 배선\"></div>\n  <p id=\"wire-note\" aria-live=\"polite\"></p>\n<button type=\"button\" data-action=\"com\" id=\"com-open\" class=\"deeper\" aria-haspopup=\"dialog\">COM은 무엇일까?</button></details>","notes":"<details id=\"review-notes\" hidden><summary>다섯 문장으로 다시 읽기</summary><ul class=\"summary\"><li>센서는 갈색과 청색을 통해 전원을 받습니다.</li><li>대상을 감지하면 센서 내부 출력 상태가 변합니다.</li><li>NPN 출력이 켜지면 0V 방향의 경로가 연결됩니다.</li><li>호환 PLC는 입력회로의 전류를 X0 ON/OFF로 해석합니다.</li><li>매뉴얼 회로도는 실물 배선과 같은 연결 관계를 보여줍니다.</li></ul></details>","more":"<details id=\"principle\" hidden><summary>작동 원리</summary><p id=\"principle-text\"></p></details><button type=\"button\" id=\"detail-toggle\" class=\"deeper\" data-action=\"detail\" aria-controls=\"detail-modes drawing\" aria-expanded=\"false\" hidden>상세 회로 보기</button><button type=\"button\" class=\"deeper\" data-action=\"deep\"><span id=\"deep-label\">더 깊이 알아보기</span> <span aria-hidden=\"true\">↗</span></button>"};
  function createSimulation(preparePractice, readPractice) {
    // One active workspace keeps the diagram controls and their IDs unique.
    const workspace = document.createElement('div');
    function encode(value) {
      return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    }
    workspace.className = 'sensor-workspace ak-interaction-workspace';
    workspace.innerHTML = `<section class="ak-media ak-interaction-card" aria-labelledby="figtitle">
      <h2 class="ak-interaction-title" id="figtitle"></h2>
      <div class="ak-interaction-layout">
        <figure class="ak-interaction-figure" aria-describedby="sensor-caption">
          <div class="ak-media-frame ak-interaction-stage" id="drawing"></div>
        </figure>
        <div class="ak-interaction-panel">
          <div class="ak-interaction-controls">
            ${slots.views}${slots.modes}
            <h2 id="controlTitle"></h2>${slots.target}<div id="controls"></div>
          </div>
          <div class="ak-interaction-feedback">
            <p class="ak-interaction-status" id="sensor-caption" aria-live="polite"></p>
            <div id="sensor-feedback" class="ak-callout" hidden><strong id="why-title"></strong><p id="explain"></p></div>
            <div id="review-summary" hidden></div>
            <div id="sensor-save" hidden><p role="status" id="sensor-save-status"></p><button type="button" data-action="retry" id="sensor-retry" hidden>다시 저장</button></div>
          </div>
        </div>
      </div>
      <div class="ak-interaction-details">${slots.more}${slots.wires}${slots.review}${slots.notes}</div>
    </section>
    <dialog class="unified-toc sensor-details" aria-labelledby="sensor-detail-title">
      <form method="dialog"><strong id="sensor-detail-title"></strong><button>닫기</button></form>
      <div id="sensor-detail-body"></div>
    </dialog>`;
    const layout = window.AcademyInteractionWorkspace.attach(workspace.querySelector('.ak-interaction-card'));
    const $ = id => workspace.querySelector('#' + id);
    const btn = (action, value, text, selected = false) =>
      `<button type="button" data-action="${encode(action)}" data-value="${encode(value)}" aria-pressed="${selected}">${encode(text)}</button>`;
    const group = (name, buttons) => `<div class="ak-interaction-choices" role="group" aria-label="${encode(name)}">${buttons.join('')}</div>`;
    function viewSwitcher(container, label, action, values) {
      container.innerHTML = group(label, values.map(([value, text]) => btn(action, value, text)));
      return value => {
        for (const control of container.querySelectorAll('button')) {
          control.setAttribute('aria-pressed', String(control.dataset.value === String(value)));
        }
      };
    }
    let pendingPractice = null;
    let savingPractice = false;
    async function savePractice() {
      if (!pendingPractice || savingPractice) return;
      savingPractice = true;
      update();
      const saved = await pendingPractice();
      savingPractice = false;
      if (saved) pendingPractice = null;
      update();
    }
  const fresh=()=>({on:false,lamp:false,guide:1,detail:false,reviewDetail:false,mode:'panel',part:'supply',wire:'brown',compare:'black',stage:0,answer:null});
  let state=fresh(),scene=1;
  const selectGuide=viewSwitcher($('guide-views'),'살펴볼 부분','guide',[
    [1,'① 전원'],[2,'② 감지'],[3,'③ PLC 입력']
  ]);
  const selectMode=viewSwitcher($('detail-modes'),'상세 회로 표현','mode',[
    ['panel','제어반형'],['schematic','간단 회로도'],['flow','전류 흐름']
  ]);
  const options=(act,keys,selected)=>group('연결 선택',keys.map(k=>btn(act,k,parts[k][0],k===selected)));
  const detector=()=>group('물체 위치',[btn('detect','on','대상 가까이',state.on),btn('detect','off','대상 멀리',!state.on)]);
  const guideNames=['센서에 전원 공급','물체 감지','PLC 입력 확인'];
  function guideCaption(step,on){
    if(step===1)return on?'감지 중에도 센서 전원은 계속 켜져 있어요.':'센서는 감지할 준비가 됐어요. 아직 PLC 입력은 OFF예요.';
    if(step===2)return on?'스위치가 닫혀 흑색 출력선이 0V에 연결돼요.':'스위치가 열려 흑색 출력선과 0V 사이가 끊어져 있어요.';
    return on?'입력 전류가 흘러 PLC가 X0를 ON으로 읽어요.':'입력 전류가 흐르지 않아 X0는 OFF예요.';
  }
  function update({ preserveViewport = true } = {}) {
    if (preserveViewport) layout.beforeUpdate();
    else layout.reset();
    const oldFocus=document.activeElement;
    const {action,value}=oldFocus?.dataset||{};
    const restoreControl=$('controls').contains(oldFocus)||$('switches').contains(oldFocus);
    const interactive=[5,6,8].includes(scene);
    const guided=scene===5;
    const comparing=scene===6;
    workspace.classList.toggle('compare-view',comparing);
    $('wire-details').hidden=!comparing;
    const deepButton=$('deep-label').closest('button');
    if(comparing&&deepButton.parentElement!==$('wire-details'))$('wire-details').append(deepButton);
    if(!comparing&&deepButton.parentElement===$('wire-details'))$('detail-toggle').after(deepButton);
    $('detail-modes').hidden=!(comparing||(guided&&state.detail));
    selectMode(state.mode);
    workspace.classList.toggle('guided',guided);
    $('guide-tools').hidden=!guided;
    $('detail-toggle').hidden=!guided;
    $('review-view').hidden=scene!==8;
    $('review-notes').hidden=scene!==8;
    const showTarget=interactive&&(!guided||state.guide>1||state.detail);
    $('guide-dock').hidden=!showTarget;
    $('detector').hidden=!showTarget;
    $('switches').innerHTML=showTarget?detector():'';
    $('figtitle').textContent = scenes[scene - 1][2];
    $('controlTitle').textContent = scenes[scene - 1][3];
    $('principle').hidden=scene!==2;
    $('why-title').textContent='어떻게 작동할까요?';
    $('deep-label').textContent='더 깊이 알아보기';
    $('controlTitle').hidden=guided||comparing||scene===7||scene===2||scene===8;
    let controls='',explain='',caption='',summary='',art;
    const practice = scene === 7 ? readPractice() : null;
    const opts={on:state.on,mode:'panel'};
    switch(scene){
      case 1:
        controls=options('part',['supply','terminal','duct','sensor','plc'],state.part);
        explain=parts[state.part][1]; caption='부품을 눌러 역할을 확인하세요.';
        Object.assign(opts,{pick:state.part,allowPick:true,wirePicking:false});break;
      case 2:
        controls=group('스위치 상태',[btn('lamp','off','스위치 OFF',!state.lamp),btn('lamp','on','스위치 ON',state.lamp)]);
        explain='전압은 전류를 흐르게 할 수 있는 전기적인 차이이며, 전류가 흐르려면 연결된 경로가 필요합니다.';
        caption=state.lamp?'경로가 닫혀 전구가 켜집니다.':'배터리의 전압은 그대로지만 전류가 끊겨 전구가 꺼져요.';
        art=SampleCircuit.lamp(state.lamp);break;
      case 3:
        controls=options('wire',['terminal','brown','blue','plc'],state.wire);
        explain=parts[state.wire][1]; caption='흰색 테두리는 선택한 연결을 표시합니다. 단자 번호와 보호회로는 장비별로 달라집니다.';
        Object.assign(opts,{pick:state.wire,allowPick:true});break;
      case 4:
        controls=group('내부 보기',internals.map(([name],i)=>btn('stage',i,name,i===state.stage)));
        explain=internals[state.stage][1];caption='테두리는 선택한 부분을 표시해요. 실제 내부 배치는 모델마다 달라요.';
        art=SampleCircuit.sensorInterior(state.stage,state.on);break;
      case 5: {
        const detailed=state.detail;
        selectGuide(detailed?null:state.guide);
        $('detail-toggle').setAttribute('aria-expanded',String(detailed));
        $('detail-toggle').textContent=detailed?'단계 도식으로 돌아가기':'상세 회로 보기';
        $('figtitle').textContent=detailed?'전체 배선':guideNames[state.guide-1];
        $('why-title').textContent='이 회로의 조건';
        explain=detailed?assumption+' 모듈마다 COM 극성과 입력 사양이 달라요.':'';
        caption=detailed?(state.on?pathText:'NPN 스위치가 열려 X0는 OFF예요.'):guideCaption(state.guide,state.on);
        art=detailed?SampleCircuit.panel({on:state.on,mode:state.mode}):SampleCircuit.guide(state.guide,state.on);
        break;
      }
      case 6: {
        const wiresOpen=$('wire-details').open;
        $('wire-options').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===state.compare)));
        $('wire-note').textContent=parts[state.compare][1];
        Object.assign(opts,{mode:state.mode,pick:wiresOpen?state.compare:'',allowPick:wiresOpen});
        caption=state.on?'닫힌 NPN을 지나 전류가 0V로 돌아가요. X0는 ON이에요.':'COM에 +24V가 있어도 NPN이 열려 있어 X0는 OFF예요.';
        break;
      }
      case 7:
        art=SampleCircuit.review(false,Boolean(practice?.attempts));
        controls=group('X0가 OFF인 직접적인 이유',reasoning.map(([text],i)=>btn('answer',i,text,i===(practice?.passed ? 1 : state.answer))));
        caption='필수 판단 Practice · X0가 OFF인 이유를 고르세요.';
        $('why-title').textContent='선택한 이유 확인';
        if (practice?.passed) explain=reasoning[1][1];
        else if (practice?.attempts && !pendingPractice) {
          explain=state.answer===null?'입력 전류가 흐르는 조건을 다시 살펴보세요.':reasoning[state.answer][1];
        }
        break;
      case 8: {
        const detailed=state.reviewDetail;
        art=detailed?SampleCircuit.panel({on:state.on,mode:'schematic'}):SampleCircuit.review(state.on);
        $('review-view').setAttribute('aria-expanded',String(detailed));
        $('review-view').textContent=detailed?'전체 회로 접기':'전체 회로 다시 보기';
        $('figtitle').textContent=detailed?'전원 분배와 전체 입력회로':'3번 장면의 두 갈래 연결';
        summary='<h3>'+encode(scenes[scene - 1][3])+'</h3><ol class="summary"><li>갈색 +24V와 청색 0V가 센서에 전원을 공급해요.</li><li>물체를 감지하면 내부 NPN 스위치가 닫혀요.</li><li>입력 전류가 흐르면 PLC는 X0를 ON으로 읽어요.</li></ol>';
        caption=state.on?'물체가 가까워요. NPN이 닫혀 X0가 ON이에요.':'물체가 멀어요. NPN이 열려 X0가 OFF예요.';

        break;
      }
    }
    $('drawing').innerHTML = art || SampleCircuit.panel(opts);
    $('sensor-caption').textContent = caption;
    $('review-summary').hidden = !summary;
    $('review-summary').innerHTML = summary;
    $('sensor-save').hidden = scene !== 7;
    if (scene === 7) {
      const message = savingPractice ? '평가 결과 저장 중…'
        : pendingPractice ? '평가 결과를 저장하지 못했습니다.'
        : !practice ? '학습 계정과 서버 연결을 확인해 주세요.'
        : practice.passed ? '판단 Practice 통과'
        : practice.attempts ? '오답입니다. 다시 시도하세요.' : '판단 Practice 미응시';
      const status = $('sensor-save-status');
      if (status.textContent !== message) status.textContent = message;
    }
    $('sensor-retry').hidden = !pendingPractice || savingPractice || Boolean(practice?.passed);
    $('controls').innerHTML=controls;
    if (scene === 7 && (!practice || practice.passed || pendingPractice)) {
      for (const button of $('controls').querySelectorAll('button')) button.disabled = true;
    }
    $('principle-text').textContent=scene===2?explain:'';
    if(scene===2)explain='';
    $('explain').textContent=explain;
    $('why-title').parentElement.hidden=!explain;
    if(restoreControl) Array.from(document.querySelectorAll('#controls button,#switches button')).find(b=>b.dataset.action===action&&b.dataset.value===value)?.focus({preventScroll:true});
  }
  function openDialog(kind,trigger){
    let title='Level 3 · 더 깊이 알아보기';
    let html=
      '<div class="ak-faq">'+deep.map(([title,body],i)=>`<details ${i===(scene===3?3:0)?'open':''}><summary>${title}</summary><p>${body}</p>${detailFigure(i)}</details>`).join('')+'<p class="com-note">이 체험의 표시등 색과 동작은 교육용 예시예요. 실제 센서 표시등과 PLC 입력 사양은 기종별 매뉴얼에서 확인하세요.</p></div>';
    if(kind==='com'){
      title='COM은 무엇일까?';
      html='<p>COM은 여러 입력회로가 함께 사용하는 공통 단자입니다. 여기서는 X0를 예로 들지만 X1과 X2도 같은 방식으로 입력을 사용할 수 있어요.</p>'+SampleCircuit.commonGroup()+'<p class="com-note">이 그림은 COM이 +24V인 NPN 호환 입력 그룹의 예예요. X0만 이번 체험에 연결돼요. COM 극성과 그룹 구성은 모델마다 달라요.</p>';
    }
    $('sensor-detail-title').textContent = title;
    $('sensor-detail-body').innerHTML = html;
    const dialog = workspace.querySelector('dialog');
    dialog.showModal();
    dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }), { once: true });
  }
  $('wire-options').innerHTML=['brown','blue','black','plc'].map(key=>btn('compare',key,parts[key][0],false)).join('');
  $('wire-details').addEventListener('toggle',()=>{if(scene===6)update();});
  workspace.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');
    if(!b){
      const pick=e.target.closest('[data-pick]')?.dataset.pick;
      const allowed=scene===1?['supply','terminal','duct','sensor','plc']:scene===3?['terminal','brown','blue','plc']:scene===6?['brown','blue','black','plc']:[];
      if(scene===6&&!$('wire-details').open)return;
      if(allowed.includes(pick)){state[scene===1?'part':scene===3?'wire':'compare']=pick;update();}
      return;
    }
    const {action,value}=b.dataset;
    switch(action){
      case 'deep':case 'com':openDialog(action,b);return;
      case 'guide':state.guide=Number(value);state.detail=false;break;
      case 'detail': {
        if(scene===8){
          state.reviewDetail=!state.reviewDetail;update({ preserveViewport: false });
          $('review-view').focus({preventScroll:true});
          return;
        }
        state.detail=!state.detail;update({ preserveViewport: false });
        const target=(state.detail?$('detail-modes'):$('guide-tools')).querySelector('[aria-pressed="true"]');
        target.focus({preventScroll:true});
        const frame=target.getBoundingClientRect();
        if(frame.top<0||frame.bottom>innerHeight)target.scrollIntoView({block:'nearest'});
        return;
      }
      case 'detect':state.on=value==='on';break;
      case 'lamp':state.lamp=value==='on';break;
      case 'part':case 'wire':case 'compare':case 'mode':state[action]=value;break;
      case 'stage':state.stage=Number(value);break;
      case 'answer':
        if (scene !== 7 || pendingPractice || b.disabled) return;
        state.answer = Number(value);
        pendingPractice = preparePractice(value);
        savePractice();
        return;
      case 'retry': savePractice(); return;
      default:return;
    }
    update();
  });
    const mount = chapter => {
      const index = course.chapters.findIndex(([id]) => id === chapter.id);
      if (index < 0) return;
      scene = index + 1;
      const experience = chapter.querySelector('.sensor-experience');
      const moved = workspace.parentElement !== experience;
      if (moved) {
        experience.append(workspace);
        $('principle').open = false;
      }
      update({ preserveViewport: !moved });
    };
    return { mount, refreshAssessment: () => { if (scene === 7) update(); } };
  }
  return { course, mobile, desktop, addSections, createSimulation, practiceId };
})();
