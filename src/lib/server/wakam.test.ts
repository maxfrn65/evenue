import { describe, it, expect } from 'vitest';
import { issueWakamInsurancePolicy } from './wakam';

describe('Wakam Insurance Service', () => {
	it('should issue valid insurance policy when circuit breaker is closed', async () => {
		const policy = await issueWakamInsurancePolicy('b-1', 'Villa Riviera', 850, 40);
		expect(policy.policyNumber).toMatch(/^WAK-2026-\d{5}$/);
		expect(policy.status).toBe('ISSUED');
		expect(policy.coverageAmount).toBe(10000);
	});
});
