'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

test('API 인증, 세션 복원, 관리자 권한 차단을 보장한다', async (t) => {
  const testRoot = path.resolve(__dirname, '..', '.academy-data', 'tests');
  fs.mkdirSync(testRoot, { recursive: true });
  const directory = fs.mkdtempSync(path.join(testRoot, 'api-'));
  const port = 43271;
  const child = spawn(process.execPath, ['dev-server.js'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: String(port), ACADEMY_TEST_AUTH: '1', ACADEMY_PROGRESS_FILE: path.join(directory, 'progress.json') }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server_start_timeout')), 5000);
    child.stdout.on('data', (chunk) => { if (String(chunk).includes('ONOFF Academy')) { clearTimeout(timer); resolve(); } });
    child.on('exit', (code) => reject(new Error(`server_exit_${code}`)));
  });
  const base = `http://127.0.0.1:${port}`;
  assert.equal((await fetch(`${base}/api/academy/session`)).status, 401);
  const learnerHeaders = { 'content-type': 'application/json', 'x-academy-user-id': 'worker-1', 'x-academy-user-role': 'learner' };
  const event = { id: 'api-e1', type: 'lesson.entered', courseId: 'sop', lessonId: 'sop-purpose' };
  assert.equal((await fetch(`${base}/api/academy/progress/events`, { method: 'POST', headers: learnerHeaders, body: JSON.stringify(event) })).status, 200);
  const restored = await (await fetch(`${base}/api/academy/progress/me`, { headers: learnerHeaders })).json();
  assert.equal(restored.courses.sop.lastLessonId, 'sop-purpose');
  assert.equal((await fetch(`${base}/api/academy/admin/progress`, { headers: learnerHeaders })).status, 403);
  const adminResponse = await fetch(`${base}/api/academy/admin/progress?courseId=sop`, { headers: { ...learnerHeaders, 'x-academy-user-id': 'admin-1', 'x-academy-user-role': 'administrator' } });
  assert.equal(adminResponse.status, 200);
  assert.equal((await adminResponse.json()).rows.some((row) => row.userId === 'worker-1'), true);
});
