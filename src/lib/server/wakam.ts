import { CircuitBreaker } from './circuit-breaker';
import { logger } from './logger';
import { recordPartnerFallback } from './metrics';

export interface InsurancePolicyResult {
	policyNumber: string;
	status: 'ISSUED' | 'FALLBACK_OFFLINE';
	issuedAt: string;
	coverageAmount: number;
	/** True when no request reached Wakam — always true in this build. See below. */
	simulated: boolean;
}

const COVERAGE_AMOUNT_EUR = 10000;

/**
 * The breaker protecting the Wakam partner call.
 *
 * Exported because the metrics endpoints report its state: they previously read a second,
 * never-executed breaker instance declared in ./circuit-breaker, so `/metrics` always
 * showed CLOSED / 0 failures no matter what the real call path did. One instance, one
 * `partner: 'wakam'` label, one truth.
 */
export const wakamCircuitBreaker = new CircuitBreaker<InsurancePolicyResult>({
	partner: 'wakam',
	failureThreshold: 3,
	resetTimeoutMs: 5000,
	fallback: () => ({
		policyNumber: `WAK-OFFLINE-${Math.floor(10000 + Math.random() * 90000)}`,
		status: 'FALLBACK_OFFLINE' as const,
		issuedAt: new Date().toISOString(),
		coverageAmount: COVERAGE_AMOUNT_EUR,
		simulated: true
	})
});

/**
 * Issue the insurance policy attached to a booking.
 *
 * SIMULATED PARTNER — no HTTP request is made to Wakam and `WAKAM_API_KEY` is not read.
 * The underwriting call is modelled locally so the rest of the chain (circuit breaker,
 * policy persistence, certificate, claim window) can be exercised end to end. Every
 * issuance is counted under `evenue_partner_fallback_total{partner="wakam"}` and logged,
 * so a reader of the dashboards is never led to believe a real policy was underwritten.
 *
 * The parameters are the payload a real call would carry; they are recorded in the log
 * line rather than sent anywhere.
 */
export async function issueWakamInsurancePolicy(
	bookingId: string,
	listingTitle: string,
	amount: number,
	guestCount: number
): Promise<InsurancePolicyResult> {
	recordPartnerFallback('wakam', 'policies.issue');

	return await wakamCircuitBreaker.execute(async () => {
		const policy: InsurancePolicyResult = {
			policyNumber: `WAK-2026-${Math.floor(10000 + Math.random() * 90000)}`,
			status: 'ISSUED' as const,
			issuedAt: new Date().toISOString(),
			coverageAmount: COVERAGE_AMOUNT_EUR,
			simulated: true
		};

		logger.info('Wakam policy issued from a simulated underwriting call', {
			context: 'WAKAM_SIMULATED',
			metadata: {
				partner: 'wakam',
				simulated: true,
				bookingId,
				listingTitle,
				amount,
				guestCount,
				policyNumber: policy.policyNumber
			}
		});

		return policy;
	});
}
