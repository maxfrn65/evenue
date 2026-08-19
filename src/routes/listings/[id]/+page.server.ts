import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getListingById, getListingDisabledDates } from '$lib/server/listings';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const listing = await getListingById(params.id);

	// Previously this fell back to a hardcoded copy of the four seeded listings, and any
	// unknown id was served the Aix villa — a random URL rendered a real-looking page with
	// a working booking button. The database is the only source of truth.
	if (!listing) {
		throw error(404, "Cette annonce n'existe pas ou n'est plus disponible.");
	}

	const availabilityInfo = await getListingDisabledDates(params.id);

	const existingUserBooking = user
		? await prisma.booking.findFirst({
				where: {
					listingId: params.id,
					guestId: user.id,
					status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'COMPLETED', 'DISPUTED'] }
				},
				orderBy: { createdAt: 'desc' }
			})
		: null;

	return { listing, user, existingUserBooking, availabilityInfo };
};
