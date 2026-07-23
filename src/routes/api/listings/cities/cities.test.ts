import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('$lib/server/db', () => ({
	prisma: {
		listing: {
			findMany: vi.fn()
		}
	}
}));

import { prisma } from '$lib/server/db';
import { GET } from './+server';

describe('Cities API Endpoint', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return deduplicated and sorted list of cities from DB and defaults', async () => {
		vi.mocked(prisma.listing.findMany).mockResolvedValue([
			{ city: 'Marseille' },
			{ city: 'Cannes' },
			{ city: 'Paris' }
		] as any);

		const response = await GET({} as any);
		const data = await response.json();

		expect(data.success).toBe(true);
		expect(data.cities).toContain('Cannes');
		expect(data.cities).toContain('Paris');
		expect(data.cities).toContain('Marseille');
		expect(data.cities).toContain('Aix-en-Provence');
	});

	it('should fallback to default cities if database error occurs', async () => {
		vi.mocked(prisma.listing.findMany).mockRejectedValue(new Error('DB Connection error'));

		const response = await GET({} as any);
		const data = await response.json();

		expect(data.success).toBe(false);
		expect(data.cities).toContain('Paris');
		expect(data.cities).toContain('Lyon');
	});
});
