import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
	process.env.DATABASE_URL ||
	'postgresql://evenue_user:evenue_password@localhost:5433/evenue_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

// Prisma Client v7 initialized
