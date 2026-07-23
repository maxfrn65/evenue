import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({
	prisma: {
		user: {
			findUnique: vi.fn()
		}
	}
}));

import { prisma } from '$lib/server/db';
import { handle } from './hooks.server';

describe('session hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds the connected user to locals from the session cookie', async () => {
		const user = {
			id: 'guest-1',
			email: 'guest@example.test',
			firstName: 'Alice',
			lastName: 'Martin',
			role: 'GUEST'
		};
		vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);

		const event = {
			cookies: { get: vi.fn().mockReturnValue('guest-1') },
			locals: {}
		} as any;
		const resolve = vi.fn().mockResolvedValue(new Response());

		await handle({ event, resolve } as any);

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: 'guest-1' },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true
			}
		});
		expect(event.locals.user).toEqual(user);
	});

	it('marks locals as anonymous when no session cookie exists', async () => {
		const event = {
			cookies: { get: vi.fn().mockReturnValue(undefined) },
			locals: {}
		} as any;

		await handle({ event, resolve: vi.fn().mockResolvedValue(new Response()) } as any);

		expect(prisma.user.findUnique).not.toHaveBeenCalled();
		expect(event.locals.user).toBeNull();
	});
});
