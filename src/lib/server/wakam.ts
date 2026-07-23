import { CircuitBreaker } from './circuit-breaker';

export interface InsurancePolicyResult {
	policyNumber: string;
	status: 'ISSUED' | 'FALLBACK_OFFLINE';
	issuedAt: string;
	coverageAmount: number;
}

const wakamCircuitBreaker = new CircuitBreaker<InsurancePolicyResult>({
	failureThreshold: 3,
	resetTimeoutMs: 5000,
	fallback: () => ({
		policyNumber: `WAK-OFFLINE-${Math.floor(10000 + Math.random() * 90000)}`,
		status: 'FALLBACK_OFFLINE' as const,
		issuedAt: new Date().toISOString(),
		coverageAmount: 10000
	})
});

export async function issueWakamInsurancePolicy(
	bookingId: string,
	listingTitle: string,
	amount: number,
	guestCount: number
): Promise<InsurancePolicyResult> {
	return await wakamCircuitBreaker.execute(async () => {
		const policyNumber = `WAK-2026-${Math.floor(10000 + Math.random() * 90000)}`;

		return {
			policyNumber,
			status: 'ISSUED' as const,
			issuedAt: new Date().toISOString(),
			coverageAmount: 10000
		};
	});
}
