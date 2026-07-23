import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		const rawListings = await prisma.listing.findMany({
			select: { city: true }
		});

		const defaultCities = ['Paris', 'Marseille', 'Aix-en-Provence', 'Lyon', 'Nice', 'Bordeaux', 'Toulouse', 'Lille'];
		const dbCities = rawListings.map((l: { city: string }) => l.city).filter(Boolean);

		// Merge and deduplicate
		const allCities = Array.from(new Set([...dbCities, ...defaultCities])).sort((a, b) =>
			a.localeCompare(b, 'fr')
		);

		return json({ success: true, cities: allCities }, { status: 200 });
	} catch (error: any) {
		return json(
			{
				success: false,
				cities: ['Paris', 'Marseille', 'Aix-en-Provence', 'Lyon', 'Nice', 'Bordeaux', 'Toulouse', 'Lille']
			},
			{ status: 200 }
		);
	}
};
