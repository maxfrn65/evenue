import { prisma } from './db';

export interface SendMessageInput {
	senderId: string;
	receiverId: string;
	content: string;
	bookingId?: string;
}

export async function sendMessage(input: SendMessageInput) {
	if (!input.content || input.content.trim().length === 0) {
		throw new Error('Le contenu du message ne peut pas être vide.');
	}

	if (input.senderId === input.receiverId) {
		throw new Error('Vous ne pouvez pas vous envoyer un message à vous-même.');
	}

	// Verify receiver exists
	const receiver = await prisma.user.findUnique({
		where: { id: input.receiverId }
	});

	if (!receiver) {
		throw new Error('Destinataire introuvable.');
	}

	if (input.bookingId) {
		const booking = await prisma.booking.findUnique({
			where: { id: input.bookingId },
			include: {
				listing: {
					select: { hostId: true }
				}
			}
		});

		if (!booking) {
			throw new Error('Réservation introuvable.');
		}

		const participants = [booking.guestId, booking.listing.hostId];
		if (!participants.includes(input.senderId) || !participants.includes(input.receiverId)) {
			throw new Error('Cette réservation ne vous autorise pas à contacter ce destinataire.');
		}
	}

	return await prisma.message.create({
		data: {
			senderId: input.senderId,
			receiverId: input.receiverId,
			content: input.content.trim(),
			bookingId: input.bookingId || null
		},
		include: {
			sender: {
				select: { id: true, firstName: true, lastName: true, role: true }
			},
			receiver: {
				select: { id: true, firstName: true, lastName: true, role: true }
			}
		}
	});
}

export async function getConversations(userId: string) {
	// Fetch all messages where userId is sender or receiver
	const messages = await prisma.message.findMany({
		where: {
			OR: [{ senderId: userId }, { receiverId: userId }]
		},
		orderBy: { createdAt: 'desc' },
		include: {
			sender: {
				select: { id: true, firstName: true, lastName: true, role: true }
			},
			receiver: {
				select: { id: true, firstName: true, lastName: true, role: true }
			}
		}
	});

	// Group by conversation partner
	const partnerMap = new Map<string, {
		partner: { id: string; firstName: string; lastName: string; role: string };
		lastMessage: typeof messages[0];
		unreadCount: number;
	}>();

	for (const msg of messages) {
		const isSender = msg.senderId === userId;
		const partner = isSender ? msg.receiver : msg.sender;
		const partnerId = partner.id;

		if (!partnerMap.has(partnerId)) {
			partnerMap.set(partnerId, {
				partner,
				lastMessage: msg,
				unreadCount: 0
			});
		}

		if (!isSender && !msg.read) {
			const entry = partnerMap.get(partnerId)!;
			entry.unreadCount += 1;
		}
	}

	return Array.from(partnerMap.values());
}

export async function getConversationMessages(userId: string, otherUserId: string, bookingId?: string) {
	const incomingMessagesWhere = {
		senderId: otherUserId,
		receiverId: userId,
		read: false,
		...(bookingId ? { bookingId } : {})
	};

	// Mark messages from otherUserId to userId as read
	await prisma.message.updateMany({
		where: incomingMessagesWhere,
		data: { read: true }
	});

	const whereClause: any = {
		OR: [
			{ senderId: userId, receiverId: otherUserId },
			{ senderId: otherUserId, receiverId: userId }
		]
	};

	if (bookingId) {
		whereClause.bookingId = bookingId;
	}

	return await prisma.message.findMany({
		where: whereClause,
		orderBy: { createdAt: 'asc' },
		include: {
			sender: {
				select: { id: true, firstName: true, lastName: true, role: true }
			},
			receiver: {
				select: { id: true, firstName: true, lastName: true, role: true }
			}
		}
	});
}

export async function getUnreadCount(userId: string): Promise<number> {
	return await prisma.message.count({
		where: {
			receiverId: userId,
			read: false
		}
	});
}
