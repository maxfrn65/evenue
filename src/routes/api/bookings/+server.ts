import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createBooking } from '$lib/server/bookings';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		let guestId = cookies.get('evenue_session');

		if (!guestId) {
			// Find or create test guest for demonstration
			let guest = await prisma.user.findFirst({ where: { role: 'GUEST' } });
			if (!guest) {
				guest = await prisma.user.create({
					data: {
						email: 'guest.demo@evenue.fr',
						passwordHash: 'scrypt$dummyhash',
						firstName: 'Invité',
						lastName: 'Demo',
						role: 'GUEST'
					}
				});
			}
			guestId = guest.id;
		}

		const body = await request.json();
		const { listingId, startDate, endDate, guestCount } = body;

		if (!listingId || !startDate || !endDate) {
			return json({ success: false, error: 'Paramètres de réservation manquants.' }, { status: 400 });
		}

		const result = await createBooking({
			listingId,
			guestId,
			startDate,
			endDate,
			guestCount: guestCount ? Number(guestCount) : 1
		});

		return json({
			success: true,
			booking: result.booking,
			insurancePolicy: result.insurancePolicy,
			stripeClientSecret: result.stripeClientSecret
		}, { status: 201 });
	} catch (error: any) {
		return json({ success: false, error: error.message || 'Erreur lors de la réservation.' }, { status: 400 });
	}
};
