import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE_NAME, destroySession, sessionClearOptions } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
	// Clearing the cookie is not enough: the token stays valid server-side until it is
	// deleted, so a copy of it would keep working after "logout".
	await destroySession(cookies.get(SESSION_COOKIE_NAME));
	cookies.delete(SESSION_COOKIE_NAME, sessionClearOptions);

	return json({ success: true, message: 'Déconnexion effectuée.' });
};
