export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'ALERT';

export interface LogPayload {
	message: string;
	context?: string;
	/** Correlation id shared by every line emitted while serving one HTTP request. */
	requestId?: string;
	path?: string;
	statusCode?: number;
	durationMs?: number;
	userId?: string;
	error?: string;
	stack?: string;
	/** Set on ALERT lines only, so they can be filtered without relying on the level. */
	alertMarker?: 'CRITICAL_ALERT';
	metadata?: Record<string, unknown>;
}

class Logger {
	private format(level: LogLevel, payload: LogPayload) {
		return JSON.stringify({
			timestamp: new Date().toISOString(),
			service: 'evenue-app',
			environment: process.env.NODE_ENV || 'development',
			level,
			...payload
		});
	}

	info(message: string, payload: Omit<LogPayload, 'message'> = {}) {
		const formatted = this.format('INFO', { message, ...payload });
		console.log(formatted);
		return formatted;
	}

	warn(message: string, payload: Omit<LogPayload, 'message'> = {}) {
		const formatted = this.format('WARN', { message, ...payload });
		console.warn(formatted);
		return formatted;
	}

	error(message: string, payload: Omit<LogPayload, 'message'> = {}) {
		const formatted = this.format('ERROR', { message, ...payload });
		console.error(formatted);
		return formatted;
	}

	/**
	 * Critical alert: the line MUST stay parsable as JSON.
	 *
	 * Prefixing the output (e.g. `🚨 [CRITICAL_ALERT] {…}`) breaks Loki's `| json`
	 * stage, which silently disables every alert rule filtering on `level="ALERT"`.
	 * The marker therefore lives inside the payload, not in front of it.
	 */
	alert(message: string, payload: Omit<LogPayload, 'message'> = {}) {
		const formatted = this.format('ALERT', {
			message,
			alertMarker: 'CRITICAL_ALERT',
			...payload
		});
		console.error(formatted);
		return formatted;
	}
}

export const logger = new Logger();
