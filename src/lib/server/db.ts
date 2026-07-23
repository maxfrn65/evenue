import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
	process.env.DATABASE_URL ||
	'postgresql://evenue_user:evenue_password@localhost:5433/evenue_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// During development, Vite preserves `globalThis` across hot reloads. Recreate
// the client if it predates the Message model so newly added delegates are
// available without forcing every developer to restart the server manually.
const cachedPrisma = globalForPrisma.prisma;
const hasMessageDelegate = cachedPrisma && 'message' in cachedPrisma;

export const prisma = hasMessageDelegate ? cachedPrisma : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
// Prisma Client v7 initialized
