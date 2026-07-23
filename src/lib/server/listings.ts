import { prisma } from './db';
import { fetchAndParseExternalICal } from './ical';

export interface ListingFilterInput {
	city?: string;
	minPrice?: number;
	maxPrice?: number;
	minCapacity?: number;
	eventType?: string;
	startDate?: string;
	endDate?: string;
}

export interface AvailabilityRange {
	startDate: string;
	endDate: string;
}

export interface CreateListingInput {
	hostId: string;
	title: string;
	description: string;
	address: string;
	city: string;
	zipCode: string;
	latitude: number;
	longitude: number;
	pricePerNight: number;
	securityDeposit?: number;
	maxCapacity: number;
	eventTypeAllowed: string[];
	imageUrl?: string;
	imageUrls?: string[];
	icalSyncUrl?: string;
	availableStartDate?: string;
	availableEndDate?: string;
	availabilityRanges?: AvailabilityRange[];
}

export interface UpdateListingInput {
	title?: string;
	description?: string;
	address?: string;
	city?: string;
	zipCode?: string;
	latitude?: number;
	longitude?: number;
	pricePerNight?: number;
	securityDeposit?: number;
	maxCapacity?: number;
	eventTypeAllowed?: string[];
	imageUrl?: string;
	imageUrls?: string[];
	icalSyncUrl?: string;
	availableStartDate?: string;
	availableEndDate?: string;
	availabilityRanges?: AvailabilityRange[];
}

/**
 * Get listings from PostgreSQL database with dynamic search & date filters.
 */
export async function getListings(filters: ListingFilterInput = {}) {
	const where: any = {};

	if (filters.city) {
		where.city = { contains: filters.city, mode: 'insensitive' };
	}

	if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
		where.pricePerNight = {};
		if (filters.minPrice !== undefined) where.pricePerNight.gte = filters.minPrice;
		if (filters.maxPrice !== undefined) where.pricePerNight.lte = filters.maxPrice;
	}

	if (filters.minCapacity !== undefined) {
		where.maxCapacity = { gte: filters.minCapacity };
	}

	if (filters.eventType) {
		where.eventTypeAllowed = { has: filters.eventType };
	}

	// Date range availability filter
	if (filters.startDate && filters.endDate) {
		const reqStart = new Date(filters.startDate);
		const reqEnd = new Date(filters.endDate);

		if (!isNaN(reqStart.getTime()) && !isNaN(reqEnd.getTime()) && reqStart < reqEnd) {
			where.AND = [
				{
					OR: [
						{ availableStartDate: null },
						{ availableStartDate: { lte: reqStart } }
					]
				},
				{
					OR: [
						{ availableEndDate: null },
						{ availableEndDate: { gte: reqEnd } }
					]
				},
				// Ensure no overlapping confirmed or pending bookings
				{
					bookings: {
						none: {
							status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'DISPUTED'] },
							startDate: { lt: reqEnd },
							endDate: { gt: reqStart }
						}
					}
				}
			];
		}
	}

	let listings = await prisma.listing.findMany({
		where,
		include: {
			host: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					kycStatus: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	// Additional filter for multiple availabilityRanges if defined on listings
	if (filters.startDate && filters.endDate) {
		const reqStartStr = filters.startDate;
		const reqEndStr = filters.endDate;

		listings = listings.filter((listing) => {
			const ranges = (listing.availabilityRanges as unknown as AvailabilityRange[]) || [];
			if (ranges.length === 0) return true; // Default open if no custom ranges configured

			// Must fall inside AT LEAST ONE defined availability range
			return ranges.some(
				(r) => r.startDate <= reqStartStr && r.endDate >= reqEndStr
			);
		});
	}

	return listings;
}

/**
 * Get a single listing by ID with Host info.
 */
export async function getListingById(id: string) {
	const listing = await prisma.listing.findUnique({
		where: { id },
		include: {
			host: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					kycStatus: true,
					stripeAccountId: true,
					createdAt: true
				}
			}
		}
	});

	return listing;
}

/**
 * Fetch all booked/blocked date ranges for a listing (internal bookings + external iCal events).
 */
export async function getListingDisabledDates(listingId: string) {
	const listing = await prisma.listing.findUnique({
		where: { id: listingId },
		select: {
			availableStartDate: true,
			availableEndDate: true,
			availabilityRanges: true,
			icalSyncUrl: true
		}
	});

	if (!listing) return { disabledRanges: [] };

	const bookings = await prisma.booking.findMany({
		where: {
			listingId,
			status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'DISPUTED'] }
		},
		select: { startDate: true, endDate: true }
	});

	const disabledRanges: Array<{ startDate: string; endDate: string; reason: string }> = [];

	for (const b of bookings) {
		disabledRanges.push({
			startDate: b.startDate.toISOString().split('T')[0],
			endDate: b.endDate.toISOString().split('T')[0],
			reason: 'Réservé'
		});
	}

	if (listing.icalSyncUrl) {
		const icalEvents = await fetchAndParseExternalICal(listing.icalSyncUrl);
		for (const evt of icalEvents) {
			disabledRanges.push({
				startDate: evt.startDate.toISOString().split('T')[0],
				endDate: evt.endDate.toISOString().split('T')[0],
				reason: evt.summary || 'Indisponible iCal'
			});
		}
	}

	return {
		availableStartDate: listing.availableStartDate ? listing.availableStartDate.toISOString().split('T')[0] : null,
		availableEndDate: listing.availableEndDate ? listing.availableEndDate.toISOString().split('T')[0] : null,
		availabilityRanges: (listing.availabilityRanges as unknown as AvailabilityRange[]) || [],
		disabledRanges
	};
}

/**
 * Create a new event listing.
 */
export async function createListing(input: CreateListingInput) {
	const listing = await prisma.listing.create({
		data: {
			hostId: input.hostId,
			title: input.title.trim(),
			description: input.description.trim(),
			address: input.address.trim(),
			city: input.city.trim(),
			zipCode: input.zipCode.trim(),
			latitude: input.latitude,
			longitude: input.longitude,
			pricePerNight: input.pricePerNight,
			securityDeposit: input.securityDeposit ?? 500.0,
			maxCapacity: input.maxCapacity,
			eventTypeAllowed: input.eventTypeAllowed,
			imageUrl: input.imageUrl?.trim(),
			imageUrls: input.imageUrls && input.imageUrls.length > 0 ? input.imageUrls : input.imageUrl ? [input.imageUrl.trim()] : [],
			icalSyncUrl: input.icalSyncUrl?.trim(),
			availableStartDate: input.availableStartDate ? new Date(input.availableStartDate) : null,
			availableEndDate: input.availableEndDate ? new Date(input.availableEndDate) : null,
			availabilityRanges: input.availabilityRanges ? (input.availabilityRanges as any) : undefined
		}
	});

	return listing;
}

/**
 * Update an existing listing.
 */
export async function updateListing(id: string, hostId: string, input: UpdateListingInput) {
	const listing = await prisma.listing.findUnique({
		where: { id }
	});

	if (!listing) {
		throw new Error('Annonce introuvable.');
	}

	if (listing.hostId !== hostId) {
		throw new Error("Vous n'êtes pas autorisé à modifier cette annonce.");
	}

	const data: any = {};
	if (input.title !== undefined) data.title = input.title.trim();
	if (input.description !== undefined) data.description = input.description.trim();
	if (input.address !== undefined) data.address = input.address.trim();
	if (input.city !== undefined) data.city = input.city.trim();
	if (input.zipCode !== undefined) data.zipCode = input.zipCode.trim();
	if (input.latitude !== undefined) data.latitude = input.latitude;
	if (input.longitude !== undefined) data.longitude = input.longitude;
	if (input.pricePerNight !== undefined) data.pricePerNight = input.pricePerNight;
	if (input.securityDeposit !== undefined) data.securityDeposit = input.securityDeposit;
	if (input.maxCapacity !== undefined) data.maxCapacity = input.maxCapacity;
	if (input.eventTypeAllowed !== undefined) data.eventTypeAllowed = input.eventTypeAllowed;
	if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl.trim();
	if (input.imageUrls !== undefined) data.imageUrls = input.imageUrls;
	if (input.icalSyncUrl !== undefined) data.icalSyncUrl = input.icalSyncUrl.trim();
	if (input.availableStartDate !== undefined) {
		data.availableStartDate = input.availableStartDate ? new Date(input.availableStartDate) : null;
	}
	if (input.availableEndDate !== undefined) {
		data.availableEndDate = input.availableEndDate ? new Date(input.availableEndDate) : null;
	}
	if (input.availabilityRanges !== undefined) {
		data.availabilityRanges = input.availabilityRanges as any;
	}

	return await prisma.listing.update({
		where: { id },
		data
	});
}

/**
 * Delete an existing listing (if no active bookings exist).
 */
export async function deleteListing(id: string, hostId: string) {
	const listing = await prisma.listing.findUnique({
		where: { id },
		include: {
			bookings: {
				where: {
					status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
				}
			}
		}
	});

	if (!listing) {
		throw new Error('Annonce introuvable.');
	}

	if (listing.hostId !== hostId) {
		throw new Error("Vous n'êtes pas autorisé à modifier cette annonce.");
	}

	if (listing.bookings.length > 0) {
		throw new Error('Impossible de supprimer une annonce ayant des réservations actives en cours.');
	}

	await prisma.listing.delete({
		where: { id }
	});

	return { success: true };
}
