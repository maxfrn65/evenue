import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getListings, createListing } from '$lib/server/listings';

export const GET: RequestHandler = async ({ url }) => {
	const city = url.searchParams.get('city') || undefined;
	const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
	const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
	const minCapacity = url.searchParams.get('minCapacity') ? Number(url.searchParams.get('minCapacity')) : undefined;
	const eventType = url.searchParams.get('eventType') || undefined;

	try {
		const listings = await getListings({ city, minPrice, maxPrice, minCapacity, eventType });
		return json({ success: true, listings });
	} catch (error: any) {
		return json({ error: error.message || 'Erreur lors de la récupération du catalogue.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ error: 'Vous devez être connecté pour publier un logement.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const listing = await createListing({
			...body,
			hostId: userId
		});

		return json({ success: true, listing }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message || 'Erreur lors de la création du logement.' }, { status: 400 });
	}
};
