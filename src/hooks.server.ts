import type { Handle, HandleServerError } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';

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
