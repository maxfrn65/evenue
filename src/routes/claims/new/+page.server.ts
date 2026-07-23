import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { user } = await parent();

	if (!user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/auth/login?redirectTo=${redirectTo}`);
	}

	const bookingId = url.searchParams.get('bookingId');

	// Fetch host listings bookings where user is the HOST
	const hostBookings = await prisma.booking.findMany({
		where: {
			listing: { hostId: user.id },
			status: { in: ['CONFIRMED', 'COMPLETED', 'DISPUTED'] }
		},
		include: {
			listing: {
				select: { id: true, title: true, city: true, hostId: true }
			},
			guest: {
				select: { id: true, firstName: true, lastName: true }
			},
			insurancePolicy: true
		},
		orderBy: { startDate: 'desc' }
	});

	// If a specific bookingId is provided, check its details and user's role on it
	let selectedBooking: any = null;
	let isHostOfSelected = false;
	let hoursSinceEnd = 0;

	if (bookingId) {
		selectedBooking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				listing: { select: { id: true, title: true, city: true, hostId: true } },
				guest: { select: { id: true, firstName: true, lastName: true } },
				insurancePolicy: true
			}
		});

		if (selectedBooking) {
			isHostOfSelected = selectedBooking.listing.hostId === user.id;
			const now = new Date();
			const eventEnd = new Date(selectedBooking.endDate);
			hoursSinceEnd = (now.getTime() - eventEnd.getTime()) / (1000 * 60 * 60);
		}
	}

	return {
		user,
		hostBookings,
		selectedBooking,
		isHostOfSelected,
		hoursSinceEnd,
		selectedBookingId: bookingId
	};
};
