const encoder = new TextEncoder();
const encode = bytes => {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
};
const jsonPart = value => encode(encoder.encode(JSON.stringify(value)));
const hmacKey = secret => crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
const sign = async (value, secret) => encode(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(value))));
const digest = async value => encode(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
const statePattern = /^[A-Za-z0-9_-]{32,160}$/;

export async function createAcademyAssertion({ auth, worker, assignment, state, secret, now = new Date() }) {
  if (!auth?.account || !auth?.session?.id || !secret || !statePattern.test(state)) throw new Error('academy_assertion_invalid_context');
  if (!['ADMIN', 'WORKER'].includes(auth.account.role)) throw new Error('academy_assertion_invalid_role');
  if (auth.account.role === 'WORKER' && (!auth.account.worker_id || worker?.id !== auth.account.worker_id)) throw new Error('academy_assertion_worker_mismatch');
  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload = {
    iss: 'onoff-work', aud: 'onoff-academy', sub: auth.account.worker_id || `account:${auth.account.id}`,
    account_id: auth.account.id, login_id: auth.account.login_id, role: auth.account.role,
    name: worker?.name || auth.account.login_id, department: worker?.department || null,
    work_line: assignment?.work_line || null, shift_group: assignment?.shift_group || null,
    jti: crypto.randomUUID(), iat: issuedAt, exp: issuedAt + 300, state,
    session_binding: await digest(`onoff-work-academy:${auth.session.id}`)
  };
  const header = jsonPart({ alg: 'HS256', typ: 'JWT' });
  const body = jsonPart(payload);
  return `${header}.${body}.${await sign(`${header}.${body}`, secret)}`;
}

export async function academyAssertionResponse({ request, auth, stateData, secret, callbackUrl, now }) {
  const url = new URL(request.url);
  const expected = new URL(callbackUrl);
  if (request.method !== 'GET' || url.searchParams.get('audience') !== 'onoff-academy' || expected.protocol !== 'https:' || expected.pathname !== '/api/academy/auth/exchange') {
    return Response.json({ message: 'Academy 인증 요청을 확인해 주세요.' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }
  try {
    const assertion = await createAcademyAssertion({ auth, worker: stateData.worker, assignment: stateData.assignment, state: url.searchParams.get('state') || '', secret, now });
    const origin = expected.origin;
    const html = `<!doctype html><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Academy 연결</title><form method="post" action="${expected.href}"><input type="hidden" name="assertion" value="${assertion}"></form><script>document.forms[0].submit()</script>`;
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'content-security-policy': `default-src 'none'; script-src 'unsafe-inline'; form-action ${origin}; base-uri 'none'; frame-ancestors 'none'` } });
  } catch {
    return Response.json({ message: 'Academy 인증 요청을 완료할 수 없습니다.' }, { status: 403, headers: { 'cache-control': 'no-store' } });
  }
}
