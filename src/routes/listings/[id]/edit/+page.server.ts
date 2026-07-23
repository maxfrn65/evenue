import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getListingById } from '$lib/server/listings';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const listing = await getListingById(params.id);

	if (!listing) {
		throw redirect(303, '/dashboard');
	}

	// Verify that user is the host owner of the listing
	if (listing.hostId !== user.id) {
		throw redirect(303, `/listings/${listing.id}`);
	}

	return {
		user,
		listing
	};
};
