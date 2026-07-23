import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { updateListing, deleteListing } from '$lib/server/listings';

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const updated = await updateListing(params.id, userId, body);

		return json({ success: true, listing: updated });
	} catch (error: any) {
		return json({ success: false, error: error.message || 'Erreur lors de la mise à jour.' }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		await deleteListing(params.id, userId);

		return json({ success: true });
	} catch (error: any) {
		return json({ success: false, error: error.message || 'Erreur lors de la suppression.' }, { status: 400 });
	}
};
