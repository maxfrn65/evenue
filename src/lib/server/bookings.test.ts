import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		listing: {
			findUnique: vi.fn()
		},
		booking: {
			create: vi.fn(),
			findMany: vi.fn()
		},
		insurancePolicy: {
			create: vi.fn()
		}
	}
}));

// Mock iCal & Stripe & Wakam
vi.mock('./ical', () => ({
	isListingAvailable: vi.fn()
}));

vi.mock('./stripe', () => ({
	createBookingPaymentIntent: vi.fn().mockResolvedValue({
		paymentIntentId: 'pi_test_123',
		clientSecret: 'pi_test_123_secret'
	})
}));

vi.mock('./wakam', () => ({
	issueWakamInsurancePolicy: vi.fn().mockResolvedValue({
		policyNumber: 'WAK-2026-99999',
		coverageAmount: 10000,
		status: 'ISSUED'
	})
}));

import { prisma } from './db';
import { isListingAvailable } from './ical';
import { createBooking, getUserBookings } from './bookings';

describe('Bookings Service — Engine & Escrow Initialization', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create booking successfully when listing is available and capacity is respected', async () => {
		const mockListing = {
			id: 'listing-1',
			title: 'Villa Riviera',
			pricePerNight: 500,
			securityDeposit: 300,
			maxCapacity: 50,
			host: { id: 'host-1', stripeAccountId: 'acct_123' }
		};

		vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
		vi.mocked(isListingAvailable).mockResolvedValue({ available: true });

		const mockBookingRecord = {
			id: 'booking-1',
			listingId: 'listing-1',
			guestId: 'guest-1',
			totalPrice: 500,
			status: 'CONFIRMED'
		};

		vi.mocked(prisma.booking.create).mockResolvedValue(mockBookingRecord as any);
		vi.mocked(prisma.insurancePolicy.create).mockResolvedValue({
			id: 'policy-1',
			policyNumber: 'WAK-2026-99999',
			status: 'ACTIVE'
		} as any);

		const result = await createBooking({
			listingId: 'listing-1',
			guestId: 'guest-1',
			startDate: '2026-08-10',
			endDate: '2026-08-11',
			guestCount: 20
		});

		expect(result.booking.id).toBe('booking-1');
		expect(result.insurancePolicy.policyNumber).toBe('WAK-2026-99999');
		expect(result.stripeClientSecret).toBe('pi_test_123_secret');
	});

	it('should throw error if start date is invalid or after end date', async () => {
		await expect(
			createBooking({
				listingId: 'listing-1',
				guestId: 'guest-1',
				startDate: 'invalid-date',
				endDate: '2026-08-11',
				guestCount: 20
			})
		).rejects.toThrow('Dates de réservation invalides.');

		await expect(
			createBooking({
				listingId: 'listing-1',
				guestId: 'guest-1',
				startDate: '2026-08-15',
				endDate: '2026-08-10',
				guestCount: 20
			})
		).rejects.toThrow('La date de début doit être strictement antérieure à la date de fin.');
	});

	it('should throw error if guest count exceeds max capacity', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			maxCapacity: 10,
			host: {}
		} as any);

		await expect(
			createBooking({
				listingId: 'listing-1',
				guestId: 'guest-1',
				startDate: '2026-08-10',
				endDate: '2026-08-11',
				guestCount: 50
			})
		).rejects.toThrow("dépasse la capacité maximale du lieu");
	});

	it('should throw error if listing is unavailable on selected dates', async () => {
		vi.mocked(prisma.listing.findUnique).mockResolvedValue({
			id: 'listing-1',
			maxCapacity: 100,
			host: {}
		} as any);
		vi.mocked(isListingAvailable).mockResolvedValue({
			available: false,
			reason: 'Le logement est déjà réservé sur cette période.'
		});

		await expect(
			createBooking({
				listingId: 'listing-1',
				guestId: 'guest-1',
				startDate: '2026-08-10',
				endDate: '2026-08-11',
				guestCount: 20
			})
		).rejects.toThrow('Le logement est déjà réservé sur cette période.');
	});

	it('should return user bookings using getUserBookings', async () => {
		vi.mocked(prisma.booking.findMany).mockResolvedValue([{ id: 'b-1' }] as any);

		const bookings = await getUserBookings('user-1');
		expect(bookings).toHaveLength(1);
		expect(prisma.booking.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [{ guestId: 'user-1' }, { listing: { hostId: 'user-1' } }]
				}
			})
		);
	});
});
