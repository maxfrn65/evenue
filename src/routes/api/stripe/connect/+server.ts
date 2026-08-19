import { json } from '@sveltejs/kit';
import { toErrorMessage } from '$lib/utils';
import type { RequestHandler } from './$types';
import { createHostStripeAccount, createStripeOnboardingLink } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ url, locals }) => {
	const userId = locals.user?.id;

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
	} catch (error) {
		return json(
			{ error: toErrorMessage(error, "Erreur lors de l'initialisation Stripe Connect.") },
			{ status: 500 }
		);
	}
};
