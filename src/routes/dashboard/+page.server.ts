import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDashboardData } from '$lib/server/dashboard';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const dashboard = await getDashboardData(user.id, user.role);

	return {
		user,
		dashboard
	};
};
