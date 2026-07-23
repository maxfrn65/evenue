import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, clientKey, resetRateLimits } from './rate-limit';

describe('rateLimit — fixed-window limiter (OWASP A04/A07)', () => {
	beforeEach(() => {
		resetRateLimits();
	});

	it('allows requests up to the limit then blocks', () => {
		const opts = { limit: 3, windowMs: 60_000 };
		expect(rateLimit('k', opts, 1_000).allowed).toBe(true);
		expect(rateLimit('k', opts, 1_000).allowed).toBe(true);
		expect(rateLimit('k', opts, 1_000).allowed).toBe(true);
		const blocked = rateLimit('k', opts, 1_000);
		expect(blocked.allowed).toBe(false);
		expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
	});

	it('reports decreasing remaining budget', () => {
		const opts = { limit: 2, windowMs: 60_000 };
		expect(rateLimit('r', opts, 0).remaining).toBe(1);
		expect(rateLimit('r', opts, 0).remaining).toBe(0);
	});

	it('resets after the window elapses', () => {
		const opts = { limit: 1, windowMs: 1_000 };
		expect(rateLimit('w', opts, 0).allowed).toBe(true);
		expect(rateLimit('w', opts, 500).allowed).toBe(false);
		// After the window resets
		expect(rateLimit('w', opts, 1_500).allowed).toBe(true);
	});

	it('isolates counters per key', () => {
		const opts = { limit: 1, windowMs: 60_000 };
		expect(rateLimit('a', opts, 0).allowed).toBe(true);
		expect(rateLimit('b', opts, 0).allowed).toBe(true);
		expect(rateLimit('a', opts, 0).allowed).toBe(false);
	});

	it('clientKey uses getClientAddress and scopes the key', () => {
		const key = clientKey(() => '203.0.113.7', new Request('https://x.test'), 'login');
		expect(key).toBe('login:203.0.113.7');
	});

	it('clientKey falls back to proxy headers when getClientAddress throws', () => {
		const req = new Request('https://x.test', {
			headers: { 'x-forwarded-for': '198.51.100.9, 10.0.0.1' }
		});
		const key = clientKey(
			() => {
				throw new Error('no address');
			},
			req,
			'upload'
		);
		expect(key).toBe('upload:198.51.100.9');
	});
});
