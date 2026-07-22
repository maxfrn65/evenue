import { describe, it, expect } from 'vitest';
import { getListings } from './listings';

describe('Listings Service — Event Search & Filtering', () => {
	it('should return default listings array', async () => {
		const listings = await getListings({});
		expect(Array.isArray(listings)).toBe(true);
	});

	it('should support filter inputs by city and eventType', async () => {
		const listings = await getListings({ city: 'Paris', eventType: 'SOIRÉE' });
		expect(Array.isArray(listings)).toBe(true);
	});
});
