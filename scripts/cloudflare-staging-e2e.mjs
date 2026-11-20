import crypto from 'node:crypto';
import readline from 'node:readline';

const encoder = new TextEncoder();
const encode = bytes => Buffer.from(bytes).toString('base64url');
const keyPair = await crypto.webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const publicJwk = await crypto.webcrypto.subtle.exportKey('jwk', keyPair.publicKey);
process.stdout.write(`PUBLIC_JWK=${JSON.stringify(publicJwk)}\nREADY\n`);
const input = readline.createInterface({ input: process.stdin, terminal: false });
const [baseUrl] = await new Promise(resolve => input.once('line', line => resolve(line.trim().split(/\s+/))));
if (!/^https:\/\/[a-z0-9.-]+\.pages\.dev$/i.test(baseUrl)) throw new Error('invalid_preview_url');

const sign = async payload => {
  const header = encode(encoder.encode(JSON.stringify({ alg: 'ES256', typ: 'JWT' })));
  const body = encode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.webcrypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keyPair.privateKey, encoder.encode(`${header}.${body}`));
  return `${header}.${body}.${encode(signature)}`;
};
const cookieValue = (response, name) => {
  const values = response.headers.getSetCookie?.() || [response.headers.get('set-cookie') || ''];
  const match = values.join(',').match(new RegExp(`${name}=([^;,]+)`));
  return match ? `${name}=${match[1]}` : '';
};
const request = async (path, { cookie = '', method = 'GET', body } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, { method, redirect: 'manual', headers: { ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': 'application/json', origin: baseUrl } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return response;
};
const assertStatus = (response, expected, label) => { if (response.status !== expected) throw new Error(`${label}:${response.status}`); };
const beginAssertion = async (subject, role = 'WORKER') => {
  const start = await request('/api/academy/auth/start?return_to=/index.html');
  assertStatus(start, 302, 'auth_start');
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const stateCookie = cookieValue(start, 'onoff_academy_login_state');
  const epoch = Math.floor(Date.now() / 1000);
  const assertion = await sign({ iss: 'academy-staging-test', aud: 'onoff-academy', sub: subject, jti: crypto.randomUUID(), iat: epoch, exp: epoch + 120, state, session_binding: encode(crypto.randomBytes(32)), role, name: `E2E ${subject}`, department: 'STAGING-QA' });
  return { assertion, stateCookie };
};
const exchange = async ({ assertion, stateCookie }) => {
  const response = await fetch(`${baseUrl}/api/academy/auth/exchange`, { method: 'POST', redirect: 'manual', headers: { cookie: stateCookie, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ assertion }) });
  return { response, cookie: cookieValue(response, 'onoff_academy_session') };
};
const login = async (subject, role) => exchange(await beginAssertion(subject, role));
const postEvent = (cookie, event) => request('/api/academy/progress/events', { cookie, method: 'POST', body: event });

assertStatus(await request('/api/academy/session'), 401, 'unauthenticated');
const replayMaterial = await beginAssertion('e2e-replay');
const replayFirst = await exchange(replayMaterial);
assertStatus(replayFirst.response, 303, 'replay_first');
assertStatus((await exchange(replayMaterial)).response, 401, 'replay_second');

const learner = await login('e2e-learner', 'WORKER');
assertStatus(learner.response, 303, 'learner_login');
assertStatus(await postEvent(learner.cookie, { id: 'e2e-enter', type: 'lesson.entered', courseId: 'sop', lessonId: 'sop-purpose' }), 200, 'lesson_enter');
assertStatus(await request('/api/academy/auth/logout', { cookie: learner.cookie, method: 'POST', body: {} }), 200, 'logout');
const learnerAgain = await login('e2e-learner', 'WORKER');
const restoredResponse = await request('/api/academy/progress/me', { cookie: learnerAgain.cookie });
assertStatus(restoredResponse, 200, 'restore');
const restored = await restoredResponse.json();
if (restored.courses.sop.lastLessonId !== 'sop-purpose') throw new Error('resume_position_mismatch');
assertStatus(await request('/api/academy/admin/progress', { cookie: learnerAgain.cookie }), 403, 'learner_admin_block');

await postEvent(learnerAgain.cookie, { id: 'e2e-required', type: 'practice.required', courseId: 'sop', practiceId: 'sop-final' });
for (const lessonId of ['sop-purpose', 'sop-reading', 'sop-structure', 'sop-platform']) assertStatus(await postEvent(learnerAgain.cookie, { id: `e2e-complete-${lessonId}`, type: 'lesson.completed', courseId: 'sop', lessonId }), 200, `complete_${lessonId}`);
assertStatus(await postEvent(learnerAgain.cookie, { id: 'e2e-fail', type: 'practice.result', courseId: 'sop', practiceId: 'sop-final', passed: false, score: 40 }), 200, 'practice_fail');
let record = await (await request('/api/academy/progress/me', { cookie: learnerAgain.cookie })).json();
if (record.courses.sop.officiallyCompleted) throw new Error('completion_not_blocked');
assertStatus(await postEvent(learnerAgain.cookie, { id: 'e2e-pass', type: 'practice.result', courseId: 'sop', practiceId: 'sop-final', passed: true, score: 100 }), 200, 'practice_pass');
record = await (await request('/api/academy/progress/me', { cookie: learnerAgain.cookie })).json();
if (!record.courses.sop.officiallyCompleted) throw new Error('completion_missing');

const other = await login('e2e-other', 'WORKER');
const otherRecord = await (await request('/api/academy/progress/me', { cookie: other.cookie })).json();
if (otherRecord.courses.sop.state !== 'NOT_STARTED') throw new Error('user_isolation_failed');
const admin = await login('e2e-admin', 'ADMIN');
const rowsResponse = await request('/api/academy/admin/progress?courseId=sop', { cookie: admin.cookie });
assertStatus(rowsResponse, 200, 'admin_summary');
const rows = (await rowsResponse.json()).rows;
if (!rows.some(row => row.officiallyCompleted && row.organization === 'STAGING-QA')) throw new Error('admin_completion_missing');

process.stdout.write(`STAGING_E2E_PASS learner=${record.user.id} revision=${record.revision} rows=${rows.length}\n`);
input.close();
