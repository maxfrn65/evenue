/**
 * Circuit Breaker Engine for Evenue External Services (e.g., Wakam AssurTech API).
 *
 * Implements the 3-state Circuit Breaker Pattern:
 * - CLOSED: Normal operation. All requests pass through.
 * - OPEN: Requests fail fast or trigger fallback without calling the external service.
 * - HALF_OPEN: Trial state after reset timeout. One request tests if the service recovered.
 */

import { logger } from './logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions<T> {
	failureThreshold?: number; // Number of failures before tripping (Default: 3 per KRI rules)
	resetTimeoutMs?: number;   // Delay before trying HALF_OPEN (Default: 5000ms)
	fallback?: () => T | Promise<T>; // Degradation fallback response
	onStateChange?: (fromState: CircuitState, toState: CircuitState) => void;
}

export class CircuitBreakerOpenError extends Error {
	constructor(message: string = 'Circuit Breaker is currently OPEN (Service degraded)') {
		super(message);
		this.name = 'CircuitBreakerOpenError';
	}
}

export class CircuitBreaker<T = unknown> {
	private state: CircuitState = 'CLOSED';
	private failureCount: number = 0;
	private lastStateChangeTime: number = Date.now();

	private readonly failureThreshold: number;
	private readonly resetTimeoutMs: number;
	private readonly fallback?: () => T | Promise<T>;
	private readonly onStateChange?: (fromState: CircuitState, toState: CircuitState) => void;

	constructor(options: CircuitBreakerOptions<T> = {}) {
		this.failureThreshold = options.failureThreshold ?? 3;
		this.resetTimeoutMs = options.resetTimeoutMs ?? 5000;
		this.fallback = options.fallback;
		this.onStateChange = options.onStateChange;
	}

	public getState(): CircuitState {
		if (this.state === 'OPEN') {
			const now = Date.now();
			if (now - this.lastStateChangeTime >= this.resetTimeoutMs) {
				this.transitionTo('HALF_OPEN');
			}
		}
		return this.state;
	}

	public getFailureCount(): number {
		return this.failureCount;
	}

	public async execute(action: () => Promise<T>): Promise<T> {
		const currentState = this.getState();

		if (currentState === 'OPEN') {
			if (this.fallback) {
				return this.fallback();
			}
			throw new CircuitBreakerOpenError();
		}

		try {
			const result = await action();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			if (this.fallback) {
				return this.fallback();
			}
			throw error;
		}
	}

	private onSuccess(): void {
		if (this.state === 'HALF_OPEN' || this.failureCount > 0) {
			this.failureCount = 0;
			this.transitionTo('CLOSED');
		}
	}

	private onFailure(): void {
		this.failureCount++;
		if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
			this.transitionTo('OPEN');
		}
	}

	private transitionTo(newState: CircuitState): void {
		if (this.state !== newState) {
			const oldState = this.state;
			this.state = newState;
			this.lastStateChangeTime = Date.now();

			if (newState === 'OPEN') {
				logger.alert(`Circuit Breaker tripped to OPEN. Partner service is unreachable.`, {
					context: 'CIRCUIT_BREAKER',
					metadata: { fromState: oldState, toState: newState, failureCount: this.failureCount }
				});
			} else if (newState === 'HALF_OPEN') {
				logger.warn(`Circuit Breaker transitioning to HALF_OPEN to test recovery.`, {
					context: 'CIRCUIT_BREAKER',
					metadata: { fromState: oldState, toState: newState }
				});
			} else if (newState === 'CLOSED' && oldState !== 'CLOSED') {
				logger.info(`Circuit Breaker restored to CLOSED. Partner service recovered.`, {
					context: 'CIRCUIT_BREAKER',
					metadata: { fromState: oldState, toState: newState }
				});
			}

			if (this.onStateChange) {
				this.onStateChange(oldState, newState);
			}
		}
	}

	public reset(): void {
		this.failureCount = 0;
		this.transitionTo('CLOSED');
	}
}

export const wakamCircuitBreaker = new CircuitBreaker();
