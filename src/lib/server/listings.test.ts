import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		listing: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { getListings, getListingById, createListing, updateListing, deleteListing } from './listings';

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

	it('should update listing successfully if user is the host owner', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			hostId: 'host-1',
			title: 'Old title'
		} as any);

		vi.mocked(prisma.listing.update).mockResolvedValue({
			id: 'listing-1',
			hostId: 'host-1',
			title: 'New title',
			pricePerNight: 900
		} as any);

		const updated = await updateListing('listing-1', 'host-1', {
			title: 'New title',
			pricePerNight: 900
		});

		expect(updated.title).toBe('New title');
		expect(updated.pricePerNight).toBe(900);
	});

	it('should throw error when updating listing owned by another host', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			hostId: 'host-other',
			title: 'Old title'
		} as any);

		await expect(
			updateListing('listing-1', 'host-1', { title: 'New title' })
		).rejects.toThrow('Vous n\'êtes pas autorisé à modifier cette annonce.');
	});

	it('should delete listing if owned by host and no active bookings exist', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			hostId: 'host-1',
			bookings: []
		} as any);

		vi.mocked(prisma.listing.delete).mockResolvedValue({} as any);

		const res = await deleteListing('listing-1', 'host-1');
		expect(res.success).toBe(true);
		expect(prisma.listing.delete).toHaveBeenCalledWith({ where: { id: 'listing-1' } });
	});

	it('should throw error when deleting listing with active bookings', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			hostId: 'host-1',
			bookings: [{ id: 'b-1', status: 'CONFIRMED' }]
		} as any);

		await expect(deleteListing('listing-1', 'host-1')).rejects.toThrow(
			'Impossible de supprimer une annonce ayant des réservations actives en cours.'
		);
	});

	it('should create listing successfully', async () => {
		vi.mocked(prisma.listing.create).mockResolvedValue({
			id: 'new-listing-1',
			title: 'Maison avec Jardin',
			pricePerNight: 400
		} as any);

		const created = await createListing({
			hostId: 'host-1',
			title: 'Maison avec Jardin',
			description: 'Superbe maison',
			address: '12 rue des fleurs',
			city: 'Lyon',
			zipCode: '69001',
			latitude: 45.75,
			longitude: 4.85,
			pricePerNight: 400,
			maxCapacity: 30,
			eventTypeAllowed: ['SOIRÉE']
		});

		expect(created.id).toBe('new-listing-1');
		expect(prisma.listing.create).toHaveBeenCalled();
	});

	it('should accept a listing with a safe public iCal sync URL', async () => {
		vi.mocked(prisma.listing.create).mockResolvedValue({ id: 'new-listing-2' } as any);

		const created = await createListing({
			hostId: 'host-1',
			title: 'Loft',
			description: 'Loft lumineux',
			address: '1 rue A',
			city: 'Paris',
			zipCode: '75001',
			latitude: 48.85,
			longitude: 2.35,
			pricePerNight: 300,
			maxCapacity: 20,
			eventTypeAllowed: ['SOIRÉE'],
			icalSyncUrl: 'https://calendar.google.com/feed.ics'
		});

		expect(created.id).toBe('new-listing-2');
	});

	it('should reject a listing whose iCal sync URL targets an internal host (SSRF)', async () => {
		await expect(
			createListing({
				hostId: 'host-1',
				title: 'Loft',
				description: 'Loft',
				address: '1 rue A',
				city: 'Paris',
				zipCode: '75001',
				latitude: 48.85,
				longitude: 2.35,
				pricePerNight: 300,
				maxCapacity: 20,
				eventTypeAllowed: ['SOIRÉE'],
				icalSyncUrl: 'http://169.254.169.254/latest/meta-data/'
			})
		).rejects.toThrow(/iCal/i);

		expect(prisma.listing.create).not.toHaveBeenCalled();
	});

	it('should reject an update whose iCal sync URL targets a private IP (SSRF)', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			hostId: 'host-1'
		} as any);

		await expect(
			updateListing('listing-1', 'host-1', { icalSyncUrl: 'http://192.168.0.10/cal.ics' })
		).rejects.toThrow(/iCal/i);

		expect(prisma.listing.update).not.toHaveBeenCalled();
	});
});
