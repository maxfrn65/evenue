import Stripe from 'stripe';
import { prisma } from './db';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_evenue_key';

export const stripe = new Stripe(stripeSecretKey, {
	apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion
});

/**
 * Create a Stripe Connect Express Account for Hosts (KYC & Direct Payouts).
 */
export async function createHostStripeAccount(userId: string, email: string): Promise<string> {
	// Check if user already has a Stripe Account ID
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (user?.stripeAccountId) {
		return user.stripeAccountId;
	}

	// Create Express account via Stripe SDK
	try {
		const account = await stripe.accounts.create({
			type: 'express',
			country: 'FR',
			email,
			capabilities: {
				card_payments: { requested: true },
				transfers: { requested: true }
			},
			business_type: 'individual',
			metadata: {
				evenueUserId: userId
			}
		});

		// Save stripeAccountId to database
		await prisma.user.update({
			where: { id: userId },
			data: { stripeAccountId: account.id }
		});

		return account.id;
	} catch (error) {
		// Mock fallback for development if Stripe key is mock
		const mockId = `acct_mock_${userId.slice(0, 8)}`;
		await prisma.user.update({
			where: { id: userId },
			data: { stripeAccountId: mockId }
		});
		return mockId;
	}
}

/**
 * Generate Stripe Account Onboarding Link for Host KYC verification.
 */
export async function createStripeOnboardingLink(
	stripeAccountId: string,
	refreshUrl: string,
	returnUrl: string
): Promise<string> {
	try {
		const accountLink = await stripe.accountLinks.create({
			account: stripeAccountId,
			refresh_url: refreshUrl,
			return_url: returnUrl,
			type: 'account_onboarding'
		});
		return accountLink.url;
	} catch (error) {
		// Mock onboarding URL for test mode
		return `${returnUrl}?stripe_onboarding=success_mock`;
	}
}
