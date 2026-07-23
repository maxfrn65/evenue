import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createListing } from '$lib/server/listings';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const listing = await createListing({
			...body,
			hostId: userId,
			latitude: body.latitude || 48.8566,
			longitude: body.longitude || 2.3522
		});

		return json({ success: true, listing });
	} catch (error: any) {
		return json({ success: false, error: error.message || 'Erreur lors de la création de l\'annonce.' }, { status: 400 });
	}
};
