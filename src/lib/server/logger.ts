export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'ALERT';

export interface LogPayload {
	message: string;
	context?: string;
	path?: string;
	statusCode?: number;
	durationMs?: number;
	userId?: string;
	error?: string;
	stack?: string;
	metadata?: Record<string, any>;
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

	alert(message: string, payload: Omit<LogPayload, 'message'> = {}) {
		const formatted = this.format('ALERT', { message, ...payload });
		console.error(`🚨 [CRITICAL_ALERT] ${formatted}`);
		return formatted;
	}
}

export const logger = new Logger();
