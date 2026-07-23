import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		user: {
			findUnique: vi.fn()
		},
		message: {
			create: vi.fn(),
			findMany: vi.fn(),
			updateMany: vi.fn(),
			count: vi.fn()
		},
		booking: {
			findUnique: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { sendMessage, getConversations, getConversationMessages, getUnreadCount } from './messages';

describe('Messaging Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('sendMessage', () => {
		it('should create and return a message when receiver exists', async () => {
			vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-host-01' } as any);
			vi.mocked(prisma.message.create).mockResolvedValue({
				id: 'msg-1',
				senderId: 'user-guest-01',
				receiverId: 'user-host-01',
				content: 'Bonjour, le lieu est-il sonorisé ?',
				read: false,
				createdAt: new Date()
			} as any);

			const result = await sendMessage({
				senderId: 'user-guest-01',
				receiverId: 'user-host-01',
				content: 'Bonjour, le lieu est-il sonorisé ?'
			});

			expect(result.id).toBe('msg-1');
			expect(result.content).toContain('sonorisé');
		});

		it('should throw error if content is empty', async () => {
			await expect(
				sendMessage({
					senderId: 'user-1',
					receiverId: 'user-2',
					content: '   '
				})
			).rejects.toThrow('vide');
		});

		it('should throw error if sender tries to message self', async () => {
			await expect(
				sendMessage({
					senderId: 'user-1',
					receiverId: 'user-1',
					content: 'Hello self'
				})
			).rejects.toThrow('vous-même');
		});

		it('should reject a booking message when its participants do not match', async () => {
			vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-host-01' } as any);
			vi.mocked(prisma.booking.findUnique).mockResolvedValue({
				id: 'booking-1',
				guestId: 'user-guest-01',
				listing: { hostId: 'user-host-01' }
			} as any);

			await expect(
				sendMessage({
					senderId: 'user-guest-01',
					receiverId: 'user-host-02',
					content: 'Bonjour',
					bookingId: 'booking-1'
				})
			).rejects.toThrow('ne vous autorise pas');
		});
	});

	describe('getConversations', () => {
		it('should group messages by conversation partner and count unread', async () => {
			const mockMessages = [
				{
					id: 'm1',
					senderId: 'user-host-01',
					receiverId: 'user-guest-01',
					content: 'Oui tout à fait !',
					read: false,
					sender: { id: 'user-host-01', firstName: 'Jean', lastName: 'Dupont', role: 'HOST' },
					receiver: { id: 'user-guest-01', firstName: 'Alexandre', lastName: 'Martin', role: 'GUEST' }
				}
			];

			vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as any);

			const convs = await getConversations('user-guest-01');
			expect(convs).toHaveLength(1);
			expect(convs[0].partner.id).toBe('user-host-01');
			expect(convs[0].unreadCount).toBe(1);
		});
	});

	describe('getUnreadCount', () => {
		it('returns the number of unread messages received by the user', async () => {
			vi.mocked(prisma.message.count).mockResolvedValue(3);

			await expect(getUnreadCount('user-guest-01')).resolves.toBe(3);
			expect(prisma.message.count).toHaveBeenCalledWith({
				where: { receiverId: 'user-guest-01', read: false }
			});
		});
});
