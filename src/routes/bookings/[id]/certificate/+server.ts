import type { RequestHandler } from './$types';
import { generateWakamCertificateHTML } from '$lib/server/claims';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const userId = cookies.get('evenue_session');

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
	} catch (error: any) {
		return new Response(error.message || 'Erreur lors de la génération du certificat.', { status: 404 });
	}
};
