import type { PageServerLoad } from './$types';
import { getListingById, getListingDisabledDates } from '$lib/server/listings';

export const load: PageServerLoad = async ({ url }) => {
	const listingId = url.searchParams.get('listingId') || 'villa-aix-01';
	const listing = await getListingById(listingId);
	const availabilityInfo = await getListingDisabledDates(listingId);

	return {
		listing: listing || {
			id: 'villa-aix-01',
			title: "Villa d'Exception avec Piscine & Sound System",
			city: 'Aix-en-Provence',
			pricePerNight: 850,
			securityDeposit: 500,
			maxCapacity: 40
		},
		availabilityInfo
	};
};
