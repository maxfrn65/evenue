import { json, type RequestHandler } from '@sveltejs/kit';
import { getUnreadCount } from '$lib/server/messages';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	return json({ success: true, unreadCount: await getUnreadCount(locals.user.id) });
};
