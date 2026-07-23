import { describe, it, expect } from 'vitest';
import { SESSION_COOKIE_NAME, sessionCookieOptions, sessionClearOptions } from './session';

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
