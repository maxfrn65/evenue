import type { Handle, HandleServerError } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';
import { recordHttpRequest } from '$lib/server/metrics';

/**
 * Content-Security-Policy for the app (OWASP A05 / A03 defense-in-depth against XSS).
 *
 * Note: 'unsafe-inline' is required on script-src because SvelteKit injects an
 * inline hydration bootstrap script and this project has no nonce/hash CSP
 * plumbing configured; on style-src it covers Svelte/Tailwind inline styles and
 * the Leaflet marker/popup inline styles. img/connect are opened to the map tile
 * and geocoding providers (CartoDB / OpenStreetMap) used by the interactive map.
 */
const CSP_DIRECTIVES = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"img-src 'self' data: blob: https://images.unsplash.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
	"connect-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
	"font-src 'self' data: https://fonts.gstatic.com",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"object-src 'none'"
].join('; ');

/**
 * Apply hardening headers to every response.
 */
function applySecurityHeaders(headers: Headers, isHttps: boolean): void {
	headers.set('Content-Security-Policy', CSP_DIRECTIVES);
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('X-Frame-Options', 'DENY');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	headers.set('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=()');
	headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	// HSTS only makes sense (and is only honoured) over HTTPS.
	if (isHttps) {
		headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}
}

/**
 * Global HTTP Request Handler with telemetry, response time headers, and JSON logging.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now();

	// Correlation id: every line logged while serving this request carries it, and it is
	// echoed back so a user-reported error can be traced to its logs in one LogQL query.
	const requestId = event.request?.headers?.get('x-request-id') || crypto.randomUUID();
	event.locals.requestId = requestId;

	const userId = event.cookies.get('evenue_session');

	if (!userId) {
		event.locals.user = null;
	} else {
		try {
			event.locals.user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					role: true
				}
			});
		} catch {
			event.locals.user = null;
		}
	}

	const response = await resolve(event);
	const durationMs = Math.round(performance.now() - start);

	response.headers.set('x-response-time', `${durationMs}ms`);
	response.headers.set('x-request-id', requestId);

	// Security headers (OWASP A05: Security Misconfiguration).
	applySecurityHeaders(response.headers, event.url?.protocol === 'https:');

	const method = event.request?.method || 'GET';
	const pathname = event.url?.pathname || '/';

	// Prometheus counters and latency histogram feeding the KRI thresholds (§3.2).
	// Labelled by route id, never by raw pathname: an unbounded label would let any
	// visitor create arbitrary time series just by requesting random URLs.
	recordHttpRequest(method, event.route?.id ?? 'unmatched', response.status, durationMs);

	// A scrape every 15 s would add ~5 800 log lines a day for no diagnostic value.
	// Failures still get logged.
	if (pathname === '/metrics' && response.status < 400) {
		return response;
	}

	// Log HTTP request metadata in JSON format for Grafana Loki.
	// The level maps to the status class so an ERROR line always means "the server failed":
	// logging 5xx as WARN made server faults indistinguishable from client mistakes.
	const payload = {
		context: 'HTTP_REQUEST',
		requestId,
		path: pathname,
		statusCode: response.status,
		durationMs,
		userId: event.locals.user?.id
	};
	const line = `HTTP ${method} ${pathname} ${response.status}`;

	if (response.status >= 500) {
		logger.error(line, payload);
	} else if (response.status >= 400) {
		logger.warn(line, payload);
	} else {
		logger.info(line, payload);
	}

	return response;
};

/**
 * Global Error Handler for uncaught server exceptions.
 *
 * SvelteKit routes 404s through this hook too. Reporting them as SERVER_EXCEPTION (with a
 * stack trace) drowned the ERROR level in scanner noise — bots probe /metrics, /.env,
 * /actuator/health continuously on any public IP — and inflated log volume for nothing.
 * Anything below 500 is a client-side outcome and is logged as such, without a stack.
 */
export const handleError: HandleServerError = ({ error, event, status }) => {
	const pathname = event.url?.pathname || '/';
	const requestId = event.locals?.requestId;
	const httpStatus = status ?? 500;

	if (httpStatus < 500) {
		// Not logged here on purpose: `handle` already emits one HTTP_REQUEST line at WARN
		// for this very response. Logging again would double every scanner 404.
		return {
			message:
				httpStatus === 404
					? 'La page demandée est introuvable.'
					: 'La requête ne peut pas être traitée.',
			code: httpStatus === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'
		};
	}

	const err = error as Error;
	logger.error(`Uncaught Server Exception: ${err?.message || 'Unknown error'}`, {
		context: 'SERVER_EXCEPTION',
		requestId,
		path: pathname,
		statusCode: httpStatus,
		error: err?.message,
		stack: err?.stack,
		userId: event.locals?.user?.id
	});

	return {
		message: 'Une erreur interne est survenue sur le serveur.',
		code: 'INTERNAL_SERVER_ERROR'
	};
};
