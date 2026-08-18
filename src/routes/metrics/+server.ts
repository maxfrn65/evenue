import type { RequestHandler } from './$types';
import { wakamCircuitBreaker } from '$lib/server/circuit-breaker';
import { denyMetricsAccess } from '$lib/server/metrics-auth';
import { METRICS_CONTENT_TYPE, renderMetrics, setCircuitBreakerState } from '$lib/server/metrics';

/**
 * Prometheus scrape endpoint (text exposition format), as described in the Bloc 4
 * supervision plan §3.3.
 *
 * Deliberately served on `/metrics` — the conventional path scrapers expect — while
 * `/api/metrics` keeps returning the human-readable JSON health snapshot.
 */
export const GET: RequestHandler = async ({ request }) => {
	const denied = denyMetricsAccess(request);
	if (denied) return denied;

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
