import type { PageServerLoad } from './$types';
import { toErrorMessage } from '$lib/utils';
import { getListings } from '$lib/server/listings';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async ({ url }) => {
	const city = url.searchParams.get('city') || undefined;
	const minPrice = url.searchParams.get('minPrice')
		? Number(url.searchParams.get('minPrice'))
		: undefined;
	const maxPrice = url.searchParams.get('maxPrice')
		? Number(url.searchParams.get('maxPrice'))
		: undefined;
	const minCapacity = url.searchParams.get('minCapacity')
		? Number(url.searchParams.get('minCapacity'))
		: undefined;
	const eventType = url.searchParams.get('eventType') || undefined;
	const startDate = url.searchParams.get('startDate') || undefined;
	const endDate = url.searchParams.get('endDate') || undefined;

	try {
		const listings = await getListings({
			city,
			minPrice,
			maxPrice,
			minCapacity,
			eventType,
			startDate,
			endDate
		});
		return {
			listings,
			filters: { city, minPrice, maxPrice, minCapacity, eventType, startDate, endDate }
		};
	} catch (err) {
		const message = toErrorMessage(err);
		logger.error(`Error loading listings for catalogue page: ${message}`, {
			context: 'LISTINGS_PAGE_LOAD',
			error: message,
			stack: err instanceof Error ? err.stack : undefined
		});

		return {
			listings: [],
			filters: { city, minPrice, maxPrice, minCapacity, eventType, startDate, endDate }
		};
	}
};
