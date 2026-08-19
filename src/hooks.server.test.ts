import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({
	prisma: {
		session: {
			findUnique: vi.fn(),
			deleteMany: vi.fn().mockResolvedValue({ count: 1 })
		}
	}
}));

import { prisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';
import { handle, handleError } from './hooks.server';

function buildEvent(overrides: Record<string, unknown> = {}) {
	return {
		cookies: { get: vi.fn().mockReturnValue(undefined), delete: vi.fn() },
		locals: {},
		request: { method: 'GET', headers: new Headers() },
		url: new URL('https://evenue.test/listings'),
		...overrides
	} as any;
}

describe('session hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const user = {
		id: 'guest-1',
		email: 'guest@example.test',
		firstName: 'Alice',
		lastName: 'Martin',
		role: 'GUEST'
	};

	it('resolves the cookie as a session token, never as a user id', async () => {
		vi.mocked(prisma.session.findUnique).mockResolvedValue({
			expiresAt: new Date(Date.now() + 60_000),
			user
		} as any);

		const event = {
			cookies: { get: vi.fn().mockReturnValue('opaque-token'), delete: vi.fn() },
			locals: {}
		} as any;
		const resolve = vi.fn().mockResolvedValue(new Response());

		await handle({ event, resolve } as any);

		// The lookup keys on the session id. Keying on a user id is what made the old
		// cookie forgeable, so this assertion is the regression guard.
		expect(prisma.session.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'opaque-token' } })
		);
		expect(event.locals.user).toEqual(user);
		expect(event.cookies.delete).not.toHaveBeenCalled();
	});

	it('rejects an expired session and clears the dead cookie', async () => {
		vi.mocked(prisma.session.findUnique).mockResolvedValue({
			expiresAt: new Date(Date.now() - 60_000),
			user
		} as any);

		const event = {
			cookies: { get: vi.fn().mockReturnValue('stale-token'), delete: vi.fn() },
			locals: {}
		} as any;

		await handle({ event, resolve: vi.fn().mockResolvedValue(new Response()) } as any);

		expect(event.locals.user).toBeNull();
		expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { id: 'stale-token' } });
		expect(event.cookies.delete).toHaveBeenCalled();
	});

	it('rejects a token the store does not know', async () => {
		vi.mocked(prisma.session.findUnique).mockResolvedValue(null as any);

		const event = {
			cookies: { get: vi.fn().mockReturnValue('forged-token'), delete: vi.fn() },
			locals: {}
		} as any;

		await handle({ event, resolve: vi.fn().mockResolvedValue(new Response()) } as any);

		expect(event.locals.user).toBeNull();
		expect(event.cookies.delete).toHaveBeenCalled();
	});

	it('marks locals as anonymous when no session cookie exists', async () => {
		const event = {
			cookies: { get: vi.fn().mockReturnValue(undefined), delete: vi.fn() },
			locals: {}
		} as any;

		await handle({ event, resolve: vi.fn().mockResolvedValue(new Response()) } as any);

		expect(prisma.session.findUnique).not.toHaveBeenCalled();
		expect(event.locals.user).toBeNull();
		expect(event.cookies.delete).not.toHaveBeenCalled();
	});
});

describe('request telemetry hook', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(logger, 'info').mockImplementation(() => '');
		vi.spyOn(logger, 'warn').mockImplementation(() => '');
		vi.spyOn(logger, 'error').mockImplementation(() => '');
	});

	async function run(status: number, event = buildEvent()) {
		const resolve = vi.fn().mockResolvedValue(new Response(null, { status }));
		const response = await handle({ event, resolve } as any);
		return { event, response };
	}

	it('logs a 2xx at INFO, a 4xx at WARN and a 5xx at ERROR', async () => {
		await run(200);
		expect(logger.info).toHaveBeenCalledWith(
			'HTTP GET /listings 200',
			expect.objectContaining({ context: 'HTTP_REQUEST', statusCode: 200 })
		);

		await run(403);
		expect(logger.warn).toHaveBeenCalledWith(
			'HTTP GET /listings 403',
			expect.objectContaining({ statusCode: 403 })
		);

		// A server fault must not be indistinguishable from a client mistake.
		await run(500);
		expect(logger.error).toHaveBeenCalledWith(
			'HTTP GET /listings 500',
			expect.objectContaining({ statusCode: 500 })
		);
	});

	it('generates a correlation id, exposes it and attaches it to the log line', async () => {
		const { event, response } = await run(200);

		const requestId = response.headers.get('x-request-id');
		expect(requestId).toBeTruthy();
		expect(event.locals.requestId).toBe(requestId);
		expect(logger.info).toHaveBeenCalledWith(
			'HTTP GET /listings 200',
			expect.objectContaining({ requestId })
		);
	});

	it('reuses an inbound x-request-id so the trace survives a proxy hop', async () => {
		const event = buildEvent({
			request: { method: 'GET', headers: new Headers({ 'x-request-id': 'upstream-1' }) }
		});
		const { response } = await run(200, event);

		expect(response.headers.get('x-request-id')).toBe('upstream-1');
	});
});

describe('error hook', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(logger, 'warn').mockImplementation(() => '');
		vi.spyOn(logger, 'error').mockImplementation(() => '');
	});

	// Scanners hammer /metrics, /.env, /actuator/health on any public IP. Reporting those
	// 404s as uncaught exceptions drowned the ERROR level and made alerting unusable.
	// `handle` already logs the 404 once, so this hook must stay silent — otherwise every
	// scanner probe costs two log lines.
	it('does not report a 404 as a server exception, and does not log it twice', () => {
		const event = buildEvent({
			url: new URL('https://evenue.test/.env'),
			locals: { requestId: 'req-1' }
		});

		const result = handleError({
			error: new Error('Not found: /.env'),
			event,
			status: 404,
			message: 'Not Found'
		} as any);

		expect(logger.error).not.toHaveBeenCalled();
		expect(logger.warn).not.toHaveBeenCalled();
		expect(result).toEqual({ message: 'La page demandée est introuvable.', code: 'NOT_FOUND' });
	});

	it('reports a genuine 500 as a server exception with its stack', () => {
		const error = new Error('boom');
		const event = buildEvent({ locals: { requestId: 'req-2', user: { id: 'user-9' } } });

		const result = handleError({ error, event, status: 500, message: 'Internal Error' } as any);

		expect(logger.error).toHaveBeenCalledWith(
			'Uncaught Server Exception: boom',
			expect.objectContaining({
				context: 'SERVER_EXCEPTION',
				requestId: 'req-2',
				userId: 'user-9',
				stack: error.stack
			})
		);
		expect(result).toEqual({
			message: 'Une erreur interne est survenue sur le serveur.',
			code: 'INTERNAL_SERVER_ERROR'
		});
	});
});
