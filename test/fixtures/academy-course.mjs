// Added only to the browser responses for the extension test.
// Supplies course data and lesson content. The application builds every navigation control.
const id = 'qa-extension';
const chapters = [
  [id + '-01', '확장 Fixture 첫 학습', '공통 콘텐츠 블록 확인'],
  [id + '-02', '확장 Fixture 다음 학습', '공통 학습 이동 확인']
];
const course = {
  id, route: id + '-course', view: id + '-landing', number: '07',
  title: '공통 UX 확장 Fixture', category: 'equipment', tag: '학습 예시',
  description: '같은 컴포넌트에 새 콘텐츠를 연결하는 격리 Fixture입니다.',
  hero: 'assets/course-heroes/sop.png', finalHero: 'assets/course-heroes/final-sop.png',
  time: '10분', standard: 'Fixture', chapters
};

function insertBefore(source, marker, code) {
  if (source.split(marker).length !== 2) throw new Error('Fixture insertion point changed: ' + marker);
  return source.replace(marker, code + marker);
}

export async function installCourseFixture(context, base) {
  await context.route(base + '/index.html', async route => {
    const response = await route.fetch();
    const sections = chapters.map(([chapter, , description]) =>
      `<section class="manual-section" id="${chapter}">
        <article class="ak-scene"><h2>${description}</h2><p>공통 콘텐츠 블록 예시입니다.</p></article>
      </section>`).join('');
    const html = insertBefore(await response.text(), '<nav class="chapter-pager"', sections);
    await route.fulfill({ response, body: html });
  });
  await context.route(base + '/academy.js', async route => {
    const response = await route.fetch();
    let js = (await response.text()).replaceAll('\r\n', '\n');
    js = insertBefore(js, '  entryCourseCatalog.forEach((course) => bookRouteRegistry.set',
      `  entryCourseCatalog.push(${JSON.stringify(course)});\n`);
    const mobile = {
      header: 'Course Fixture', tag: course.tag, status: '학습 예시', description: course.description,
      metrics: [], section: '학습 목록', ctaRoute: chapters[0][0], rows: [['5분'], ['5분']]
    };
    const desktop = { time: course.time, audience: '격리 QA', points: chapters.map(([,title,description]) => [title,description]) };
    js = insertBefore(js, '  entryCourseCatalog.forEach(renderCourseLanding);',
      `  mobileLandingCatalog['${id}'] = ${JSON.stringify(mobile)};\n  desktopLandingCatalog['${id}'] = ${JSON.stringify(desktop)};\n`);
    js = insertBefore(js, '  bookChapterForm.forEach((item) => {\n    const chapter = document.getElementById(item.id);\n    if (!chapter) return;',
      `  bookChapterForm.push(...${JSON.stringify(chapters.map(([chapter,title], i) => ({ id: chapter, book: id, title, chapter: String(i + 1) })))});\n`);
    js = insertBefore(js, '  Object.entries(desktopLearningCatalog).forEach(([courseId,course]) => course.sequence.forEach(([chapterId,learningNumber,title],index)',
      `  desktopLearningCatalog['${id}'] = ${JSON.stringify({ number: course.number, label: 'FIXTURE', sequence: chapters.map(([chapter,title], i) => [chapter, String(i + 1), title]) })};\n`);
    const lessons = chapters.map(([chapter,title]) => ({ chapter, title, book: id, key: 'content', selector: '.ak-scene' }));
    js = insertBefore(js, '  const lessonCatalog = [',
      `  const fixtureLessons = ${JSON.stringify(lessons)};\n`);
    js = js.replace('  const lessonCatalog = [', '  const lessonCatalog = [...fixtureLessons,');
    await route.fulfill({ response, body: js });
  });
  // This UI fixture is not registered with the server catalog.
  await context.route(base + '/api/academy/session', route =>
    route.fulfill({ status: 401, json: { error: 'authentication_required' } }));
}

export { course, chapters };
