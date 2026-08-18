import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '$env/dynamic/private';

/**
 * Prisma client, created on first use rather than on import.
 *
 * SvelteKit's build-time analysis imports every server module to collect its page options,
 * so a module that demands a runtime secret at import time fails `vite build` in any
 * environment that has none — which is exactly what happened inside the Docker image, where
 * no .env exists: the build broke and no image was published for weeks.
 *
 * Deferring the read keeps the secret out of the source (OWASP A02, no hardcoded fallback)
 * while letting the application be built without production credentials.
 */

let client: PrismaClient | undefined;

function createClient(): PrismaClient {
	// Runtime private env (merges .env + process.env), never a hardcoded fallback.
	const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error(
			'DATABASE_URL is not set. Define it in your environment before starting the app.'
		);
	}

	const isProduction =
		process.env.NODE_ENV === 'production' ||
		connectionString.includes('neon.tech') ||
		connectionString.includes('sslmode=require');

	const pool = new pg.Pool({
		connectionString,
		ssl: isProduction ? { rejectUnauthorized: false } : undefined
	});

	return new PrismaClient({ adapter: new PrismaPg(pool) });
}

/**
 * Behaves like a PrismaClient; the real client and its connection pool are built on the
 * first property access, so importing this module has no side effect.
 */
export const prisma = new Proxy({} as PrismaClient, {
	get(_target, property) {
		client ??= createClient();
		const value = Reflect.get(client, property, client);
		return typeof value === 'function' ? value.bind(client) : value;
	}
});
