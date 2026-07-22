import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createHostStripeAccount, createStripeOnboardingLink } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ cookies, url }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const stripeAccountId = await createHostStripeAccount(userId, `host_${userId}@evenue.fr`);

		const baseUrl = url.origin;
		const refreshUrl = `${baseUrl}/become-host?stripe=refresh`;
		const returnUrl = `${baseUrl}/become-host?stripe=success`;

		const onboardingUrl = await createStripeOnboardingLink(stripeAccountId, refreshUrl, returnUrl);

		return json({ success: true, stripeAccountId, onboardingUrl });
	} catch (error: any) {
		return json({ error: error.message || 'Erreur lors de l\'initialisation Stripe Connect.' }, { status: 500 });
	}
};
