import type { RequestHandler } from './$types';
import { toErrorMessage } from '$lib/utils';
import { generateListingICal } from '$lib/server/ical';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const icalString = await generateListingICal(params.id);

		return new Response(icalString, {
			headers: {
				'Content-Type': 'text/calendar; charset=utf-8',
				'Content-Disposition': `attachment; filename="evenue-${params.id}.ics"`
			}
		});
	} catch (error) {
		return new Response(toErrorMessage(error, 'Erreur lors de la génération du calendrier iCal.'), {
			status: 404
		});
	}
};
