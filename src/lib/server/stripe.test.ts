import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			update: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { createHostStripeAccount, createStripeOnboardingLink, createBookingPaymentIntent } from './stripe';

describe('Stripe Connect Escrow Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return existing stripeAccountId if already present for user', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user-1',
			stripeAccountId: 'acct_existing_123'
		} as any);

		const accountId = await createHostStripeAccount('user-1', 'test@evenue.fr');
		expect(accountId).toBe('acct_existing_123');
	});

	it('should generate mock stripe account if Stripe API call fails or mode is test', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user-1',
			stripeAccountId: null
		} as any);
		vi.mocked(prisma.user.update).mockResolvedValue({} as any);

		const accountId = await createHostStripeAccount('user-1', 'test@evenue.fr');
		expect(accountId).toContain('acct_');
	});

	it('should return onboarding link for host KYC', async () => {
		const url = await createStripeOnboardingLink('acct_123', 'http://localhost/refresh', 'http://localhost/return');
		expect(url).toBeDefined();
		expect(url).toContain('http');
	});

	it('should create booking payment intent for escrow', async () => {
		const result = await createBookingPaymentIntent(500, 300, 'acct_123');
		expect(result.paymentIntentId).toBeDefined();
		expect(result.clientSecret).toBeDefined();
	});
});
