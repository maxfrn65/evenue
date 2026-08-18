/**
 * Prometheus instrumentation for Evenue.
 *
 * Exposes the counters, histograms and gauges backing the KRI thresholds defined in the
 * Bloc 4 supervision plan (§3.2):
 *   - HTTP 500 error rate            > 1 % over 5 min
 *   - Average / p95 response time    > 2 s
 *   - Failed login attempts          > 50/min from a single IP
 *   - Wakam circuit breaker          > 3 consecutive failures (breaker OPEN)
 *   - CPU / memory                   > 85 % (from the default process collectors)
 *
 * Scope caveat, stated up front: the serverless container scales to zero and can run
 * several instances, so every counter here is per-instance and resets on cold start.
 * Rates over a window (the way the alert rules are written) stay meaningful; absolute
 * cumulative totals do not. See docs/GRAFANA_MONITORING.md § 4.
 */

import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import type { CircuitState } from './circuit-breaker';

export const registry = new Registry();

registry.setDefaultLabels({ service: 'evenue-app' });

// process_cpu_*, process_resident_memory_bytes, nodejs_eventloop_lag_* …
collectDefaultMetrics({ register: registry, prefix: 'evenue_' });

/**
 * Labelled by `route` (the SvelteKit route id, e.g. `/listings/[id]`) and never by the raw
 * pathname: a per-URL label would let any visitor create unbounded time series.
 */
export const httpRequestsTotal = new Counter({
	name: 'evenue_http_requests_total',
	help: 'Total number of HTTP requests handled, by method, route and status code.',
	labelNames: ['method', 'route', 'status'] as const,
	registers: [registry]
});

export const httpRequestDurationSeconds = new Histogram({
	name: 'evenue_http_request_duration_seconds',
	help: 'HTTP request latency in seconds, by method and route.',
	labelNames: ['method', 'route'] as const,
	// The 2 s bucket is the KRI threshold for response time; the surrounding buckets make
	// p95/p99 usable on either side of it.
	buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
	registers: [registry]
});

export const authLoginFailuresTotal = new Counter({
	name: 'evenue_auth_login_failures_total',
	help: 'Failed login attempts, by reason.',
	labelNames: ['reason'] as const,
	registers: [registry]
});

/** 0 = CLOSED, 1 = HALF_OPEN, 2 = OPEN — ordered so that "higher is worse". */
export const circuitBreakerState = new Gauge({
	name: 'evenue_circuit_breaker_state',
	help: 'Circuit breaker state of an external partner: 0 CLOSED, 1 HALF_OPEN, 2 OPEN.',
	labelNames: ['partner'] as const,
	registers: [registry]
});

export const circuitBreakerFailures = new Gauge({
	name: 'evenue_circuit_breaker_consecutive_failures',
	help: 'Consecutive failures recorded by a partner circuit breaker.',
	labelNames: ['partner'] as const,
	registers: [registry]
});

export const circuitBreakerOpenedTotal = new Counter({
	name: 'evenue_circuit_breaker_opened_total',
	help: 'Number of times a partner circuit breaker tripped to OPEN.',
	labelNames: ['partner'] as const,
	registers: [registry]
});

const STATE_VALUES: Record<CircuitState, number> = {
	CLOSED: 0,
	HALF_OPEN: 1,
	OPEN: 2
};

export function recordHttpRequest(
	method: string,
	route: string,
	status: number,
	durationMs: number
): void {
	httpRequestsTotal.inc({ method, route, status: String(status) });
	httpRequestDurationSeconds.observe({ method, route }, durationMs / 1000);
}

export function recordLoginFailure(reason: 'invalid_credentials' | 'rate_limited'): void {
	authLoginFailuresTotal.inc({ reason });
}

export function setCircuitBreakerState(
	partner: string,
	state: CircuitState,
	consecutiveFailures: number
): void {
	circuitBreakerState.set({ partner }, STATE_VALUES[state]);
	circuitBreakerFailures.set({ partner }, consecutiveFailures);
}

export function recordCircuitBreakerOpened(partner: string): void {
	circuitBreakerOpenedTotal.inc({ partner });
}

/** Prometheus text exposition format (version 0.0.4). */
export function renderMetrics(): Promise<string> {
	return registry.metrics();
}

export const METRICS_CONTENT_TYPE = registry.contentType;
