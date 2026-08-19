import type { RequestHandler } from './$types';
import { toErrorMessage } from '$lib/utils';
import { generateWakamCertificateHTML } from '$lib/server/claims';

export const GET: RequestHandler = async ({ params, locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		return new Response('Non authentifié.', { status: 401 });
	}

	try {
		const html = await generateWakamCertificateHTML(params.id, userId);
		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8'
			}
		});
	} catch (error) {
		return new Response(toErrorMessage(error, 'Erreur lors de la génération du certificat.'), {
			status: 404
		});
	}
};
