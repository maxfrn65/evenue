import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { cancelBooking } from '$lib/server/dashboard';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { bookingId } = body;

		if (!bookingId) {
			return json({ success: false, error: 'Identifiant de réservation manquant.' }, { status: 400 });
		}

		const cancelled = await cancelBooking(bookingId, userId);

		if (!cancelled) {
			return json(
				{ success: false, error: 'Réservation introuvable ou non annulable.' },
				{ status: 404 }
			);
		}

		return json({ success: true });
	} catch (error) {
		return json({ success: false, error: 'Erreur interne.' }, { status: 500 });
	}
};
