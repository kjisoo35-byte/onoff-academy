const encoder = new TextEncoder();
const decodeBase64Url = value => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), character => character.charCodeAt(0));
};
const encodeBase64Url = bytes => {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
};

export async function verifyWorkAcademyAssertionToken(token, env, now = Date.now()) {
  if (!token) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
  try {
    if ([encodedHeader, encodedPayload, encodedSignature].some(part => encodeBase64Url(decodeBase64Url(part)) !== part)) return null;
    const headerValue = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)));
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)));
    let valid = false;
    if (headerValue.alg === 'HS256' && env.WORK_ACADEMY_ASSERTION_SECRET) {
      const key = await crypto.subtle.importKey('raw', encoder.encode(env.WORK_ACADEMY_ASSERTION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      valid = await crypto.subtle.verify('HMAC', key, decodeBase64Url(encodedSignature), encoder.encode(`${encodedHeader}.${encodedPayload}`));
    } else if (headerValue.alg === 'ES256' && env.ACADEMY_ENV === 'staging' && env.ACADEMY_STAGING_TEST_PUBLIC_JWK) {
      const key = await crypto.subtle.importKey('jwk', JSON.parse(env.ACADEMY_STAGING_TEST_PUBLIC_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, decodeBase64Url(encodedSignature), encoder.encode(`${encodedHeader}.${encodedPayload}`));
    }
    if (!valid) return null;
    const epoch = Math.floor(now / 1000);
    const workAssertion = headerValue.alg === 'HS256' && payload.iss === 'onoff-work';
    const stagingAssertion = headerValue.alg === 'ES256' && env.ACADEMY_ENV === 'staging' && payload.iss === 'academy-staging-test';
    if ((!workAssertion && !stagingAssertion) || payload.aud !== 'onoff-academy' || !payload.sub || !payload.jti || !payload.iat || !payload.state || !payload.session_binding || !payload.exp || payload.exp <= epoch || payload.exp > epoch + 300 || payload.iat > epoch + 30 || payload.iat < epoch - 300) return null;
    if (!['ADMIN', 'WORKER'].includes(payload.role)) return null;
    return {
      provider: workAssertion ? 'WORK' : 'STAGING_TEST', externalSubject: String(payload.sub), assertionId: String(payload.jti), issuer: String(payload.iss), state: String(payload.state),
      sessionBinding: String(payload.session_binding), accountId: String(payload.account_id || ''), name: String(payload.name || payload.login_id || payload.sub),
      role: payload.role === 'ADMIN' ? 'administrator' : 'learner', organization: payload.department ? String(payload.department) : null,
      workLine: payload.work_line ? String(payload.work_line) : null, shiftGroup: payload.shift_group ? String(payload.shift_group) : null,
      expiresAt: new Date(payload.exp * 1000).toISOString()
    };
  } catch { return null; }
}

export async function verifyWorkAcademyAssertion(request, env, now = Date.now()) {
  const header = request.headers.get('authorization') || '';
  return verifyWorkAcademyAssertionToken(header.startsWith('Bearer ') ? header.slice(7) : '', env, now);
}

export async function signTestAssertion(payload, secret) {
  const header = encodeBase64Url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = encodeBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`))));
  return `${header}.${body}.${signature}`;
}
