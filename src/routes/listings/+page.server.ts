import type { PageServerLoad } from './$types';
import { getListings } from '$lib/server/listings';

export const load: PageServerLoad = async ({ url }) => {
	const city = url.searchParams.get('city') || undefined;
	const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
	const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
	const minCapacity = url.searchParams.get('minCapacity') ? Number(url.searchParams.get('minCapacity')) : undefined;
	const eventType = url.searchParams.get('eventType') || undefined;
	const startDate = url.searchParams.get('startDate') || undefined;
	const endDate = url.searchParams.get('endDate') || undefined;

	const listings = await getListings({ city, minPrice, maxPrice, minCapacity, eventType, startDate, endDate });

	return {
		listings,
		filters: { city, minPrice, maxPrice, minCapacity, eventType, startDate, endDate }
	};
};
