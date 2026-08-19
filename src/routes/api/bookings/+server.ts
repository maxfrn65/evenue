import { json } from '@sveltejs/kit';
import { toErrorMessage } from '$lib/utils';
import type { RequestHandler } from './$types';
import { createBooking } from '$lib/server/bookings';

export const POST: RequestHandler = async ({ request, locals }) => {
	// A booking creates financial records (escrow, insurance policy) on behalf of
	// a user: it must never be attributed to a fallback account. Authentication is
	// mandatory (OWASP A01: Broken Access Control).
	const guestId = locals.user?.id;

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
				stripeClientSecret: result.stripeClientSecret,
				simulated: result.simulated
			},
			{ status: 201 }
		);
	} catch (error) {
		return json(
			{ success: false, error: toErrorMessage(error, 'Erreur lors de la réservation.') },
			{ status: 400 }
		);
	}
};
