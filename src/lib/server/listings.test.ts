import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		listing: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { getListings, getListingById, createListing } from './listings';

describe('Listings Service — Event Search & Filtering', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return default listings array', async () => {
		const mockListings = [
			{
				id: 'villa-aix-01',
				title: "Villa d'Exception avec Piscine & Sound System",
				city: 'Aix-en-Provence',
				pricePerNight: 850,
				maxCapacity: 40,
				eventTypeAllowed: ['SOIRÉE', 'ANNIVERSAIRE'],
				host: { id: 'host-1', firstName: 'Jean', lastName: 'Dupont', kycStatus: 'VERIFIED' }
			}
		];

		vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);

		const listings = await getListings({});
		expect(Array.isArray(listings)).toBe(true);
		expect(listings).toHaveLength(1);
		expect(listings[0].title).toContain('Villa');
	});

	it('should support filter inputs by city and eventType', async () => {
		const mockListings = [
			{
				id: 'loft-paris-02',
				title: 'Loft Industriel & Rooftop Privatif',
				city: 'Paris',
				pricePerNight: 1200,
				maxCapacity: 60,
				eventTypeAllowed: ['COCKTAIL', 'SOIRÉE'],
				host: { id: 'host-2', firstName: 'Sophie', lastName: 'Martin', kycStatus: 'VERIFIED' }
			}
		];

		vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);

		const listings = await getListings({ city: 'Paris', eventType: 'SOIRÉE' });
		expect(Array.isArray(listings)).toBe(true);
		expect(listings).toHaveLength(1);
		expect(prisma.listing.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					city: { contains: 'Paris', mode: 'insensitive' },
					eventTypeAllowed: { has: 'SOIRÉE' }
				})
			})
		);
	});

	it('should return a listing by ID', async () => {
		const mockListing = {
			id: 'villa-aix-01',
			title: "Villa d'Exception",
			host: { id: 'host-1', firstName: 'Jean', lastName: 'Dupont', kycStatus: 'VERIFIED', stripeAccountId: null, createdAt: new Date() }
		};

		vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);

		const listing = await getListingById('villa-aix-01');
		expect(listing).not.toBeNull();
		expect(listing?.title).toContain('Villa');
	});
});
