import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { disputeClaim } from '$lib/server/claims';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { claimId, disputeReason, disputeEvidenceUrls } = body;

		if (!claimId || !disputeReason) {
			return json({ success: false, error: 'Identifiant du sinistre et motif de contestation requis.' }, { status: 400 });
		}

		const claim = await disputeClaim({
			claimId,
			userId,
			disputeReason,
			disputeEvidenceUrls
		});

		return json({ success: true, claim }, { status: 200 });
	} catch (error: any) {
		return json({ success: false, error: error.message || 'Erreur lors de la contestation.' }, { status: 400 });
	}
};
