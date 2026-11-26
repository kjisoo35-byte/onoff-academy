import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const viewports = [[320,640], [390,760], [717,768], [1024,600], [1366,720], [1440,900], [1920,1080]];
const epsilon = 1;
const fields = ['title','intro','card','drawing','complete','actions','nav','previous','toc','next'];
const span = values => Math.max(...values) - Math.min(...values);
const max = values => Math.max(0, ...values);

async function snapshot(page) {
  return page.evaluate(() => {
    const section = document.querySelector('.unified-stage-chapter');
    const diagram = section.querySelector('.ak-interaction-stage');
    const foot = section.querySelector('.unified-foot');
    const box = el => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return [x,y,width,height];
    };
    const art = diagram.querySelector('svg');
    const rect = diagram.getBoundingClientRect(), viewBox = art.viewBox.baseVal, matrix = art.getScreenCTM();
    const corner = (x, y) => new DOMPoint(x, y).matrixTransform(matrix);
    const topLeft = corner(viewBox.x,viewBox.y);
    const bottomRight = corner(viewBox.x+viewBox.width,viewBox.y+viewBox.height);
    const artFits = topLeft.x >= rect.x-1 && topLeft.y >= rect.y-1 &&
      bottomRight.x <= rect.right+1 && bottomRight.y <= rect.bottom+1 &&
      Math.abs(matrix.a-matrix.d) < .001 && viewBox.width>0 && viewBox.height>0;
    const visible = node => {
      const b = node.getBoundingClientRect();
      return b.x>=-1 && b.y>=-1 && b.right<=innerWidth+1 && b.bottom<=innerHeight+1;
    };
    const hit = el => {
      const b=el.getBoundingClientRect();
      return b.width>=44-.02 && b.height>=44-.02;
    };
    const completion=section.querySelector('[data-learning-complete]');
    return {
      title:box(document.querySelector('.unified-stage-title h1')),
      intro:box(document.querySelector('.unified-stage-title [data-stage-intro]')),
      card:box(section.querySelector('.ak-interaction-card')),
      drawing:box(diagram), complete:box(completion), actions:box(section.querySelector('.unified-stage-actions')),
      nav:box(foot),previous:box(foot.firstElementChild),toc:box(foot.children[1]),next:box(foot.lastElementChild),
      counts:[document.querySelectorAll('.unified-mast').length, document.querySelectorAll('.unified-foot').length,
        section.querySelectorAll('[data-learning-complete]').length],
      exposed:visible(foot)&&visible(completion), artFits, touch: [completion,...foot.children].every(hit),
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      scroll:scrollY
    };
  });
}

const getNav = page => page.locator('.unified-stage-actions nav');
async function settle(page, selector) {
  await page.locator(selector).waitFor();
  await page.evaluate(() => document.fonts.ready);
  // The existing lesson router completes its last intentional scroll reset after 120 ms.
  await page.waitForTimeout(145);
}
function assertCommon(state) {
  assert.deepEqual(state.counts,[1,1,1]);
  for(const field of ['intro','card','actions'])assert.ok(Math.abs(state[field][0]-state.title[0])<=epsilon,field+' align');
  assert.ok(state.artFits&&state.touch&&state.overflow<=epsilon,'art, targets or horizontal scrolling');
}
async function fixture(context,base) {
  const page=await context.newPage();
  const url=base+'/__learning_stage_fixture';
  await page.route(url,route=>route.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/components/academy-components.css"><link rel="stylesheet" href="/components/learning-foundation.css">
    <section class="manual-section" id="relay">
      <article data-learning-stage></article>
      <div class="chapter-complete-label"><button data-learning-complete="fixture">학습 완료</button></div>
      <nav class="chapter-reading-nav"><a href="#wide">← 이전 학습</a><a href="#relay-course">학습 목록</a><a href="#tall">다음 학습 →</a></nav>
    </section>
    <div id="sticky" hidden></div><nav id="floating" hidden></nav>
    <script src="/components/learning-shell.js"></script><script src="/components/interaction-workspace.js"></script>
    <script>
      const chapter=document.getElementById('relay'), article=chapter.querySelector('article');
      const complete=chapter.querySelector('[data-learning-complete]'), navigation=chapter.querySelector('.chapter-reading-nav');
      complete.addEventListener('click',()=>{complete.dataset.saved='true';});
      const items=[['wide','접점 설명'],['tall','릴레이 확인']];
      function render(){
        AcademyLearningShell.clear();
        const tall=location.hash==='#tall';
        const [width,height]=tall?[250,600]:[680,250];
        article.innerHTML='<p data-stage-intro>릴레이의 접점을 확인하세요.</p><div class="ak-interaction-workspace"><section class="ak-media ak-interaction-card"><h2 class="ak-interaction-title">접점 확인</h2><div class="ak-interaction-layout"><figure class="ak-interaction-figure"><div class="ak-media-frame ak-interaction-stage"><svg role="img" aria-label="릴레이 도식" viewBox="0 0 '+width+' '+height+'"><rect x="4" y="4" width="'+(width-8)+'" height="'+(height-8)+'" fill="#d5e8f8"></rect></svg></div></figure><div class="ak-interaction-panel" tabindex="0" aria-label="조작 및 결과"><div class="ak-interaction-controls"><div class="ak-interaction-choices">'+Array.from({length:tall?5:1},(_,i)=>'<button type="button">접점 '+(i+1)+'</button>').join('')+'</div></div><div class="ak-interaction-feedback"><p aria-live="polite" class="ak-interaction-status">'+(tall?'긴 피드백입니다. '.repeat(80)+'<span>긴 피드백 끝</span>':'접점 열림')+'</p></div></div></div><div class="ak-interaction-details">'+(tall?'<details><summary>상세 회로</summary><p>격리 릴레이 회로 설명</p></details>':'')+'</div></section></div>';
        const layout=AcademyInteractionWorkspace.attach(article.querySelector('.ak-interaction-card'));
        article.querySelector('.ak-interaction-choices').addEventListener('click',e=>{
          if(!e.target.matches('button'))return;
          layout.beforeUpdate();
          article.querySelector('.ak-interaction-status').textContent='접점 닫힘';
        });
        AcademyLearningShell.mount({chapter,lesson:{chapter:tall?'tall':'wide'},course:{id:'relay-fixture',title:'릴레이 검증',route:'relay-course'},
          sticky:document.getElementById('sticky'),floating:document.getElementById('floating'),items,title:tall?'릴레이 확인':'접점 설명'});
        window.nativeNodesReused=()=>complete===chapter.querySelector('[data-learning-complete]')&&navigation===chapter.querySelector('.unified-foot');
      }
      addEventListener('hashchange',render);
      render();
    </script>`}));
  await page.goto(url);
  const a=await snapshot(page);
  assertCommon(a);
  assert.equal(await page.getByRole('button',{name:'접점 1',exact:true}).count(),1);
  await page.getByRole('button',{name:'접점 1',exact:true}).click();
  await page.getByText('접점 닫힘',{exact:true}).waitFor();
  await getNav(page).getByRole('link',{name:/다음 학습/}).click();
  await page.getByRole('heading',{name:'릴레이 확인'}).waitFor();
  const b=await snapshot(page);
  assertCommon(b);
  assert.equal(await page.locator('.ak-interaction-choices button').count(),5);
  const panel=page.locator('.ak-interaction-panel');
  if(page.viewportSize().width>=860){
    for(const field of fields)assert.ok(max(a[field].map((value,i)=>Math.abs(value-b[field][i])))<=epsilon, 'fixture '+field);
    assert.ok(await panel.evaluate(el=>el.scrollHeight>el.clientHeight));
    await panel.focus();
    await page.keyboard.press('End');
    await page.waitForFunction(()=>document.querySelector('.ak-interaction-panel').scrollTop>0);
  } else {
    const lastLine = panel.getByText('긴 피드백 끝', {exact:true});
    await lastLine.scrollIntoViewIfNeeded();
    assert.ok(await lastLine.evaluate(el => {
      const box = el.getBoundingClientRect();
      return scrollY > 0 && box.top >= 0 && box.bottom <= innerHeight;
    }), 'stacked feedback can be reached with page scrolling');
  }
  await page.locator('.ak-interaction-details summary').click();
  await page.getByText('격리 릴레이 회로 설명',{exact:true}).waitFor();
  await page.locator('.ak-interaction-details summary').click();
  await page.locator('[data-learning-complete]').click();
  assert.equal(await page.locator('[data-learning-complete]').getAttribute('data-saved'),'true');
  assert.equal(await page.evaluate(()=>window.nativeNodesReused()),true);
  await getNav(page).getByRole('link',{name:/이전 학습/}).click();
  await page.getByRole('heading',{name:'접점 설명'}).waitFor();
  assert.equal(await page.evaluate(()=>window.nativeNodesReused()),true);
  await page.close();
}

export async function verifyLearningStage({session,base,lessons,output}) {
  const matrix=[];
  const fixtures=[];
  for(const [width,height] of viewports){
    const {page,context}=await session(width,'sensor-stage-qa-'+width,height);
    try {
      const states=[];
      const waitLesson=id=>settle(page,'#'+id+'.unified-stage-chapter .ak-interaction-stage svg:visible');
      await page.goto(base+'/index.html#'+lessons[0]);
      for(const [index,id] of lessons.entries()){
        await waitLesson(id);
        const state=await snapshot(page);
        assertCommon(state);
        if(width>=860)assert.ok(state.exposed,'desktop action viewport '+width+' '+id+' '+state.actions);
        if([390,1366].includes(width)&&[1,3,4,6,7].includes(index)){
          await page.screenshot({path:path.join(output,'stage-'+width+'-'+(index+1)+'.png')});
        }
        states.push({id,...state});
        if(index+1<lessons.length)await getNav(page).getByRole('link',{name:/다음 학습/}).click();
      }
      for(const id of lessons.slice(0,-1).reverse()){
        await getNav(page).getByRole('link',{name:/이전 학습/}).click();
        await waitLesson(id);
        const state=await snapshot(page);
        assertCommon(state);
        const first=states.find(item=>item.id===id);
        for (const field of ['card','drawing','actions','nav']) {
          assert.ok(max(state[field].map((v,i)=>Math.abs(v-first[field][i])))<=epsilon,'return '+width+' '+id+' '+field);
        }
      }
      await getNav(page).getByRole('button',{name:'목차',exact:true}).click();
      const toc=page.locator('dialog.unified-toc[open]');
      assert.equal(await toc.locator('ol a').count(),8);
      await toc.locator('a[href="#'+lessons[4]+'"]').click();
      await waitLesson(lessons[4]);
      const before=await snapshot(page);
      const details=page.locator('#detail-toggle');
      await details.click();
      assert.equal(await details.getAttribute('aria-expanded'),'true');
      const modal=page.locator('dialog.sensor-details[open]');
      await page.locator('button[data-action="deep"]:visible').click();
      await modal.waitFor();
      await modal.getByRole('button',{name:'닫기',exact:true}).click();
      await modal.waitFor({state:'hidden'});
      await details.click();
      assert.equal(await details.getAttribute('aria-expanded'),'false');
      const after=await snapshot(page);
      assert.ok(max([0,2,3].map(i=>Math.abs(before.drawing[i]-after.drawing[i])))<=epsilon,'detail width or size');
      assert.ok(Math.abs(before.drawing[1]+before.scroll-after.drawing[1]-after.scroll)<=epsilon,'detail moved drawing');
      const positionChanges=Object.fromEntries(fields.map(field=>[field,[0,1,2,3].map(i=>span(states.map(row=>row[field][i])))]));
      if(width>=860){
        for(const key of ['card','drawing','complete','actions','nav','previous','toc','next']){
          assert.ok(max(positionChanges[key])<=epsilon,'stage drift '+width+' '+key+' '+positionChanges[key]);
        }
      }else assert.ok(max([0,2,3].map(i=>positionChanges.drawing[i]))<=epsilon,'stacked diagram dimensions '+width);
      if([390,1366].includes(width)){await fixture(context,base);fixtures.push(width);}
      const result={viewport:[width,height],positionChanges,forward:7,backward:7,states,optionalDetails:'PASS'};
      matrix.push(result);
      console.log('PASS learning stage '+width+'×'+height+' '+JSON.stringify(positionChanges));
    } finally {await context.close();}
  }
  await fs.writeFile(path.join(output,'learning-stage.json'),JSON.stringify({matrix,fixtureWidths:fixtures},null,2));
}
