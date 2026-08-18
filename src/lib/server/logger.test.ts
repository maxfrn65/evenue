import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger';

describe('Structured JSON Logger Service', () => {
	it('should format info logs correctly as JSON', () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const result = logger.info('Test info message', { context: 'HTTP', statusCode: 200 });

		expect(spy).toHaveBeenCalled();
		const parsed = JSON.parse(result);
		expect(parsed.level).toBe('INFO');
		expect(parsed.message).toBe('Test info message');
		expect(parsed.context).toBe('HTTP');
		expect(parsed.statusCode).toBe(200);
		expect(parsed.service).toBe('evenue-app');
		spy.mockRestore();
	});

	it('should format error logs correctly as JSON', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const result = logger.error('Database connection failed', { error: 'ECONNREFUSED' });

		expect(spy).toHaveBeenCalled();
		const parsed = JSON.parse(result);
		expect(parsed.level).toBe('ERROR');
		expect(parsed.error).toBe('ECONNREFUSED');
		spy.mockRestore();
	});

	it('should format critical alert logs correctly', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const result = logger.alert('Circuit Breaker Tripped to OPEN', { context: 'WAKAM_INSURANCE' });

		expect(spy).toHaveBeenCalled();
		const parsed = JSON.parse(result);
		expect(parsed.level).toBe('ALERT');
		expect(parsed.context).toBe('WAKAM_INSURANCE');
		expect(parsed.alertMarker).toBe('CRITICAL_ALERT');
		spy.mockRestore();
	});

	// Regression guard: a prefixed line (e.g. "🚨 [CRITICAL_ALERT] {…}") is not valid JSON,
	// so Loki's `| json` stage fails and every alert rule on level="ALERT" silently dies.
	// Asserting on the returned value alone would not have caught it.
	it('should emit alert lines to stderr as raw parsable JSON, with no prefix', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		logger.alert('Circuit Breaker tripped to OPEN', { context: 'CIRCUIT_BREAKER' });

		const written = spy.mock.calls[0][0] as string;
		expect(written.startsWith('{')).toBe(true);
		const parsed = JSON.parse(written);
		expect(parsed.level).toBe('ALERT');
		expect(parsed.alertMarker).toBe('CRITICAL_ALERT');
		expect(parsed.context).toBe('CIRCUIT_BREAKER');
		spy.mockRestore();
	});

	it('should emit every level as a single parsable JSON line', () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		logger.info('info line');
		logger.warn('warn line');
		logger.error('error line');

		for (const spy of [logSpy, warnSpy, errorSpy]) {
			const written = spy.mock.calls[0][0] as string;
			expect(() => JSON.parse(written)).not.toThrow();
			expect(written.includes('\n')).toBe(false);
		}

		logSpy.mockRestore();
		warnSpy.mockRestore();
		errorSpy.mockRestore();
	});

	it('should carry the correlation id through the payload', () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const parsed = JSON.parse(logger.info('HTTP GET /', { requestId: 'req-42' }));

		expect(parsed.requestId).toBe('req-42');
		spy.mockRestore();
	});
});
