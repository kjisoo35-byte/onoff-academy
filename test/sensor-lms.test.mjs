import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import progress from '../lib/learning-progress.js';
import sensorAssessment from '../lib/sensor-assessment.js';
import { D1LearningRepository } from '../src/server/d1-learning-repository.js';
import { TestD1 } from './fixtures/d1.mjs';

const { COURSE_CATALOG, LearningProgressStore } = progress;
const id = 'sensor-npn';
const lessons = COURSE_CATALOG[id];
const { practiceId } = sensorAssessment;
const learner = { id: 'sensor-qa', name: '격리 학습자', role: 'learner' };
const event = (type, key, fields) => ({ id: key, type, courseId: id, ...fields });

test('sensor course uses eight distinct server lesson IDs and local/D1 register the same lessons', async t => {
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(new URL('../assets/sensor/course.js', import.meta.url), 'utf8'), box);
  assert.deepEqual(lessons, Array.from(box.window.AcademySensorCourse.course.chapters, chapter => chapter[0]));
  assert.equal(box.window.AcademySensorCourse.practiceId, practiceId);
  const db = new TestD1();
  t.after(() => db.sqlite.close());
  const repository = new D1LearningRepository(db);
  const record = await repository.get(learner);
  assert.deepEqual(Object.keys(record.courses[id].lessons), lessons);
  assert.deepEqual(record.courses[id].practices, { [practiceId]: sensorAssessment.unattemptedPractice() });
  assert.equal(Object.entries(record.courses).filter(([course]) => course !== id)
    .flatMap(([, course]) => Object.keys(course.lessons)).length, 23);
});

test('pre-sensor records keep persisted content and revision when read and gain only one course on save', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'academy-sensor-'));
  const file = path.join(dir, 'progress.json');
  const db = new TestD1();
  t.after(() => { db.sqlite.close(); fs.rmSync(file, { force: true }); fs.rmdirSync(dir); });
  const repository = new D1LearningRepository(db);
  const pre = await repository.apply(learner, { id: 'existing', type: 'lesson.completed', courseId: 'platform', lessonId: 'philosophy' });
  delete pre.courses[id];
  const serialized = JSON.stringify(pre);
  db.sqlite.prepare('UPDATE academy_learning_records SET record_json=? WHERE user_id=?').run(serialized, learner.id);
  const legacyFile = JSON.stringify({ schemaVersion: 1, users: { [learner.id]: pre } });
  fs.writeFileSync(file, legacyFile);
  const store = new LearningProgressStore(file);
  for (const backend of [repository, store]) {
    const hydrated = await backend.get(learner);
    assert.equal(hydrated.revision, pre.revision);
    const { [id]: newCourse, ...existing } = hydrated.courses;
    assert.deepEqual(existing, pre.courses);
    assert.equal(newCourse.practices[practiceId].required, true);
    assert.equal(hydrated.courses[id].progressPercent, 0);
  }
  assert.equal(fs.readFileSync(file, 'utf8'), legacyFile);
  assert.equal(db.sqlite.prepare('SELECT record_json FROM academy_learning_records WHERE user_id=?').get(learner.id).record_json, serialized);
  for (const backend of [repository, store]) {
    const saved = await backend.apply(learner, event('lesson.entered', 'sensor-entry', { lessonId: lessons[0] }));
    const { [id]: newCourse, ...existing } = saved.courses;
    assert.deepEqual(existing, pre.courses);
    assert.equal(newCourse.practices[practiceId].attempts, 0);
    assert.equal(saved.revision, pre.revision + 1);
    assert.equal(saved.courses[id].lastLessonId, lessons[0]);
  }
});

test('both stores enforce the fixed sensor Practice, grade answers and deduplicate attempts', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'academy-sensor-assessment-'));
  const file = path.join(dir, 'progress.json');
  const db = new TestD1();
  t.after(() => { db.sqlite.close(); fs.rmSync(file, { force: true }); fs.rmdirSync(dir); });
  const repo = new D1LearningRepository(db);
  for (const backend of [repo, new LearningProgressStore(file)]) {
    const grade = (key, answer, claims = {}) => event('practice.result', key, { practiceId, answer, ...claims });
    const start = (await backend.get(learner)).courses[id];
    assert.equal(start.state, 'NOT_STARTED');
    assert.equal(start.officiallyCompleted, false);
    const partial = await backend.apply(learner, event('lesson.completed', 'first', { lessonId: lessons[0] }));
    assert.equal(partial.courses[id].progressPercent, 13);
    assert.equal(partial.courses[id].officiallyCompleted, false);
    for (const lessonId of lessons.slice(1)) await backend.apply(learner, event('lesson.completed', lessonId, { lessonId }));
    const skipped = (await backend.get(learner)).courses[id];
    assert.equal(skipped.progressPercent, 100);
    assert.equal(skipped.state, 'COMPLETED');
    assert.equal(skipped.officiallyCompleted, false);
    assert.equal(skipped.completedAt, null);
    assert.equal(skipped.practices[practiceId].attempts, 0);
    await assert.rejects(async () => backend.apply(learner, grade('unknown-practice', '1', { practiceId: 'unregistered' })), /unknown_practice/);
    await assert.rejects(async () => backend.apply(learner, grade('invalid-answer', 'correct')), /invalid_practice_answer/);
    const wrong = await backend.apply(learner, grade('first-answer', '0', { passed: true, required: false, score: 100 }));
    const replay = await backend.apply(learner, grade('first-answer', '1'));
    assert.equal(replay.revision, wrong.revision);
    assert.equal(replay.courses[id].officiallyCompleted, false);
    assert.deepEqual(replay.courses[id].practices[practiceId], {
      required: true, passed: false, attempts: 1, score: 0, lastAttemptAt: wrong.updatedAt, passedAt: null
    });
    const [pendingRow] = await backend.summary({ courseId: id, query: learner.id });
    assert.equal(pendingRow.progressPercent, 100);
    assert.equal(pendingRow.practice.attempts, 1);
    assert.equal(pendingRow.officiallyCompleted, false);
    const passed = await backend.apply(learner, grade('second-answer', '1', { passed: false, required: false, score: 0 }));
    assert.equal(passed.courses[id].officiallyCompleted, true);
    assert.equal(passed.courses[id].practices[practiceId].score, 100);
    assert.equal(passed.courses[id].practices[practiceId].attempts, 2);
    const [passRow] = await backend.summary({ courseId: id, query: learner.id });
    assert.equal(passRow.practice.passed, true);
    assert.equal(passRow.officiallyCompleted, true);
    const earlyLearner = { ...learner, id: 'pass-before-lessons' };
    const early = await backend.apply(earlyLearner, grade('early-pass', '1'));
    assert.equal(early.courses[id].practices[practiceId].passed, true);
    assert.equal(early.courses[id].officiallyCompleted, false);
    assert.deepEqual((await backend.get(learner)).courses[id], passed.courses[id]);
  }
});
