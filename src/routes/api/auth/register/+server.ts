import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { registerUser } from '$lib/server/auth';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '$lib/server/session';
import { rateLimit, clientKey } from '$lib/server/rate-limit';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	// Abuse protection: 5 account creations / 15 min / IP (OWASP A04).
	const limit = rateLimit(clientKey(getClientAddress, request, 'register'), {
		limit: 5,
		windowMs: 15 * 60 * 1000
	});
	if (!limit.allowed) {
		return json(
			{ error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
			{ status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
		);
	}

	try {
		const body = await request.json();
		const { email, password, firstName, lastName, role } = body;

		if (!email || !password || !firstName || !lastName) {
			return json({ error: 'Tous les champs obligatoires doivent être remplis.' }, { status: 400 });
		}

		if (password.length < 8) {
			return json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
		}

		const user = await registerUser({
			email,
			password,
			firstName,
			lastName,
			role: role === 'HOST' ? 'HOST' : 'GUEST'
		});

		// Set hardened HTTP-only session cookie (httpOnly, sameSite, secure in prod)
		cookies.set(SESSION_COOKIE_NAME, user.id, sessionCookieOptions);

		return json({ success: true, user }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message || 'Erreur lors de l\'inscription.' }, { status: 400 });
	}
};
