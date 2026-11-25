import test from 'node:test';
import { TestD1 } from './fixtures/d1.mjs';
import assert from 'node:assert/strict';
import { D1LearningRepository } from '../src/server/d1-learning-repository.js';
import { authenticateAcademySession, beginAcademyLogin, issueAcademySession } from '../src/server/academy-auth.js';
import { signTestAssertion, verifyWorkAcademyAssertion } from '../src/server/work-auth.js';
import { onRequest } from '../functions/api/academy/[[path]].js';

const learner = { id: 'worker-1', name: '작업자 1', role: 'learner', organization: '생산1팀', workLine: 'A', shiftGroup: '주간' };

test('identity migration은 기존 WORK user_id와 학습 기록 연결을 보존한다', async () => {
  const db = new TestD1({ identityMigration: false });
  db.sqlite.prepare("INSERT INTO academy_users (user_id,display_name,role,source,updated_at) VALUES (?,?,?,?,?)").run('legacy-worker', '기존 사용자', 'learner', 'WORK', '2026-10-19T00:00:00Z');
  db.sqlite.prepare("INSERT INTO academy_learning_records (user_id,record_json,revision,updated_at) VALUES (?,?,?,?)").run('legacy-worker', '{"revision":7}', 7, '2026-10-19T00:00:00Z');
  db.applyIdentityMigration();
  const link = db.sqlite.prepare('SELECT academy_user_id FROM academy_external_identities WHERE provider=? AND external_subject=?').get('WORK', 'legacy-worker');
  assert.equal(link.academy_user_id, 'legacy-worker');
  assert.equal(db.sqlite.prepare('SELECT revision FROM academy_learning_records WHERE user_id=?').get('legacy-worker').revision, 7);
});

test('WORK assertion은 서명, audience, 만료를 검증한다', async () => {
  const now = Date.now();
  const epoch = Math.floor(now / 1000);
  const secret = 'isolated-test-secret';
  const claims = { iss: 'onoff-work', aud: 'onoff-academy', sub: 'worker-1', jti: 'assertion-1', iat: epoch, state: 'state-1', session_binding: 'session-hash-1', role: 'WORKER', name: '작업자 1', exp: epoch + 60 };
  const token = await signTestAssertion(claims, secret);
  const request = new Request('https://academy.example/api/academy/auth/exchange', { headers: { authorization: `Bearer ${token}` } });
  assert.equal((await verifyWorkAcademyAssertion(request, { WORK_ACADEMY_ASSERTION_SECRET: secret }, now)).externalSubject, 'worker-1');
  const [tokenHeader, tokenBody, tokenSignature] = token.split('.');
  const tamperedSignature = `${tokenSignature[0] === 'A' ? 'B' : 'A'}${tokenSignature.slice(1)}`;
  assert.equal(await verifyWorkAcademyAssertion(new Request(request.url, { headers: { authorization: `Bearer ${tokenHeader}.${tokenBody}.${tamperedSignature}` } }), { WORK_ACADEMY_ASSERTION_SECRET: secret }, now), null);
  const expired = await signTestAssertion({ ...claims, jti: 'assertion-expired', exp: epoch - 1 }, secret);
  assert.equal(await verifyWorkAcademyAssertion(new Request(request.url, { headers: { authorization: `Bearer ${expired}` } }), { WORK_ACADEMY_ASSERTION_SECRET: secret }, now), null);
});

test('Academy HttpOnly 세션은 D1의 서버 검증 identity만 복원한다', async () => {
  const db = new TestD1();
  const now = new Date('2026-10-20T00:00:00Z');
  const login = await beginAcademyLogin(db, '/', now);
  const external = { provider: 'WORK', externalSubject: 'worker-1', issuer: 'onoff-work', assertionId: 'direct-1', state: login.state, expiresAt: '2026-10-20T00:01:00.000Z', name: learner.name, role: learner.role, organization: learner.organization, workLine: learner.workLine, shiftGroup: learner.shiftGroup };
  const issued = await issueAcademySession(db, external, new Request('https://academy.example', { headers: { cookie: login.cookie.split(';')[0] } }), now);
  assert.match(issued.cookie, /HttpOnly; Secure; SameSite=Lax/);
  const cookie = issued.cookie.split(';')[0];
  const restored = await authenticateAcademySession(new Request('https://academy.example', { headers: { cookie } }), db, new Date('2026-10-20T01:00:00Z'));
  assert.match(restored.id, /^lrn_/);
  assert.equal(restored.name, learner.name);
  assert.notEqual(restored.id, external.externalSubject);
  const reconnectLogin = await beginAcademyLogin(db, '/', new Date('2026-10-20T00:02:00Z'));
  const reconnect = await issueAcademySession(db, { ...external, assertionId: 'direct-2', state: reconnectLogin.state, expiresAt: '2026-10-20T00:03:00.000Z' }, new Request('https://academy.example', { headers: { cookie: reconnectLogin.cookie.split(';')[0] } }), new Date('2026-10-20T00:02:00Z'));
  assert.equal(reconnect.identity.id, restored.id);
  const partnerLogin = await beginAcademyLogin(db, '/', new Date('2026-10-20T00:04:00Z'));
  const partner = await issueAcademySession(db, { ...external, provider: 'PARTNER', issuer: 'partner-idp', assertionId: 'partner-1', state: partnerLogin.state, expiresAt: '2026-10-20T00:05:00.000Z' }, new Request('https://academy.example', { headers: { cookie: partnerLogin.cookie.split(';')[0] } }), new Date('2026-10-20T00:04:00Z'));
  assert.notEqual(partner.identity.id, restored.id);
  assert.equal(await authenticateAcademySession(new Request('https://academy.example'), db), null);
});

test('D1 저장은 사용자 격리, 재로그인 복원, 중복 event, 이수 판정을 보장한다', async () => {
  const db = new TestD1();
  const repository = new D1LearningRepository(db, { now: () => '2026-10-20T00:00:00.000Z' });
  await repository.apply(learner, { id: 'required', type: 'practice.required', courseId: 'sop', practiceId: 'sop-final' });
  for (const lessonId of ['sop-purpose', 'sop-reading', 'sop-structure', 'sop-platform']) await repository.apply(learner, { id: `done-${lessonId}`, type: 'lesson.completed', courseId: 'sop', lessonId });
  const beforePass = await repository.get(learner);
  assert.equal(beforePass.courses.sop.progressPercent, 100);
  assert.equal(beforePass.courses.sop.officiallyCompleted, false);
  const passed = await repository.apply(learner, { id: 'practice-pass', type: 'practice.result', courseId: 'sop', practiceId: 'sop-final', passed: true, score: 90 });
  const duplicate = await repository.apply(learner, { id: 'practice-pass', type: 'practice.result', courseId: 'sop', practiceId: 'sop-final', passed: true, score: 90 });
  assert.equal(passed.courses.sop.officiallyCompleted, true);
  assert.equal(duplicate.courses.sop.practices['sop-final'].attempts, 1);
  const other = await repository.get({ ...learner, id: 'worker-2', name: '작업자 2' });
  assert.equal(other.courses.sop.state, 'NOT_STARTED');
});

test('동시 저장과 기존 localStorage 병합은 revision 및 event ID로 중복을 방지한다', async () => {
  const db = new TestD1();
  const repository = new D1LearningRepository(db, { now: () => '2026-10-20T00:00:00.000Z' });
  await Promise.all([
    repository.apply(learner, { id: 'parallel-1', type: 'lesson.entered', courseId: 'platform', lessonId: 'philosophy' }),
    repository.apply(learner, { id: 'parallel-2', type: 'lesson.entered', courseId: 'platform', lessonId: 'workflow' })
  ]);
  const legacy = { updatedAt: '2026-10-19T00:00:00Z', courses: { platform: { learnings: { philosophy: { state: 'COMPLETED' } } } } };
  await repository.importLegacy(learner, legacy);
  const once = await repository.get(learner);
  await repository.importLegacy(learner, legacy);
  const twice = await repository.get(learner);
  assert.equal(once.courses.platform.lessons.workflow.state, 'IN_PROGRESS');
  assert.equal(twice.revision, once.revision);
  assert.equal(twice.courses.platform.lessons.philosophy.state, 'COMPLETED');
});

test('관리자 집계는 실제 D1 레코드와 일치한다', async () => {
  const db = new TestD1();
  const repository = new D1LearningRepository(db);
  await repository.apply(learner, { id: 'summary-1', type: 'lesson.entered', courseId: 'risk', lessonId: 'risk-assessment-purpose' });
  const rows = await repository.summary({ courseId: 'risk', organization: '생산1팀' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].userId, learner.id);
  assert.equal(rows[0].state, 'IN_PROGRESS');
});

test('Mock WORK 교환부터 이수와 관리자 조회까지 E2E로 연결하고 assertion 재사용을 차단한다', async () => {
  const db = new TestD1();
  const secret = 'isolated-route-secret';
  const env = { DB: db, WORK_ACADEMY_ASSERTION_SECRET: secret, WORK_ACADEMY_LOGIN_URL: 'https://work.example/api/academy/assertion' };
  const invoke = (pathValue, request) => onRequest({ env, params: { path: pathValue }, request });
  assert.equal((await invoke(['session'], new Request('https://academy.example/api/academy/session'))).status, 401);
  const now = Math.floor(Date.now() / 1000);
  const start = await invoke(['auth', 'start'], new Request('https://academy.example/api/academy/auth/start?return_to=/index.html%23sop'));
  assert.equal(start.status, 302);
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const stateCookie = start.headers.get('set-cookie').split(';')[0];
  const claims = { iss: 'onoff-work', aud: 'onoff-academy', sub: 'worker-1', jti: 'route-learner-1', iat: now, state, session_binding: 'verified-work-session-hash', role: 'WORKER', name: '작업자 1', exp: now + 60 };
  const assertion = await signTestAssertion(claims, secret);
  const form = new URLSearchParams({ assertion });
  const exchangeRequest = () => new Request('https://academy.example/api/academy/auth/exchange', { method: 'POST', body: form, headers: { cookie: stateCookie }, redirect: 'manual' });
  const exchange = await invoke(['auth', 'exchange'], exchangeRequest());
  assert.equal(exchange.status, 303);
  assert.equal(exchange.headers.get('location'), 'https://academy.example/index.html#sop');
  const cookie = exchange.headers.get('set-cookie').split(';')[0];
  const session = await invoke(['session'], new Request('https://academy.example/api/academy/session', { headers: { cookie } }));
  assert.equal(session.status, 200);
  const forbidden = await invoke(['admin', 'progress'], new Request('https://academy.example/api/academy/admin/progress', { headers: { cookie } }));
  assert.equal(forbidden.status, 403);
  assert.equal((await invoke(['auth', 'exchange'], exchangeRequest())).status, 401);

  const postEvent = event => invoke(['progress', 'events'], new Request('https://academy.example/api/academy/progress/events', { method: 'POST', headers: { cookie, origin: 'https://academy.example', 'content-type': 'application/json' }, body: JSON.stringify(event) }));
  await postEvent({ id: 'e2e-required', type: 'practice.required', courseId: 'sop', practiceId: 'sop-final' });
  for (const lessonId of ['sop-purpose', 'sop-reading', 'sop-structure', 'sop-platform']) assert.equal((await postEvent({ id: `e2e-${lessonId}`, type: 'lesson.completed', courseId: 'sop', lessonId })).status, 200);
  let restored = await (await invoke(['progress', 'me'], new Request('https://academy.example/api/academy/progress/me', { headers: { cookie } }))).json();
  assert.equal(restored.courses.sop.officiallyCompleted, false);
  await postEvent({ id: 'e2e-pass', type: 'practice.result', courseId: 'sop', practiceId: 'sop-final', passed: true, score: 100 });
  restored = await (await invoke(['progress', 'me'], new Request('https://academy.example/api/academy/progress/me', { headers: { cookie } }))).json();
  assert.equal(restored.courses.sop.officiallyCompleted, true);

  const adminStart = await invoke(['auth', 'start'], new Request('https://academy.example/api/academy/auth/start'));
  const adminState = new URL(adminStart.headers.get('location')).searchParams.get('state');
  const adminToken = await signTestAssertion({ ...claims, sub: 'admin-1', jti: 'route-admin-1', state: adminState, role: 'ADMIN', name: '관리자' }, secret);
  const adminExchange = await invoke(['auth', 'exchange'], new Request('https://academy.example/api/academy/auth/exchange', { method: 'POST', body: new URLSearchParams({ assertion: adminToken }), headers: { cookie: adminStart.headers.get('set-cookie').split(';')[0] } }));
  const adminCookie = adminExchange.headers.get('set-cookie').split(';')[0];
  const adminRows = await (await invoke(['admin', 'progress'], new Request('https://academy.example/api/academy/admin/progress?courseId=sop', { headers: { cookie: adminCookie } }))).json();
  assert.equal(adminRows.rows.some(row => row.officiallyCompleted), true);
});
