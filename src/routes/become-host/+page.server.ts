import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	if (user.role === 'HOST') {
		throw redirect(303, '/listings/new');
	}

	return { user };
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		const userId = cookies.get('evenue_session');

		if (!userId) {
			return fail(401, { error: 'Non authentifié.' });
		}

		// Upgrade user role to HOST
		await prisma.user.update({
			where: { id: userId },
			data: { role: 'HOST', kycStatus: 'VERIFIED' }
		});

		throw redirect(303, '/listings/new');
	}
};
