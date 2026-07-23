import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createBooking } from '$lib/server/bookings';

export const POST: RequestHandler = async ({ request, cookies }) => {
	// A booking creates financial records (escrow, insurance policy) on behalf of
	// a user: it must never be attributed to a fallback account. Authentication is
	// mandatory (OWASP A01: Broken Access Control).
	const guestId = cookies.get('evenue_session');

	if (!guestId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { listingId, startDate, endDate, guestCount } = body;

		if (!listingId || !startDate || !endDate) {
			return json(
				{ success: false, error: 'Paramètres de réservation manquants.' },
				{ status: 400 }
			);
		}

		const result = await createBooking({
			listingId,
			guestId,
			startDate,
			endDate,
			guestCount: guestCount ? Number(guestCount) : 1
		});

		return json(
			{
				success: true,
				booking: result.booking,
				insurancePolicy: result.insurancePolicy,
				stripeClientSecret: result.stripeClientSecret
			},
			{ status: 201 }
		);
	} catch (error: any) {
		return json(
			{ success: false, error: error.message || 'Erreur lors de la réservation.' },
			{ status: 400 }
		);
	}
};
