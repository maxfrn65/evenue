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
		spy.mockRestore();
	});
});
