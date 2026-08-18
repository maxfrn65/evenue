import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted above the imports, so the stub must be hoisted with it.
const { mockEnv } = vi.hoisted(() => ({ mockEnv: {} as { METRICS_TOKEN?: string } }));
vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

import { logger } from './logger';
import { denyMetricsAccess, resetMetricsAuthWarning } from './metrics-auth';

const request = (headers: Record<string, string> = {}) =>
	new Request('https://evenue.test/metrics', { headers });

describe('Metrics access guard', () => {
	const originalNodeEnv = process.env.NODE_ENV;

	beforeEach(() => {
		delete mockEnv.METRICS_TOKEN;
		resetMetricsAuthWarning();
		vi.spyOn(logger, 'error').mockImplementation(() => '');
	});

	afterEach(() => {
		process.env.NODE_ENV = originalNodeEnv;
		vi.restoreAllMocks();
	});

	it('grants access when the bearer token matches', () => {
		mockEnv.METRICS_TOKEN = 'secret-token';

		expect(denyMetricsAccess(request({ authorization: 'Bearer secret-token' }))).toBeNull();
	});

	it('rejects a missing or wrong token with 401', () => {
		mockEnv.METRICS_TOKEN = 'secret-token';

		expect(denyMetricsAccess(request())?.status).toBe(401);
		expect(denyMetricsAccess(request({ authorization: 'Bearer nope' }))?.status).toBe(401);
	});

	// Fail closed: forgetting the variable in production must not silently republish the
	// business counters, memory figures and partner state to every passing scanner.
	it('disables the endpoint in production when no token is configured', () => {
		process.env.NODE_ENV = 'production';

		const response = denyMetricsAccess(request());

		expect(response).not.toBeNull();
		expect(response?.status).toBe(404);
	});

	it('reports the misconfiguration once, not on every scrape', () => {
		process.env.NODE_ENV = 'production';

		denyMetricsAccess(request());
		denyMetricsAccess(request());
		denyMetricsAccess(request());

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining('METRICS_TOKEN'),
			expect.objectContaining({ context: 'METRICS_ACCESS' })
		);
	});

	it('stays open outside production so local development is unaffected', () => {
		process.env.NODE_ENV = 'development';

		expect(denyMetricsAccess(request())).toBeNull();
	});
});
