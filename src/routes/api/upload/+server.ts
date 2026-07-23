import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rateLimit, clientKey } from '$lib/server/rate-limit';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per image

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	// Abuse protection: 30 uploads / 10 min / IP (OWASP A04).
	const limit = rateLimit(clientKey(getClientAddress, request, 'upload'), {
		limit: 30,
		windowMs: 10 * 60 * 1000
	});
	if (!limit.allowed) {
		return json(
			{ success: false, error: 'Trop de fichiers envoyés. Patientez quelques minutes.' },
			{ status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
		);
	}

	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (!files || files.length === 0) {
			const singleFile = formData.get('file') as File;
			if (singleFile) {
				files.push(singleFile);
			}
		}

		if (files.length === 0) {
			return json({ success: false, error: 'Aucun fichier transmis.' }, { status: 400 });
		}

		const uploadDir = join(process.cwd(), 'static', 'uploads', 'listings');
		await mkdir(uploadDir, { recursive: true });

		const uploadedUrls: string[] = [];

		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				continue;
			}

			// Reject oversized files (defense against resource-exhaustion abuse).
			if (file.size > MAX_FILE_BYTES) {
				return json(
					{ success: false, error: 'Chaque image doit faire moins de 5 Mo.' },
					{ status: 413 }
				);
			}

			const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
			const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizeName}`;
			const filePath = join(uploadDir, filename);

			const buffer = Buffer.from(await file.arrayBuffer());
			await writeFile(filePath, buffer);

			uploadedUrls.push(`/uploads/listings/${filename}`);
		}

		return json({ success: true, urls: uploadedUrls, url: uploadedUrls[0] || '' });
	} catch (error: any) {
		return json({ success: false, error: error.message || 'Erreur lors de l\'envoi du fichier.' }, { status: 500 });
	}
};
