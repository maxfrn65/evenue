import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getListingById } from '$lib/server/listings';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const listing = await getListingById(params.id);

		if (!listing) {
			return json({ error: 'Logement introuvable.' }, { status: 404 });
		}

		return json({ success: true, listing });
	} catch (error: any) {
		return json({ error: error.message || 'Erreur lors de la récupération du logement.' }, { status: 500 });
	}
};
