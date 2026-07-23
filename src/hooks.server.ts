import type { Handle, HandleServerError } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';

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

	// Security headers (OWASP A05: Security Misconfiguration).
	applySecurityHeaders(response.headers, event.url?.protocol === 'https:');

	const method = event.request?.method || 'GET';
	const pathname = event.url?.pathname || '/';

	// Log HTTP request metadata in JSON format for Grafana Loki
	if (response.status >= 400) {
		logger.warn(`HTTP ${method} ${pathname} ${response.status}`, {
			context: 'HTTP_REQUEST',
			path: pathname,
			statusCode: response.status,
			durationMs,
			userId: event.locals.user?.id
		});
	} else {
		logger.info(`HTTP ${method} ${pathname} ${response.status}`, {
			context: 'HTTP_REQUEST',
			path: pathname,
			statusCode: response.status,
			durationMs,
			userId: event.locals.user?.id
		});
	}

	return response;
};

/**
 * Global Error Handler for uncaught server exceptions.
 */
export const handleError: HandleServerError = ({ error, event }) => {
	const err = error as Error;
	const pathname = event.url?.pathname || '/';
	logger.error(`Uncaught Server Exception: ${err?.message || 'Unknown error'}`, {
		context: 'SERVER_EXCEPTION',
		path: pathname,
		error: err?.message,
		stack: err?.stack,
		userId: event.locals.user?.id
	});

	return {
		message: 'Une erreur interne est survenue sur le serveur.',
		code: 'INTERNAL_SERVER_ERROR'
	};
};
