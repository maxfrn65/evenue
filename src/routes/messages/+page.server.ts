import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getConversations, getConversationMessages } from '$lib/server/messages';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/auth/login?redirectTo=${redirectTo}`);
	}

	let conversations = await getConversations(locals.user.id);
	const targetUserId = url.searchParams.get('partnerId') || url.searchParams.get('hostId');
	const requestedBookingId = url.searchParams.get('bookingId');

	let activePartner: any = null;
	let activeMessages: any[] = [];
	let bookingId: string | undefined;

	if (targetUserId) {
		activePartner = await prisma.user.findUnique({
			where: { id: targetUserId },
			select: { id: true, firstName: true, lastName: true, role: true, email: true }
		});

		if (activePartner && requestedBookingId) {
			const booking = await prisma.booking.findFirst({
				where: {
					id: requestedBookingId,
					OR: [
						{ guestId: locals.user.id, listing: { hostId: targetUserId } },
						{ guestId: targetUserId, listing: { hostId: locals.user.id } }
					]
				},
				select: { id: true }
			});

			if (booking) {
				bookingId = booking.id;
				activeMessages = await getConversationMessages(locals.user.id, targetUserId, bookingId);
			} else {
				activePartner = null;
			}
		} else if (activePartner) {
			activeMessages = await getConversationMessages(locals.user.id, targetUserId);
		}
	} else if (conversations.length > 0) {
		activePartner = conversations[0].partner;
		activeMessages = await getConversationMessages(locals.user.id, activePartner.id);
	}

	if (activePartner) {
		conversations = conversations.map((conversation) =>
			conversation.partner.id === activePartner.id
				? { ...conversation, unreadCount: 0 }
				: conversation
		);
	}

	return {
		user: locals.user,
		conversations,
		activePartner,
		activeMessages,
		bookingId
	};
};
