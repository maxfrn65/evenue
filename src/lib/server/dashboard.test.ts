import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		booking: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn()
		},
		listing: {
			findMany: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { getDashboardData, cancelBooking } from './dashboard';

describe('Dashboard Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getDashboardData', () => {
		it('should return bookings and empty listings for GUEST user', async () => {
			const mockBookings = [
				{
					id: 'booking-1',
					startDate: new Date('2026-08-01'),
					endDate: new Date('2026-08-02'),
					totalPrice: 850,
					status: 'CONFIRMED',
					listing: { id: 'listing-1', title: 'Villa Test', city: 'Paris' },
					insurancePolicy: { policyNumber: 'WAK-2026-001', status: 'ACTIVE' }
				}
			];

			vi.mocked(prisma.booking.findMany).mockResolvedValue(mockBookings as any);

			const result = await getDashboardData('user-1', 'GUEST');

			expect(result.bookings).toHaveLength(1);
			expect(result.listings).toHaveLength(0);
			expect(result.stats.totalBookings).toBe(1);
			expect(result.stats.upcomingBookings).toBe(1);
			expect(result.stats.totalSpent).toBe(850);
			expect(result.stats.totalListings).toBe(0);
		});

		it('should return bookings and listings for HOST user', async () => {
			const mockBookings = [
				{
					id: 'booking-1',
					startDate: new Date('2026-08-01'),
					endDate: new Date('2026-08-02'),
					totalPrice: 500,
					status: 'CONFIRMED',
					listing: { id: 'listing-1', title: 'Loft Test', city: 'Lyon' },
					insurancePolicy: null
				}
			];

			const mockListings = [
				{
					id: 'listing-1',
					title: 'Loft Test',
					city: 'Lyon',
					pricePerNight: 500,
					maxCapacity: 30,
					createdAt: new Date(),
					_count: { bookings: 2 },
					bookings: [
						{ hostEarnings: 450 },
						{ hostEarnings: 400 }
					]
				}
			];

			vi.mocked(prisma.booking.findMany).mockResolvedValue(mockBookings as any);
			vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);

			const result = await getDashboardData('host-1', 'HOST');

			expect(result.bookings).toHaveLength(1);
			expect(result.listings).toHaveLength(1);
			expect(result.stats.totalListings).toBe(1);
			expect(result.stats.totalEarnings).toBe(850);
		});
	});

	describe('cancelBooking', () => {
		it('should cancel a confirmed booking owned by the user', async () => {
			vi.mocked(prisma.booking.findFirst).mockResolvedValue({
				id: 'booking-1',
				guestId: 'user-1',
				status: 'CONFIRMED'
			} as any);

			vi.mocked(prisma.booking.update).mockResolvedValue({} as any);

			const result = await cancelBooking('booking-1', 'user-1');
			expect(result).toBe(true);
			expect(prisma.booking.update).toHaveBeenCalledWith({
				where: { id: 'booking-1' },
				data: { status: 'CANCELLED' }
			});
		});

		it('should return false if booking not found or not owned by user', async () => {
			vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);

			const result = await cancelBooking('booking-999', 'user-1');
			expect(result).toBe(false);
		});
	});
});
