import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const bookingId = url.searchParams.get('bookingId');

	// Fetch confirmed or completed user bookings
	const bookings = await prisma.booking.findMany({
		where: {
			OR: [{ guestId: user.id }, { listing: { hostId: user.id } }],
			status: { in: ['CONFIRMED', 'COMPLETED', 'DISPUTED'] }
		},
		include: {
			listing: {
				select: { id: true, title: true, city: true }
			},
			insurancePolicy: true
		},
		orderBy: { startDate: 'desc' }
	});

	return {
		user,
		bookings,
		selectedBookingId: bookingId
	};
};
