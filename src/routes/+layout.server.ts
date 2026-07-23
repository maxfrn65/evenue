import type { LayoutServerLoad } from './$types';
import { getUnreadCount } from '$lib/server/messages';

export const load: LayoutServerLoad = async ({ locals }) => {
	const unreadMessageCount = locals.user ? await getUnreadCount(locals.user.id) : 0;

	return { user: locals.user, unreadMessageCount };
};
