import { env } from '$env/dynamic/private';
import { logger } from './logger';

/**
 * Access guard for the metrics endpoints.
 *
 * Fails closed: in production, no METRICS_TOKEN means the endpoints are disabled, not
 * open. Leaving them public on a misconfiguration would expose business counters, memory
 * figures and partner state to anyone — including the scanners that probe /metrics on
 * every public IP.
 */

/** The misconfiguration is worth one loud line, not one per scrape. */
let misconfigurationReported = false;

export function resetMetricsAuthWarning(): void {
	misconfigurationReported = false;
}

/**
 * Returns `null` when the caller may read the metrics, or the Response to send otherwise.
 */
export function denyMetricsAccess(request: Request): Response | null {
	const expectedToken = env.METRICS_TOKEN;

	if (!expectedToken) {
		if (process.env.NODE_ENV === 'production') {
			if (!misconfigurationReported) {
				misconfigurationReported = true;
				logger.error('METRICS_TOKEN is not set: metrics endpoints are disabled', {
					context: 'METRICS_ACCESS'
				});
			}
			// 404 rather than 401: an endpoint that cannot be used need not advertise itself.
			return new Response('Not Found\n', { status: 404 });
		}

		// Local development and tests keep the endpoints open for convenience.
		return null;
	}

	if (request.headers.get('authorization') !== `Bearer ${expectedToken}`) {
		return new Response('Unauthorized\n', { status: 401 });
	}

	return null;
}
