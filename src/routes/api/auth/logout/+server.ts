import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('evenue_session', { path: '/' });
	return json({ success: true, message: 'Déconnexion effectuée.' });
};
