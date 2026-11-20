import test from 'node:test';
import assert from 'node:assert/strict';
import { academyAssertionResponse, createAcademyAssertion } from '../integration/work/academy-assertion.js';
import { verifyWorkAcademyAssertionToken } from '../src/server/work-auth.js';

const secret = 'contract-only-secret';
const state = 'a'.repeat(43);
const auth = { account: { id: 'account-1', login_id: 'worker.login', role: 'WORKER', worker_id: 'worker-1' }, session: { id: 'verified-session-id' } };
const worker = { id: 'worker-1', name: '작업자 1', department: '생산1팀' };
const assignment = { work_line: 'A1', shift_group: 'A' };

test('WORK issuer 계약은 검증된 session/worker 정보만 Academy claim으로 만든다', async () => {
  const now = new Date('2026-10-21T00:00:00Z');
  const token = await createAcademyAssertion({ auth, worker, assignment, state, secret, now });
  const identity = await verifyWorkAcademyAssertionToken(token, { WORK_ACADEMY_ASSERTION_SECRET: secret }, now.getTime());
  assert.equal(identity.externalSubject, 'worker-1');
  assert.equal(identity.organization, '생산1팀');
  assert.equal(identity.workLine, 'A1');
  assert.equal(identity.state, state);
  await assert.rejects(() => createAcademyAssertion({ auth, worker: { ...worker, id: 'other-worker' }, assignment, state, secret, now }), /worker_mismatch/);
});

test('WORK issuer 응답은 assertion을 URL이 아닌 허용 HTTPS callback form으로 전달한다', async () => {
  const response = await academyAssertionResponse({
    request: new Request(`https://work.example/api/academy/assertion?audience=onoff-academy&state=${state}`),
    auth, stateData: { worker, assignment }, secret,
    callbackUrl: 'https://academy.example/api/academy/auth/exchange', now: new Date('2026-10-21T00:00:00Z')
  });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /method="post"/);
  assert.match(html, /name="assertion"/);
  assert.doesNotMatch(html, /action="[^"]*assertion=/);
  assert.match(response.headers.get('content-security-policy'), /form-action https:\/\/academy\.example/);
});

test('WORK issuer 계약은 권한 상승과 비허용 callback을 차단한다', async () => {
  await assert.rejects(() => createAcademyAssertion({ auth: { ...auth, account: { ...auth.account, role: 'OWNER' } }, worker, assignment, state, secret }), /invalid_role/);
  const response = await academyAssertionResponse({ request: new Request(`https://work.example/api/academy/assertion?audience=onoff-academy&state=${state}`), auth, stateData: { worker, assignment }, secret, callbackUrl: 'http://academy.example/api/academy/auth/exchange' });
  assert.equal(response.status, 400);
});
