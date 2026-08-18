import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loginUser } from '$lib/server/auth';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '$lib/server/session';
import { rateLimit, clientKey } from '$lib/server/rate-limit';
import { logger } from '$lib/server/logger';
import { recordLoginFailure } from '$lib/server/metrics';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress, locals }) => {
	// Brute-force protection: 10 attempts / 5 min / IP (OWASP A07).
	const clientIp = getClientAddress();
	const limit = rateLimit(clientKey(getClientAddress, request, 'login'), {
		limit: 10,
		windowMs: 5 * 60 * 1000
	});
	if (!limit.allowed) {
		recordLoginFailure('rate_limited');
		// Surfaced to Grafana so the KRI "> 50 failed attempts/min from one IP" (§3.2) can
		// be alerted on. The IP is the subject of the security event, not user profiling.
		logger.warn('Login rate limit reached', {
			context: 'AUTH_FAILURE',
			requestId: locals.requestId,
			path: '/api/auth/login',
			statusCode: 429,
			metadata: { reason: 'rate_limited', ip: clientIp }
		});

		return json(
			{ error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' },
			{ status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
		);
	}

	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return json({ error: 'Email et mot de passe requis.' }, { status: 400 });
		}

		const user = await loginUser(email, password);

		// Set hardened HTTP-only session cookie (httpOnly, sameSite, secure in prod)
		cookies.set(SESSION_COOKIE_NAME, user.id, sessionCookieOptions);

		return json({ success: true, user }, { status: 200 });
	} catch (error: any) {
		recordLoginFailure('invalid_credentials');
		logger.warn('Failed login attempt', {
			context: 'AUTH_FAILURE',
			requestId: locals.requestId,
			path: '/api/auth/login',
			statusCode: 401,
			// Never log the submitted password, nor confirm whether the account exists.
			metadata: { reason: 'invalid_credentials', ip: clientIp }
		});

		return json({ error: error.message || 'Identifiants invalides.' }, { status: 401 });
	}
};
