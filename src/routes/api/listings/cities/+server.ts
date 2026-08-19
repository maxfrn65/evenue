import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

/** Shown when the catalogue is still empty, and as the fallback if the query fails. */
const DEFAULT_CITIES = [
	'Paris',
	'Marseille',
	'Aix-en-Provence',
	'Lyon',
	'Nice',
	'Bordeaux',
	'Toulouse',
	'Lille'
];

export const GET: RequestHandler = async () => {
	try {
		const rawListings = await prisma.listing.findMany({
			select: { city: true }
		});

		const dbCities = rawListings.map((l: { city: string }) => l.city).filter(Boolean);

		// Merge and deduplicate
		const allCities = Array.from(new Set([...dbCities, ...DEFAULT_CITIES])).sort((a, b) =>
			a.localeCompare(b, 'fr')
		);

		return json({ success: true, cities: allCities }, { status: 200 });
	} catch {
		return json({ success: false, cities: DEFAULT_CITIES }, { status: 200 });
	}
};
