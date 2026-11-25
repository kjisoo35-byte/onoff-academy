import { verifyWorkAcademyAssertion, verifyWorkAcademyAssertionToken } from '../../../src/server/work-auth.js';
import { authenticateAcademySession, beginAcademyLogin, clearAcademySessionCookie, clearLoginStateCookie, issueAcademySession, revokeAcademySession } from '../../../src/server/academy-auth.js';
import { D1LearningRepository } from '../../../src/server/d1-learning-repository.js';

const json = (payload, status = 200, headers = {}) => new Response(JSON.stringify(payload), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
});
const body = async request => {
  if (Number(request.headers.get('content-length') || 0) > 1024 * 1024) throw Object.assign(new Error('payload_too_large'), { statusCode: 413 });
  try { return await request.json(); } catch { throw Object.assign(new Error('invalid_json'), { statusCode: 400 }); }
};
const route = context => `/${Array.isArray(context.params.path) ? context.params.path.join('/') : context.params.path || ''}`;
const sameOrigin = request => !request.headers.get('origin') || request.headers.get('origin') === new URL(request.url).origin;

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'database_binding_missing' }, 503);
  const pathname = route(context);
  try {
    if (pathname === '/auth/start' && request.method === 'GET') {
      if (!env.WORK_ACADEMY_LOGIN_URL) return json({ error: 'work_login_not_configured' }, 503);
      const login = await beginAcademyLogin(env.DB, new URL(request.url).searchParams.get('return_to') || '/');
      const destination = new URL(env.WORK_ACADEMY_LOGIN_URL);
      destination.searchParams.set('state', login.state);
      destination.searchParams.set('audience', 'onoff-academy');
      return new Response(null, { status: 302, headers: { location: destination.toString(), 'set-cookie': login.cookie, 'cache-control': 'no-store' } });
    }
    if (pathname === '/auth/exchange' && request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      let identity = await verifyWorkAcademyAssertion(request, env);
      if (!identity && contentType.includes('application/x-www-form-urlencoded')) {
        const form = await request.formData();
        identity = await verifyWorkAcademyAssertionToken(String(form.get('assertion') || ''), env);
      }
      if (!identity) return json({ error: 'authentication_required' }, 401);
      const session = await issueAcademySession(env.DB, identity, request);
      const headers = new Headers({ 'cache-control': 'no-store' });
      headers.append('set-cookie', session.cookie);
      headers.append('set-cookie', clearLoginStateCookie);
      if (contentType.includes('application/x-www-form-urlencoded')) {
        headers.set('location', new URL(session.returnTo, request.url).toString());
        return new Response(null, { status: 303, headers });
      }
      headers.set('content-type', 'application/json; charset=utf-8');
      return new Response(JSON.stringify({ user: session.identity, expiresAt: session.expiresAt }), { status: 200, headers });
    }
    if (pathname === '/auth/logout' && request.method === 'POST') {
      if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
      await revokeAcademySession(request, env.DB);
      return json({ ok: true }, 200, { 'set-cookie': clearAcademySessionCookie });
    }
    const identity = await authenticateAcademySession(request, env.DB);
    if (!identity) return json({ error: 'authentication_required' }, 401);
    const repository = new D1LearningRepository(env.DB);
    if (pathname === '/session' && request.method === 'GET') return json({ user: identity });
    if (pathname === '/progress/me' && request.method === 'GET') return json(await repository.get(identity));
    if (pathname === '/progress/events' && request.method === 'POST') {
      if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
      return json(await repository.apply(identity, await body(request)));
    }
    if (pathname === '/progress/import' && request.method === 'POST') {
      if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
      return json(await repository.importLegacy(identity, await body(request)));
    }
    if (pathname === '/admin/progress' && request.method === 'GET') {
      if (identity.role !== 'administrator') return json({ error: 'forbidden' }, 403);
      const filters = Object.fromEntries(new URL(request.url).searchParams);
      return json({ rows: await repository.summary(filters) });
    }
    return json({ error: 'not_found' }, 404);
  } catch (cause) {
    return json({ error: cause.message || 'server_error' }, cause.statusCode || 500);
  }
}
