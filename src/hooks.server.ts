import type { Handle } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

/**
 * Loads the authenticated user once for every request so protected routes and
 * API endpoints can consistently rely on `event.locals.user`.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const userId = event.cookies.get('evenue_session');

	if (!userId) {
		event.locals.user = null;
		return resolve(event);
	}

	try {
		event.locals.user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true
			}
		});
	} catch {
		event.locals.user = null;
	}

	return resolve(event);
};
