import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDashboardData } from '$lib/server/dashboard';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	try {
		const dashboard = await getDashboardData(user.id, user.role);
		return {
			user,
			dashboard
		};
	} catch (err: any) {
		logger.error(`Error loading dashboard data for user ${user.id}: ${err?.message || err}`, {
			context: 'DASHBOARD_LOAD',
			userId: user.id,
			error: err?.message || String(err),
			stack: err?.stack
		});

		return {
			user,
			dashboard: {
				stats: { totalBookings: 0, upcomingBookings: 0, totalSpent: 0, totalListings: 0, totalEarnings: 0 },
				bookings: [],
				listings: [],
				hostReceivedBookings: []
			}
		};
	}
};
