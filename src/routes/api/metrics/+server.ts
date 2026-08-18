import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { wakamCircuitBreaker } from '$lib/server/circuit-breaker';
import { prisma } from '$lib/server/db';
import { env } from '$env/dynamic/private';

/**
 * Health/metrics probe.
 *
 * This is an on-demand health snapshot, NOT a Prometheus scrape target: Scaleway Cockpit
 * ingests metrics by push (remote write / OTLP), it never scrapes the application. See
 * docs/GRAFANA_MONITORING.md § 4.
 *
 * `uptimeSeconds`, `memoryUsageMb` and the circuit breaker counters are per-instance and
 * reset on every cold start of the serverless container, so they describe the instance
 * answering the call — not the service as a whole.
 */

/**
 * Business counts are cached: without this, any caller (or a misconfigured scraper) turns
 * every hit into two COUNT queries and keeps an instance awake, defeating scale-to-zero.
 */
const COUNTS_CACHE_TTL_MS = 15_000;

type DatabaseSnapshot = {
	status: 'HEALTHY' | 'UNHEALTHY';
	totalListings: number;
	totalBookings: number;
};

let countsCache: { at: number; snapshot: DatabaseSnapshot } | null = null;

async function readDatabaseSnapshot(now: number): Promise<DatabaseSnapshot> {
	if (countsCache && now - countsCache.at < COUNTS_CACHE_TTL_MS) {
		return countsCache.snapshot;
	}

	let snapshot: DatabaseSnapshot;
	try {
		const [totalListings, totalBookings] = await Promise.all([
			prisma.listing.count(),
			prisma.booking.count()
		]);
		snapshot = { status: 'HEALTHY', totalListings, totalBookings };
	} catch {
		// Never cache a failure: the next call must retry the database.
		return { status: 'UNHEALTHY', totalListings: 0, totalBookings: 0 };
	}

	countsCache = { at: now, snapshot };
	return snapshot;
}

export const GET: RequestHandler = async ({ request }) => {
	// Optional bearer protection (OWASP A01). When METRICS_TOKEN is unset the endpoint
	// stays open, so local development and the existing demo keep working unchanged.
	const expectedToken = env.METRICS_TOKEN;
	if (expectedToken && request.headers.get('authorization') !== `Bearer ${expectedToken}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const database = await readDatabaseSnapshot(Date.now());

	return json(
		{
			timestamp: new Date().toISOString(),
			uptimeSeconds: process.uptime(),
			memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
			circuitBreaker: {
				state: wakamCircuitBreaker.getState(),
				failureCount: wakamCircuitBreaker.getFailureCount()
			},
			database
		},
		{ status: 200 }
	);
};
