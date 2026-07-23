import type { PageServerLoad } from './$types';
import { getListings } from '$lib/server/listings';

export const load: PageServerLoad = async () => {
	const listings = await getListings({});
	// Return top 3 featured listings
	return {
		featuredListings: listings.slice(0, 3)
	};
};
