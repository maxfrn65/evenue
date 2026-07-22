import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
	process.env.DATABASE_URL ||
	'postgresql://evenue_user:evenue_password@localhost:5433/evenue_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
