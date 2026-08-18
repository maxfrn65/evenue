import { beforeEach, describe, expect, it } from 'vitest';
import {
	METRICS_CONTENT_TYPE,
	recordCircuitBreakerOpened,
	recordHttpRequest,
	recordLoginFailure,
	registry,
	renderMetrics,
	setCircuitBreakerState
} from './metrics';

describe('Prometheus instrumentation', () => {
	beforeEach(() => {
		registry.resetMetrics();
	});

	it('exposes the Prometheus text exposition content type', () => {
		expect(METRICS_CONTENT_TYPE).toContain('text/plain');
		expect(METRICS_CONTENT_TYPE).toContain('version=0.0.4');
	});

	it('counts HTTP requests by method, route and status', async () => {
		recordHttpRequest('GET', '/listings/[id]', 200, 120);
		recordHttpRequest('GET', '/listings/[id]', 200, 80);
		recordHttpRequest('POST', '/api/bookings', 500, 900);

		const output = await renderMetrics();

		expect(output).toContain('# TYPE evenue_http_requests_total counter');
		expect(output).toContain(
			'evenue_http_requests_total{method="GET",route="/listings/[id]",status="200",service="evenue-app"} 2'
		);
		expect(output).toContain(
			'evenue_http_requests_total{method="POST",route="/api/bookings",status="500",service="evenue-app"} 1'
		);
	});

	it('records latency in seconds in a histogram straddling the 2 s KRI threshold', async () => {
		recordHttpRequest('GET', '/', 200, 2500);

		const output = await renderMetrics();

		expect(output).toContain('# TYPE evenue_http_request_duration_seconds histogram');
		// 2.5 s must fall above the 2 s bucket and below the 5 s one.
		expect(output).toContain(
			'evenue_http_request_duration_seconds_bucket{le="2",service="evenue-app",method="GET",route="/"} 0'
		);
		expect(output).toContain(
			'evenue_http_request_duration_seconds_bucket{le="5",service="evenue-app",method="GET",route="/"} 1'
		);
		expect(output).toContain(
			'evenue_http_request_duration_seconds_sum{service="evenue-app",method="GET",route="/"} 2.5'
		);
	});

	it('reports the circuit breaker state as an ordered gauge where higher is worse', async () => {
		setCircuitBreakerState('wakam', 'OPEN', 3);
		recordCircuitBreakerOpened('wakam');

		const output = await renderMetrics();

		expect(output).toContain(
			'evenue_circuit_breaker_state{partner="wakam",service="evenue-app"} 2'
		);
		expect(output).toContain(
			'evenue_circuit_breaker_consecutive_failures{partner="wakam",service="evenue-app"} 3'
		);
		expect(output).toContain(
			'evenue_circuit_breaker_opened_total{partner="wakam",service="evenue-app"} 1'
		);
	});

	it('maps every circuit breaker state to a distinct value', async () => {
		setCircuitBreakerState('wakam', 'CLOSED', 0);
		expect(await renderMetrics()).toContain(
			'evenue_circuit_breaker_state{partner="wakam",service="evenue-app"} 0'
		);

		setCircuitBreakerState('wakam', 'HALF_OPEN', 3);
		expect(await renderMetrics()).toContain(
			'evenue_circuit_breaker_state{partner="wakam",service="evenue-app"} 1'
		);
	});

	it('counts failed logins by reason, backing the brute-force KRI', async () => {
		recordLoginFailure('invalid_credentials');
		recordLoginFailure('invalid_credentials');
		recordLoginFailure('rate_limited');

		const output = await renderMetrics();

		expect(output).toContain(
			'evenue_auth_login_failures_total{reason="invalid_credentials",service="evenue-app"} 2'
		);
		expect(output).toContain(
			'evenue_auth_login_failures_total{reason="rate_limited",service="evenue-app"} 1'
		);
	});

	it('exposes default process metrics for the CPU / memory KRI', async () => {
		const output = await renderMetrics();

		expect(output).toContain('evenue_process_cpu_seconds_total');
		expect(output).toContain('evenue_process_resident_memory_bytes');
	});
});
