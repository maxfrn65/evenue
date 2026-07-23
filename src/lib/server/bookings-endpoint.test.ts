import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./bookings', () => ({
	createBooking: vi.fn()
}));

import { createBooking } from './bookings';
import { POST } from '../../routes/api/bookings/+server';

/**
 * Non-regression suite for ANO-013 (OWASP A01 — Broken Access Control).
 *
 * The endpoint previously fell back to "the first GUEST found in the database"
 * when no session cookie was present, which allowed an unauthenticated caller to
 * create a real booking — with escrow amounts and an insurance policy —
 * attributed to somebody else's account.
 */
describe('Bookings API Endpoint — POST /api/bookings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects an unauthenticated booking attempt with 401', async () => {
		const mockEvent: any = {
			request: { json: vi.fn() },
			cookies: { get: vi.fn().mockReturnValue(undefined) }
		};

		const response = await POST(mockEvent);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.success).toBe(false);
		expect(createBooking).not.toHaveBeenCalled();
	});

	it('never falls back to another user when unauthenticated', async () => {
		const mockEvent: any = {
			request: {
				json: vi.fn().mockResolvedValue({
					listingId: 'listing-1',
					startDate: '2027-01-10',
					endDate: '2027-01-12'
				})
			},
			cookies: { get: vi.fn().mockReturnValue(undefined) }
		};

		const response = await POST(mockEvent);

		expect(response.status).toBe(401);
		// No booking may be created on behalf of a fallback account.
		expect(createBooking).not.toHaveBeenCalled();
	});

	it('creates the booking for the authenticated session user', async () => {
		vi.mocked(createBooking).mockResolvedValue({
			booking: { id: 'booking-1' },
			insurancePolicy: { policyNumber: 'WAK-TEST-1' },
			stripeClientSecret: 'secret_test'
		} as any);

		const mockEvent: any = {
			request: {
				json: vi.fn().mockResolvedValue({
					listingId: 'listing-1',
					startDate: '2027-01-10',
					endDate: '2027-01-12',
					guestCount: 4
				})
			},
			cookies: { get: vi.fn().mockReturnValue('session-user-42') }
		};

		const response = await POST(mockEvent);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.success).toBe(true);
		expect(createBooking).toHaveBeenCalledWith(
			expect.objectContaining({ guestId: 'session-user-42', listingId: 'listing-1' })
		);
	});

	it('returns 400 when mandatory booking parameters are missing', async () => {
		const mockEvent: any = {
			request: { json: vi.fn().mockResolvedValue({ listingId: 'listing-1' }) },
			cookies: { get: vi.fn().mockReturnValue('session-user-42') }
		};

		const response = await POST(mockEvent);

		expect(response.status).toBe(400);
		expect(createBooking).not.toHaveBeenCalled();
	});
});
