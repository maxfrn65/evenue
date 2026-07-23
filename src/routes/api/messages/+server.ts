import { json, type RequestHandler } from '@sveltejs/kit';
import { sendMessage, getConversations, getConversationMessages } from '$lib/server/messages';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	const otherUserId = url.searchParams.get('otherUserId');
	const bookingId = url.searchParams.get('bookingId') || undefined;

	try {
		if (otherUserId) {
			const messages = await getConversationMessages(locals.user.id, otherUserId, bookingId);
			return json({ success: true, messages });
		} else {
			const conversations = await getConversations(locals.user.id);
			return json({ success: true, conversations });
		}
	} catch (error: any) {
		return json({ success: false, error: error.message }, { status: 400 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: 'Non authentifié.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const message = await sendMessage({
			senderId: locals.user.id,
			receiverId: body.receiverId,
			content: body.content,
			bookingId: body.bookingId
		});

		return json({ success: true, message });
	} catch (error: any) {
		return json({ success: false, error: error.message }, { status: 400 });
	}
};
