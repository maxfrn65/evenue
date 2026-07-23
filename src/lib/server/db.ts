import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
	process.env.DATABASE_URL ||
	'postgresql://neondb_owner:npg_8ja2xQiocYAI@ep-odd-rice-as2pdpcy.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require';

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
