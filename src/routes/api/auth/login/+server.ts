import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loginUser } from '$lib/server/auth';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '$lib/server/session';
import { rateLimit, clientKey } from '$lib/server/rate-limit';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	// Brute-force protection: 10 attempts / 5 min / IP (OWASP A07).
	const limit = rateLimit(clientKey(getClientAddress, request, 'login'), {
		limit: 10,
		windowMs: 5 * 60 * 1000
	});
	if (!limit.allowed) {
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
		return json({ error: error.message || 'Identifiants invalides.' }, { status: 401 });
	}
};
