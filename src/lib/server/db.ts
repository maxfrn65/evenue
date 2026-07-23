import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '$env/dynamic/private';

// Read from SvelteKit's runtime private env (merges .env + process.env), never
// from a hardcoded fallback (OWASP A02: Cryptographic Failures — no secret in
// source). Configure DATABASE_URL in .env locally / CI-CD secrets in production.
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

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

// Prisma Client v7 initialized
