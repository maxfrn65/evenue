import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db', () => ({
	prisma: {
		session: {
			create: vi.fn(),
			findUnique: vi.fn(),
			deleteMany: vi.fn().mockResolvedValue({ count: 1 })
		}
	}
}));

import { prisma } from './db';
import {
	SESSION_COOKIE_NAME,
	SESSION_TTL_MS,
	createSession,
	destroySession,
	resolveSessionUser,
	sessionClearOptions,
	sessionCookieOptions
} from './session';

const user = {
	id: 'guest-1',
	email: 'guest@example.test',
	firstName: 'Alice',
	lastName: 'Martin',
	role: 'GUEST'
};

describe('session cookie options (OWASP A02/A05)', () => {
	it('exposes a stable session cookie name', () => {
		expect(SESSION_COOKIE_NAME).toBe('evenue_session');
	});

	it('hardens the session cookie: httpOnly, sameSite lax, path, expiry', () => {
		expect(sessionCookieOptions.httpOnly).toBe(true);
		expect(sessionCookieOptions.sameSite).toBe('lax');
		expect(sessionCookieOptions.path).toBe('/');
		expect(sessionCookieOptions.maxAge).toBe(60 * 60 * 24 * 7);
		// secure is driven by NODE_ENV; in the test env it is a boolean.
		expect(typeof sessionCookieOptions.secure).toBe('boolean');
	});

	it('clear options mirror the security attributes without maxAge', () => {
		expect(sessionClearOptions.httpOnly).toBe(true);
		expect(sessionClearOptions.sameSite).toBe('lax');
		expect(sessionClearOptions.path).toBe('/');
		expect('maxAge' in sessionClearOptions).toBe(false);
	});
});

describe('session store (OWASP A07 — forgeable session tokens)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 } as never);
	});

	it('issues an opaque token that is never the user id', async () => {
		vi.mocked(prisma.session.create).mockResolvedValue({} as never);

		const token = await createSession('guest-1', 1_000_000);

		expect(token).not.toBe('guest-1');
		expect(token).not.toContain('guest-1');
		// 32 CSPRNG bytes in base64url.
		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(prisma.session.create).toHaveBeenCalledWith({
			data: {
				id: token,
				userId: 'guest-1',
				expiresAt: new Date(1_000_000 + SESSION_TTL_MS)
			}
		});
	});

	it('issues a different token on every call', async () => {
		vi.mocked(prisma.session.create).mockResolvedValue({} as never);

		const first = await createSession('guest-1');
		const second = await createSession('guest-1');

		expect(first).not.toBe(second);
	});

	it('resolves a live token to its user', async () => {
		vi.mocked(prisma.session.findUnique).mockResolvedValue({
			expiresAt: new Date(2_000_000),
			user
		} as never);

		await expect(resolveSessionUser('live-token', 1_000_000)).resolves.toEqual(user);
	});

	it('refuses a token the store does not know — a forged cookie grants nothing', async () => {
		vi.mocked(prisma.session.findUnique).mockResolvedValue(null as never);

		await expect(resolveSessionUser('guest-1')).resolves.toBeNull();
	});

	it('refuses an expired token and deletes the dead row', async () => {
		vi.mocked(prisma.session.findUnique).mockResolvedValue({
			expiresAt: new Date(1_000),
			user
		} as never);

		await expect(resolveSessionUser('stale-token', 2_000)).resolves.toBeNull();
		expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { id: 'stale-token' } });
	});

	it('treats a missing cookie as anonymous without querying the store', async () => {
		await expect(resolveSessionUser(undefined)).resolves.toBeNull();
		expect(prisma.session.findUnique).not.toHaveBeenCalled();
	});

	it('destroys a session server-side so a copied cookie stops working', async () => {
		await destroySession('live-token');

		expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { id: 'live-token' } });
	});

	it('ignores a logout with no cookie', async () => {
		await destroySession(undefined);

		expect(prisma.session.deleteMany).not.toHaveBeenCalled();
	});
});
