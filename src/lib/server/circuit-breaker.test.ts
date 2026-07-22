import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker';

describe('CircuitBreaker Engine', () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	it('should execute successfully when CLOSED', async () => {
		const breaker = new CircuitBreaker<string>();
		const result = await breaker.execute(async () => 'OK');

		expect(result).toBe('OK');
		expect(breaker.getState()).toBe('CLOSED');
		expect(breaker.getFailureCount()).toBe(0);
	});

	it('should transition to OPEN after reaching failure threshold (3 failures)', async () => {
		const stateChanges: string[] = [];
		const breaker = new CircuitBreaker<string>({
			failureThreshold: 3,
			onStateChange: (from, to) => stateChanges.push(`${from}->${to}`)
		});

		const failingAction = async () => {
			throw new Error('API failure');
		};

		// 1st failure
		await expect(breaker.execute(failingAction)).rejects.toThrow('API failure');
		expect(breaker.getState()).toBe('CLOSED');

		// 2nd failure
		await expect(breaker.execute(failingAction)).rejects.toThrow('API failure');
		expect(breaker.getState()).toBe('CLOSED');

		// 3rd failure -> trips to OPEN
		await expect(breaker.execute(failingAction)).rejects.toThrow('API failure');
		expect(breaker.getState()).toBe('OPEN');
		expect(stateChanges).toContain('CLOSED->OPEN');
	});

	it('should throw CircuitBreakerOpenError when OPEN without calling action', async () => {
		const actionSpy = vi.fn().mockRejectedValue(new Error('Down'));
		const breaker = new CircuitBreaker<string>({ failureThreshold: 1 });

		await expect(breaker.execute(actionSpy)).rejects.toThrow('Down');
		expect(breaker.getState()).toBe('OPEN');

		// Next call should fail fast without invoking actionSpy
		await expect(breaker.execute(actionSpy)).rejects.toThrow(CircuitBreakerOpenError);
		expect(actionSpy).toHaveBeenCalledTimes(1);
	});

	it('should execute fallback when OPEN if fallback option is provided', async () => {
		const breaker = new CircuitBreaker<string>({
			failureThreshold: 1,
			fallback: () => 'FALLBACK_POLICY'
		});

		await breaker.execute(async () => {
			throw new Error('Wakam down');
		});

		expect(breaker.getState()).toBe('OPEN');

		// Call while OPEN returns fallback
		const result = await breaker.execute(async () => 'Real result');
		expect(result).toBe('FALLBACK_POLICY');
	});

	it('should transition to HALF_OPEN after resetTimeoutMs', async () => {
		vi.useFakeTimers();
		const breaker = new CircuitBreaker<string>({
			failureThreshold: 1,
			resetTimeoutMs: 1000
		});

		await expect(
			breaker.execute(async () => {
				throw new Error('Fail');
			})
		).rejects.toThrow();

		expect(breaker.getState()).toBe('OPEN');

		// Advance timer past 1000ms
		vi.advanceTimersByTime(1100);

		expect(breaker.getState()).toBe('HALF_OPEN');
	});

	it('should reset to CLOSED after successful request in HALF_OPEN state', async () => {
		vi.useFakeTimers();
		const breaker = new CircuitBreaker<string>({
			failureThreshold: 1,
			resetTimeoutMs: 1000
		});

		await expect(
			breaker.execute(async () => {
				throw new Error('Fail');
			})
		).rejects.toThrow();

		vi.advanceTimersByTime(1100);
		expect(breaker.getState()).toBe('HALF_OPEN');

		// Successful trial action
		const res = await breaker.execute(async () => 'RECOVERED');
		expect(res).toBe('RECOVERED');
		expect(breaker.getState()).toBe('CLOSED');
		expect(breaker.getFailureCount()).toBe(0);
	});
});
