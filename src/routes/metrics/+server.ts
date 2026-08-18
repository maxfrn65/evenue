import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { wakamCircuitBreaker } from '$lib/server/circuit-breaker';
import { METRICS_CONTENT_TYPE, renderMetrics, setCircuitBreakerState } from '$lib/server/metrics';

/**
 * Prometheus scrape endpoint (text exposition format), as described in the Bloc 4
 * supervision plan §3.3.
 *
 * Deliberately served on `/metrics` — the conventional path scrapers expect — while
 * `/api/metrics` keeps returning the human-readable JSON health snapshot.
 */
export const GET: RequestHandler = async ({ request }) => {
	// Same optional protection as /api/metrics: set METRICS_TOKEN on the container and the
	// scraper must send `Authorization: Bearer <token>`. Unset, the endpoint stays open.
	const expectedToken = env.METRICS_TOKEN;
	if (expectedToken && request.headers.get('authorization') !== `Bearer ${expectedToken}`) {
		return new Response('Unauthorized\n', { status: 401 });
	}

	// getState() also performs the OPEN → HALF_OPEN transition once the reset timeout has
	// elapsed, so reading it here keeps the gauge truthful at scrape time.
	setCircuitBreakerState(
		'wakam',
		wakamCircuitBreaker.getState(),
		wakamCircuitBreaker.getFailureCount()
	);

	return new Response(await renderMetrics(), {
		status: 200,
		headers: { 'content-type': METRICS_CONTENT_TYPE }
	});
};
