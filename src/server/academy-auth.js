const encoder = new TextEncoder();
const SESSION_COOKIE = 'onoff_academy_session';
const LOGIN_STATE_COOKIE = 'onoff_academy_login_state';
const bytesToHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
const hashToken = async token => bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token))));
const parseCookies = request => Object.fromEntries((request.headers.get('cookie') || '').split(';').map(value => value.trim()).filter(Boolean).map(value => {
  const separator = value.indexOf('=');
  return separator < 0 ? [value, ''] : [value.slice(0, separator), decodeURIComponent(value.slice(separator + 1))];
}));
const randomToken = (bytes = 32) => {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
};
const internalLearnerId = () => `lrn_${crypto.randomUUID().replaceAll('-', '')}`;
const changes = result => Number(result?.meta?.changes ?? result?.changes ?? 0);

export async function beginAcademyLogin(db, returnTo = '/', now = new Date()) {
  const state = randomToken();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
  const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
  await db.prepare('INSERT INTO academy_login_states (state_hash, return_to, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(await hashToken(state), safeReturnTo, expiresAt, createdAt).run();
  return { state, expiresAt, cookie: `${LOGIN_STATE_COOKIE}=${encodeURIComponent(state)}; Path=/api/academy/auth; HttpOnly; Secure; SameSite=None; Max-Age=300` };
}

async function resolveAcademyIdentity(db, externalIdentity, now) {
  const linked = await db.prepare(`SELECT u.user_id FROM academy_external_identities e JOIN academy_users u ON u.user_id=e.academy_user_id
    WHERE e.provider=? AND e.external_subject=?`).bind(externalIdentity.provider, externalIdentity.externalSubject).first();
  if (linked) {
    await db.batch([
      db.prepare('UPDATE academy_users SET display_name=?, role=?, organization=?, work_line=?, shift_group=?, updated_at=? WHERE user_id=?')
        .bind(externalIdentity.name, externalIdentity.role, externalIdentity.organization, externalIdentity.workLine, externalIdentity.shiftGroup, now, linked.user_id),
      db.prepare('UPDATE academy_external_identities SET last_verified_at=? WHERE provider=? AND external_subject=?')
        .bind(now, externalIdentity.provider, externalIdentity.externalSubject)
    ]);
    return { id: linked.user_id, name: externalIdentity.name, role: externalIdentity.role, organization: externalIdentity.organization, workLine: externalIdentity.workLine, shiftGroup: externalIdentity.shiftGroup };
  }
  const legacy = externalIdentity.provider === 'WORK'
    ? await db.prepare("SELECT user_id FROM academy_users WHERE user_id=? AND source='WORK'").bind(externalIdentity.externalSubject).first() : null;
  const academyUserId = legacy?.user_id || internalLearnerId();
  try {
    await db.batch([
      db.prepare(`INSERT INTO academy_users (user_id, display_name, role, organization, work_line, shift_group, source, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name, role=excluded.role,
        organization=excluded.organization, work_line=excluded.work_line, shift_group=excluded.shift_group, updated_at=excluded.updated_at`)
        .bind(academyUserId, externalIdentity.name, externalIdentity.role, externalIdentity.organization, externalIdentity.workLine, externalIdentity.shiftGroup, externalIdentity.provider, now),
      db.prepare('INSERT INTO academy_external_identities (provider, external_subject, academy_user_id, linked_at, last_verified_at) VALUES (?, ?, ?, ?, ?)')
        .bind(externalIdentity.provider, externalIdentity.externalSubject, academyUserId, now, now)
    ]);
  } catch (error) {
    const winner = await db.prepare('SELECT academy_user_id FROM academy_external_identities WHERE provider=? AND external_subject=?')
      .bind(externalIdentity.provider, externalIdentity.externalSubject).first();
    if (!winner) throw error;
    return { id: winner.academy_user_id, name: externalIdentity.name, role: externalIdentity.role, organization: externalIdentity.organization, workLine: externalIdentity.workLine, shiftGroup: externalIdentity.shiftGroup };
  }
  return { id: academyUserId, name: externalIdentity.name, role: externalIdentity.role, organization: externalIdentity.organization, workLine: externalIdentity.workLine, shiftGroup: externalIdentity.shiftGroup };
}

export async function issueAcademySession(db, externalIdentity, request, now = new Date()) {
  const state = parseCookies(request)[LOGIN_STATE_COOKIE];
  if (!state || state !== externalIdentity.state) throw Object.assign(new Error('login_state_mismatch'), { statusCode: 401 });
  const createdAt = now.toISOString();
  const stateHash = await hashToken(state);
  const loginState = await db.prepare('SELECT return_to FROM academy_login_states WHERE state_hash=? AND consumed_at IS NULL AND expires_at>?')
    .bind(stateHash, createdAt).first();
  if (!loginState) throw Object.assign(new Error('assertion_replayed_or_login_expired'), { statusCode: 401 });
  const academyIdentity = await resolveAcademyIdentity(db, externalIdentity, createdAt);
  const assertionUse = await db.prepare(`INSERT OR IGNORE INTO academy_assertion_uses (issuer, assertion_id, academy_user_id, used_at, expires_at)
    SELECT ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM academy_login_states WHERE state_hash=? AND consumed_at IS NULL AND expires_at>?)`)
    .bind(externalIdentity.issuer, externalIdentity.assertionId, academyIdentity.id, createdAt, externalIdentity.expiresAt, stateHash, createdAt).run();
  if (changes(assertionUse) !== 1) throw Object.assign(new Error('assertion_replayed_or_login_expired'), { statusCode: 401 });
  const token = randomToken();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
  await db.batch([
    db.prepare('UPDATE academy_login_states SET consumed_at=? WHERE state_hash=? AND consumed_at IS NULL').bind(createdAt, stateHash),
    db.prepare('INSERT INTO academy_auth_sessions (token_hash, user_id, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)')
      .bind(await hashToken(token), academyIdentity.id, expiresAt, createdAt, createdAt)
  ]);
  return { identity: academyIdentity, cookie: `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`, expiresAt, returnTo: loginState.return_to };
}

export async function authenticateAcademySession(request, db, now = new Date()) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await db.prepare(`SELECT u.user_id, u.display_name, u.role, u.organization, u.work_line, u.shift_group
    FROM academy_auth_sessions s JOIN academy_users u ON u.user_id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`).bind(tokenHash, now.toISOString()).first();
  if (!row) return null;
  await db.prepare('UPDATE academy_auth_sessions SET last_seen_at=? WHERE token_hash=?').bind(now.toISOString(), tokenHash).run();
  return { id: row.user_id, name: row.display_name, role: row.role, organization: row.organization, workLine: row.work_line, shiftGroup: row.shift_group };
}

export async function revokeAcademySession(request, db) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (token) await db.prepare('DELETE FROM academy_auth_sessions WHERE token_hash=?').bind(await hashToken(token)).run();
}

export const clearAcademySessionCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export const clearLoginStateCookie = `${LOGIN_STATE_COOKIE}=; Path=/api/academy/auth; HttpOnly; Secure; SameSite=None; Max-Age=0`;
