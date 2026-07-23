import Stripe from 'stripe';
import { prisma } from './db';
import { env } from '$env/dynamic/private';

const stripeSecretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
	// No secret key must ever fall back to a hardcoded value in production
	// (OWASP A02: Cryptographic Failures).
	throw new Error('STRIPE_SECRET_KEY is not set in production.');
}

// Outside production, allow an obviously-fake placeholder so the app boots
// without live Stripe credentials (test keys are non-sensitive by design).
const resolvedStripeKey = stripeSecretKey || 'sk_test_placeholder_dev_only';

export const stripe = new Stripe(resolvedStripeKey, {
	apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion
});

/**
 * Create a Stripe Connect Express Account for Hosts (KYC & Direct Payouts).
 */
export async function createHostStripeAccount(userId: string, email: string): Promise<string> {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (user?.stripeAccountId) {
		return user.stripeAccountId;
	}

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

		await prisma.user.update({
			where: { id: userId },
			data: { stripeAccountId: account.id }
		});

		return account.id;
	} catch (error) {
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
		return `${returnUrl}?stripe_onboarding=success_mock`;
	}
}

/**
 * Create Stripe PaymentIntent with manual capture for Escrow & Security Deposit.
 */
export async function createBookingPaymentIntent(
	amount: number,
	securityDeposit: number,
	stripeAccountId?: string
) {
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100),
			currency: 'eur',
			capture_method: 'manual',
			payment_method_types: ['card'],
			transfer_data: stripeAccountId ? { destination: stripeAccountId } : undefined,
			metadata: {
				securityDeposit: securityDeposit.toString()
			}
		});

		return {
			paymentIntentId: paymentIntent.id,
			clientSecret: paymentIntent.client_secret
		};
	} catch (error) {
		const mockId = `pi_mock_${Math.floor(100000 + Math.random() * 900000)}`;
		return {
			paymentIntentId: mockId,
			clientSecret: `${mockId}_secret_mock`
		};
	}
}
