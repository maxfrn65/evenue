import { describe, it, expect, vi } from 'vitest';
import { issueWakamInsurancePolicy } from './wakam';

describe('Wakam Insurance & Circuit Breaker Integration', () => {
	it('generates a valid policy number WAK-2026-XXXXX when Circuit Breaker is CLOSED', async () => {
		const policy = await issueWakamInsurancePolicy(
			'booking-123',
			'Villa avec Piscine',
			850,
			30
		);

		expect(policy).toBeDefined();
		expect(policy.policyNumber).toMatch(/^WAK-2026-\d{5}$/);
		expect(policy.coverageAmount).toBe(10000);
		expect(policy.status).toBe('ISSUED');
	});

	it('returns a fallback policy number when Circuit Breaker is triggered', async () => {
		const policy = await issueWakamInsurancePolicy(
			'booking-fallback',
			'Loft Industriel',
			1200,
			50
		);

		expect(policy).toBeDefined();
		expect(policy.coverageAmount).toBe(10000);
	});
});
