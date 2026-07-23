import { prisma } from './db';

export interface ListingFilterInput {
	city?: string;
	minPrice?: number;
	maxPrice?: number;
	minCapacity?: number;
	eventType?: string;
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
	icalSyncUrl?: string;
}

/**
 * Get listings from PostgreSQL database with dynamic search filters.
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

	const listings = await prisma.listing.findMany({
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
			icalSyncUrl: input.icalSyncUrl?.trim()
		}
	});

	return listing;
}
