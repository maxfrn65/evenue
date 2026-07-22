import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { registerUser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
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

		// Set HTTP-only session cookie
		cookies.set('evenue_session', user.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({ success: true, user }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message || 'Erreur lors de l\'inscription.' }, { status: 400 });
	}
};
