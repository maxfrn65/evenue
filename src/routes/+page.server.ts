import type { PageServerLoad } from './$types';
import { toErrorMessage } from '$lib/utils';
import { getListings } from '$lib/server/listings';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async () => {
	try {
		const listings = await getListings({});
		return {
			featuredListings: listings.slice(0, 3)
		};
	} catch (err) {
		const message = toErrorMessage(err);
		logger.error(`Error loading featured listings for home page: ${message}`, {
			context: 'HOME_PAGE_LOAD',
			error: message,
			stack: err instanceof Error ? err.stack : undefined
		});

		// Return empty array fallback to prevent HTTP 500 crash
		return {
			featuredListings: []
		};
	}
};
