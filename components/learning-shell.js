/* Presentation adapter. Restore the very same DOM nodes before the legacy router runs. */
window.AcademyLearningShell = (() => {
  const undo = [];
  const visible = node => node?.getClientRects().length && node.checkVisibility();
  function move(node, parent) {
    if (!node?.parentNode) return;
    const marker = document.createComment('learning-shell-slot');
    node.before(marker);
    if (parent) parent.append(node); else node.remove();
    undo.push(() => marker.replaceWith(node));
  }
  function clear() {
    while (undo.length) undo.pop()();
    document.body.classList.remove('unified-learning');
  }
  function temporary(node) { undo.push(() => node.remove()); return node; }
  function mount({chapter, lesson, course, items, work, sticky, floating, title}) {
    const stage = chapter.querySelector(':scope > [data-learning-stage]');
    const stageIntro = stage?.querySelector('[data-stage-intro]');
    const navs = [...chapter.querySelectorAll('nav')].filter(visible);
    const original = navs.findLast(nav => nav.matches('.chapter-reading-nav,[class*="bottom-nav"],[class$="-nav"],.platform-figma-navigation,[aria-label*="이동"]'))
      || chapter.querySelector('.chapter-reading-nav') || floating;
    const header = temporary(document.createElement('header'));
    header.className = 'unified-mast';
    header.innerHTML = '<a href="#home">ONOFF Academy</a><div class="unified-tools"></div>';
    const heading = temporary(document.createElement('header'));
    heading.className = 'unified-title';
    heading.dataset.progressCourse = course.id;
    heading.innerHTML = '<span data-course-progress></span><h1 tabindex="-1"></h1>';
    const originalHeading = [...chapter.querySelectorAll('h1'), ...sticky.querySelectorAll('h1')].find(visible);
    heading.querySelector('h1').textContent = originalHeading?.textContent.trim() || title;
    const chapterLead = sticky.querySelector('.book-chapter-start > span');
    if (stageIntro) {
      move(stageIntro, heading);
    } else if (visible(chapterLead)) {
      const description = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = '학습 설명';
      description.className = 'unified-intro';
      description.append(summary);
      move(chapterLead, description);
      heading.append(description);
    }
    const dialog = temporary(document.createElement('dialog'));
    dialog.className = 'unified-toc';
    dialog.setAttribute('aria-label',course.title+' 목차');
    dialog.innerHTML = '<form method="dialog"><strong></strong><button>닫기</button></form><ol></ol>';
    dialog.querySelector('strong').textContent=course.title;
    for(const [route,label] of items){
      const a=document.createElement('a');
      a.href='#'+route; a.textContent=label;
      if(route===lesson.chapter) a.setAttribute('aria-current','page');
      const li=document.createElement('li');li.append(a);dialog.querySelector('ol').append(li);
    }
    dialog.addEventListener('click',event=>{if(event.target.closest('a'))dialog.close();});
    document.body.append(dialog);
    const toc=document.createElement('button');toc.type='button';toc.textContent='목차';
    toc.addEventListener('click',()=>dialog.showModal());
    const courseHome=document.createElement('a');courseHome.href='#'+course.route;courseHome.textContent='과정 소개';
    dialog.append(courseHome);
    const contentHeader=[...chapter.querySelectorAll('header')].find(el=>visible(el)&&/hero|ready-learning-header/.test(el.className));
    const tools=header.querySelector('.unified-tools');
    const actions=[...document.querySelectorAll('.site-header .search-trigger,.site-header .print-button')].filter(visible);
    if(actions.length){
      const menu=document.createElement('details');
      menu.className='unified-menu';
      menu.innerHTML='<summary>도구</summary><div></div>';
      tools.append(menu);
      for(const control of actions)move(control,menu.lastElementChild);
    }
    move(work,tools);
    for(const el of [document.querySelector('.desktop-academy-global-header'),document.querySelector('.site-header'),sticky,
      ...chapter.querySelectorAll('.platform-mobile-header,.mobile-golden-compact-header,aside[class*="sidebar"]'),document.querySelector('.site-footer')]) {
      if(visible(el))move(el);
    }
    if (stageIntro && contentHeader?.matches('.desktop-learning-hero')) {
      move(contentHeader);
    } else if (contentHeader?.isConnected) {
      const detail=temporary(document.createElement('details'));detail.className='unified-intro';
      detail.innerHTML='<summary>학습 소개</summary>';contentHeader.before(detail);move(contentHeader,detail);
    }
    chapter.before(heading);document.body.prepend(header);
    // Keep the native action elements and their bound save/check handlers in their chapter.
    for(const nav of navs)if(nav!==original && nav.matches('.chapter-reading-nav'))move(nav);
    if(original!==floating && floating.isConnected)move(floating);
    original.classList.add('unified-foot');undo.push(()=>original.classList.remove('unified-foot'));
    const listAction=[...original.children].find(el=>!el.hasAttribute('data-learning-complete')&&!el.hasAttribute('data-complete-on-navigation')&&
      (el.getAttribute('href')==='#'+course.route||el.hasAttribute('data-platform-toc-open')||/학습 목록|목차/.test(el.textContent)));
    if(listAction){listAction.before(toc);move(listAction);}else original.prepend(toc);
    undo.push(()=>toc.remove());
    if (stage) {
      heading.classList.add('unified-stage-title');
      chapter.classList.add('unified-stage-chapter');
      undo.push(() => chapter.classList.remove('unified-stage-chapter'));
      const actions = temporary(document.createElement('div'));
      actions.className = 'unified-stage-actions';
      chapter.append(actions);
      move(chapter.querySelector('.chapter-complete-label'), actions);
      move(original, actions);
    }
    document.body.classList.add('unified-learning');
    chapter.classList.add('unified-chapter');undo.push(()=>chapter.classList.remove('unified-chapter'));
  }
  return {mount,clear};
})();
