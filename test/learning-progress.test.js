'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { LearningProgressStore, COURSE_CATALOG } = require('../lib/learning-progress');

const identity = { id: 'worker-1', name: '홍길동', role: 'learner', organization: '생산1팀' };
const makeStore = () => {
  const testRoot = path.resolve(__dirname, '..', '.academy-data', 'tests');
  fs.mkdirSync(testRoot, { recursive: true });
  const directory = fs.mkdtempSync(path.join(testRoot, 'progress-'));
  return { directory, file: path.join(directory, 'progress.json'), store: new LearningProgressStore(path.join(directory, 'progress.json')) };
};

test('신규 기록을 생성하고 lesson 진척과 마지막 위치를 서버 파일에 저장한다', () => {
  const { file, store } = makeStore();
  const result = store.apply(identity, { id: 'e1', type: 'lesson.entered', courseId: 'platform', lessonId: 'philosophy' });
  assert.equal(result.courses.platform.lessons.philosophy.state, 'IN_PROGRESS');
  assert.equal(result.courses.platform.lastLessonId, 'philosophy');
  assert.ok(fs.existsSync(file));
});

test('새 Store와 다른 세션에서도 동일 계정 진행 상태를 복원한다', () => {
  const { file, store } = makeStore();
  store.apply(identity, { id: 'e1', type: 'lesson.completed', courseId: 'platform', lessonId: 'philosophy' });
  const restored = new LearningProgressStore(file).get(identity);
  assert.equal(restored.courses.platform.lessons.philosophy.state, 'COMPLETED');
  assert.equal(restored.courses.platform.progressPercent, 25);
});

test('필수 Practice가 등록된 과정은 통과 전 공식 이수를 차단하고 통과 후 한 번만 완료한다', () => {
  const { store } = makeStore();
  store.apply(identity, { id: 'p1', type: 'practice.result', courseId: 'platform', practiceId: 'final', required: true, passed: false, score: 70 });
  COURSE_CATALOG.platform.forEach((lessonId, index) => store.apply(identity, { id: `l${index}`, type: 'lesson.completed', courseId: 'platform', lessonId }));
  let result = store.get(identity);
  assert.equal(result.courses.platform.state, 'COMPLETED');
  assert.equal(result.courses.platform.officiallyCompleted, false);
  result = store.apply(identity, { id: 'p2', type: 'practice.result', courseId: 'platform', practiceId: 'final', required: true, passed: true, score: 90 });
  assert.equal(result.courses.platform.officiallyCompleted, true);
  const completedAt = result.courses.platform.completedAt;
  result = store.apply(identity, { id: 'p2', type: 'practice.result', courseId: 'platform', practiceId: 'final', required: true, passed: true, score: 90 });
  assert.equal(result.courses.platform.completedAt, completedAt);
  assert.equal(result.courses.platform.practices.final.attempts, 2);
});

test('중복 event 재시도는 revision과 진척을 왜곡하지 않는다', () => {
  const { store } = makeStore();
  const event = { id: 'same-event', type: 'lesson.completed', courseId: 'risk', lessonId: 'risk-assessment-purpose' };
  const first = store.apply(identity, event);
  const duplicate = store.apply(identity, event);
  assert.equal(duplicate.revision, first.revision);
  assert.equal(duplicate.courses.risk.progressPercent, 25);
});

test('동시에 도착한 서로 다른 Lesson event를 손실 없이 합산한다', async () => {
  const { store } = makeStore();
  await Promise.all(['risk-assessment-purpose', 'risk-assessment-structure'].map((lessonId, index) => Promise.resolve().then(() => store.apply(identity, { id: `parallel-${index}`, type: 'lesson.completed', courseId: 'risk', lessonId }))));
  const result = store.get(identity);
  assert.equal(result.courses.risk.progressPercent, 50);
  assert.equal(result.revision, 2);
});

test('Legacy localStorage 구조를 보존 병합하고 관리자 집계와 일치시킨다', () => {
  const { store } = makeStore();
  const imported = store.importLegacy(identity, { courses: { tbm: { learnings: { 'tbm-nine-steps': { state: 'COMPLETED', completedAt: '2026-10-20T00:00:00.000Z' } } } } });
  const row = store.summary({ courseId: 'tbm' })[0];
  assert.equal(imported.courses.tbm.progressPercent, 33);
  assert.equal(row.progressPercent, imported.courses.tbm.progressPercent);
  assert.equal(row.userId, identity.id);
});
