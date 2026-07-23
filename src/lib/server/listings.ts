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
	imageUrls?: string[];
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
			imageUrls: input.imageUrls && input.imageUrls.length > 0 ? input.imageUrls : input.imageUrl ? [input.imageUrl.trim()] : [],
			icalSyncUrl: input.icalSyncUrl?.trim()
		}
	});

	return listing;
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
}

/**
 * Update an existing event listing owned by a host.
 */
export async function updateListing(id: string, hostId: string, input: UpdateListingInput) {
	const existing = await prisma.listing.findUnique({
		where: { id }
	});

	if (!existing) {
		throw new Error('Annonce introuvable.');
	}

	if (existing.hostId !== hostId) {
		throw new Error('Vous n\'êtes pas autorisé à modifier cette annonce.');
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

	const updated = await prisma.listing.update({
		where: { id },
		data
	});

	return updated;
}

/**
 * Delete an existing event listing owned by a host.
 * Fails if active pending/confirmed bookings exist for this listing.
 */
export async function deleteListing(id: string, hostId: string) {
	const existing = await prisma.listing.findUnique({
		where: { id },
		include: {
			bookings: {
				where: {
					status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
				}
			}
		}
	});

	if (!existing) {
		throw new Error('Annonce introuvable.');
	}

	if (existing.hostId !== hostId) {
		throw new Error('Vous n\'êtes pas autorisé à supprimer cette annonce.');
	}

	if (existing.bookings && existing.bookings.length > 0) {
		throw new Error('Impossible de supprimer une annonce ayant des réservations actives en cours.');
	}

	await prisma.listing.delete({
		where: { id }
	});

	return { success: true, deletedId: id };
}
