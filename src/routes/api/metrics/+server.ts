import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { wakamCircuitBreaker } from '$lib/server/circuit-breaker';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	let dbStatus = 'HEALTHY';
	let listingsCount = 0;
	let bookingsCount = 0;

	try {
		listingsCount = await prisma.listing.count();
		bookingsCount = await prisma.booking.count();
	} catch (e) {
		dbStatus = 'UNHEALTHY';
	}

	return json(
		{
			timestamp: new Date().toISOString(),
			uptimeSeconds: process.uptime(),
			memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
			circuitBreaker: {
				state: wakamCircuitBreaker.getState(),
				failureCount: wakamCircuitBreaker.getFailureCount()
			},
			database: {
				status: dbStatus,
				totalListings: listingsCount,
				totalBookings: bookingsCount
			}
		},
		{ status: 200 }
	);
};
