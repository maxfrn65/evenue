import type { RequestHandler } from './$types';
import { toErrorMessage } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { createListing } from '$lib/server/listings';

export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.user?.id;

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
	} catch (error) {
		return json(
			{ success: false, error: toErrorMessage(error, "Erreur lors de la création de l'annonce.") },
			{ status: 400 }
		);
	}
};
