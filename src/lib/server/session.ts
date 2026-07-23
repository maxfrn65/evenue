export const SESSION_COOKIE_NAME = 'evenue_session';

const isProduction = process.env.NODE_ENV === 'production';

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
	maxAge: 60 * 60 * 24 * 7 // 7 days
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
