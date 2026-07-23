import type { PageServerLoad } from './$types';
import { getListings } from '$lib/server/listings';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async () => {
	try {
		const listings = await getListings({});
		return {
			featuredListings: listings.slice(0, 3)
		};
	} catch (err: any) {
		logger.error(`Error loading featured listings for home page: ${err?.message || err}`, {
			context: 'HOME_PAGE_LOAD',
			error: err?.message || String(err),
			stack: err?.stack
		});

		// Return empty array fallback to prevent HTTP 500 crash
		return {
			featuredListings: []
		};
	}
};
