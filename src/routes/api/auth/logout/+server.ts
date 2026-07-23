import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE_NAME, sessionClearOptions } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE_NAME, sessionClearOptions);
	return json({ success: true, message: 'Déconnexion effectuée.' });
};
