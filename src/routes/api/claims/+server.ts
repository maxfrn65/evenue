import type { RequestHandler } from './$types';
import { toErrorMessage } from '$lib/utils';
import { json } from '@sveltejs/kit';
import { submitClaim } from '$lib/server/claims';

export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { bookingId, damageType, description, estimatedCost } = body;

		if (!bookingId || !damageType || !description || !estimatedCost) {
			return json({ success: false, error: 'Champs requis manquants.' }, { status: 400 });
		}

		const result = await submitClaim({
			bookingId,
			userId,
			damageType,
			description,
			estimatedCost: Number(estimatedCost)
		});

		return json({ success: true, claim: result });
	} catch (error) {
		return json(
			{
				success: false,
				error: toErrorMessage(error, 'Erreur lors de la déclaration du sinistre.')
			},
			{ status: 400 }
		);
	}
};
