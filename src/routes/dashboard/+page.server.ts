import type { PageServerLoad } from './$types';
import { toErrorMessage } from '$lib/utils';
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
	} catch (err) {
		const message = toErrorMessage(err);
		logger.error(`Error loading dashboard data for user ${user.id}: ${message}`, {
			context: 'DASHBOARD_LOAD',
			userId: user.id,
			error: message,
			stack: err instanceof Error ? err.stack : undefined
		});

		return {
			user,
			dashboard: {
				stats: {
					totalBookings: 0,
					upcomingBookings: 0,
					totalSpent: 0,
					totalListings: 0,
					totalEarnings: 0
				},
				bookings: [],
				listings: [],
				hostReceivedBookings: []
			}
		};
	}
};
