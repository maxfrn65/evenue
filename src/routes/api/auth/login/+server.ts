import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loginUser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return json({ error: 'Email et mot de passe requis.' }, { status: 400 });
		}

		const user = await loginUser(email, password);

		// Set HTTP-only session cookie
		cookies.set('evenue_session', user.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({ success: true, user }, { status: 200 });
	} catch (error: any) {
		return json({ error: error.message || 'Identifiants invalides.' }, { status: 401 });
	}
};
