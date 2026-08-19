import { randomBytes } from 'node:crypto';
import { prisma } from './db';

export const SESSION_COOKIE_NAME = 'evenue_session';

const isProduction = process.env.NODE_ENV === 'production';

/** Sessions live seven days, in the cookie and in the database alike. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Hardened options for the session cookie (OWASP A02/A05).
 *   - httpOnly: not readable from JavaScript (mitigates XSS token theft)
 *   - sameSite 'lax': CSRF mitigation while keeping top-level navigation flows
 *   - secure: only sent over HTTPS in production
 *   - path '/': available across the app
 *   - maxAge: 7-day expiry
 */
export const sessionCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: isProduction,
	maxAge: SESSION_TTL_MS / 1000
};

/**
 * Options used when clearing the session cookie — must match the attributes
 * (path/secure/sameSite) the cookie was set with so the browser removes it.
 */
export const sessionClearOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: isProduction
};

/** The user fields every request handler is allowed to read off `locals.user`. */
const SESSION_USER_FIELDS = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	role: true
} as const;

export type SessionUser = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
};

/**
 * Open a session and return the opaque token to store in the cookie.
 *
 * The cookie used to carry `user.id` verbatim, which made a session trivially forgeable by
 * anyone who learned an id — the seed alone exposes readable ones like `host-jean-01`
 * (OWASP A07). The token is 256 bits of CSPRNG output and means nothing outside this table.
 */
export async function createSession(userId: string, now: number = Date.now()): Promise<string> {
	const token = randomBytes(32).toString('base64url');

	await prisma.session.create({
		data: {
			id: token,
			userId,
			expiresAt: new Date(now + SESSION_TTL_MS)
		}
	});

	return token;
}

/**
 * Resolve a session token to its user, or `null` when the token is unknown or expired.
 * An expired row is deleted on the way out so the table does not grow without bound.
 */
export async function resolveSessionUser(
	token: string | undefined,
	now: number = Date.now()
): Promise<SessionUser | null> {
	if (!token) return null;

	const session = await prisma.session.findUnique({
		where: { id: token },
		select: {
			expiresAt: true,
			user: { select: SESSION_USER_FIELDS }
		}
	});

	if (!session) return null;

	if (session.expiresAt.getTime() <= now) {
		await destroySession(token);
		return null;
	}

	return session.user;
}

/** Close one session. Safe to call with a token that no longer exists. */
export async function destroySession(token: string | undefined): Promise<void> {
	if (!token) return;
	await prisma.session.deleteMany({ where: { id: token } });
}
