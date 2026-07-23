/**
 * In-memory fixed-window rate limiter (OWASP A04 Insecure Design / A07 Auth Failures).
 *
 * Protects sensitive endpoints (login, register, upload) against brute-force and
 * abuse by capping the number of attempts per identifier (client IP) within a
 * time window. This is a single-instance limiter — adequate for the current
 * single-node deployment; a distributed deployment would back this with Redis.
 */

interface WindowState {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, WindowState>();

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	retryAfterSeconds: number;
}

export interface RateLimitOptions {
	/** Max requests allowed within the window. */
	limit: number;
	/** Window duration in milliseconds. */
	windowMs: number;
}

/**
 * Register a hit for `key` and report whether it is allowed under `options`.
 * Uses a fixed window that resets `windowMs` after the first hit.
 */
export function rateLimit(
	key: string,
	options: RateLimitOptions,
	now: number = Date.now()
): RateLimitResult {
	const existing = buckets.get(key);

	if (!existing || now >= existing.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + options.windowMs });
		return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
	}

	existing.count += 1;

	if (existing.count > options.limit) {
		return {
			allowed: false,
			remaining: 0,
			retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000)
		};
	}

	return {
		allowed: true,
		remaining: options.limit - existing.count,
		retryAfterSeconds: 0
	};
}

/**
 * Derive a stable client identifier from a request for rate-limiting purposes.
 * Prefers SvelteKit's trusted `getClientAddress()`, falling back to proxy headers.
 */
export function clientKey(
	getClientAddress: (() => string) | undefined,
	request: Request | undefined,
	scope: string
): string {
	let ip = '';
	try {
		ip = getClientAddress?.() ?? '';
	} catch {
		ip = '';
	}
	if (!ip) {
		const headers = request?.headers;
		ip =
			headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			headers?.get('x-real-ip') ||
			'unknown';
	}
	return `${scope}:${ip}`;
}

/**
 * Test/maintenance helper: clear all rate-limit state.
 */
export function resetRateLimits(): void {
	buckets.clear();
}
