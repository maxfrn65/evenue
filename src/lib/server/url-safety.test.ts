import { describe, it, expect } from 'vitest';
import { isSafeExternalUrl, assertSafeExternalUrl } from './url-safety';

describe('isSafeExternalUrl — SSRF guard (OWASP A10)', () => {
	it('accepts a normal public https URL', () => {
		expect(isSafeExternalUrl('https://calendar.google.com/feed.ics').safe).toBe(true);
	});

	it('accepts a normal public http URL', () => {
		expect(isSafeExternalUrl('http://example.com/cal.ics').safe).toBe(true);
	});

	it('rejects empty or missing input', () => {
		expect(isSafeExternalUrl('').safe).toBe(false);
		expect(isSafeExternalUrl(null).safe).toBe(false);
		expect(isSafeExternalUrl(undefined).safe).toBe(false);
	});

	it('rejects malformed URLs', () => {
		expect(isSafeExternalUrl('not a url').safe).toBe(false);
		expect(isSafeExternalUrl('://missing-scheme').safe).toBe(false);
	});

	it('rejects non-http(s) schemes', () => {
		expect(isSafeExternalUrl('file:///etc/passwd').safe).toBe(false);
		expect(isSafeExternalUrl('ftp://example.com/x').safe).toBe(false);
		expect(isSafeExternalUrl('gopher://example.com').safe).toBe(false);
	});

	it('rejects localhost and loopback hosts', () => {
		expect(isSafeExternalUrl('http://localhost/cal.ics').safe).toBe(false);
		expect(isSafeExternalUrl('http://127.0.0.1:8080/cal.ics').safe).toBe(false);
		expect(isSafeExternalUrl('http://[::1]/cal.ics').safe).toBe(false);
		expect(isSafeExternalUrl('http://api.localhost/cal.ics').safe).toBe(false);
	});

	it('rejects the cloud metadata endpoint (169.254.169.254)', () => {
		expect(isSafeExternalUrl('http://169.254.169.254/latest/meta-data/').safe).toBe(false);
	});

	it('rejects RFC 1918 private ranges', () => {
		expect(isSafeExternalUrl('http://10.0.0.5/cal.ics').safe).toBe(false);
		expect(isSafeExternalUrl('http://172.16.4.4/cal.ics').safe).toBe(false);
		expect(isSafeExternalUrl('http://192.168.1.10/cal.ics').safe).toBe(false);
	});

	it('rejects URLs carrying embedded credentials', () => {
		expect(isSafeExternalUrl('https://user:pass@example.com/cal.ics').safe).toBe(false);
	});

	it('rejects IPv4-mapped IPv6 pointing at a private host', () => {
		expect(isSafeExternalUrl('http://[::ffff:169.254.169.254]/x').safe).toBe(false);
	});

	it('assertSafeExternalUrl throws on unsafe URLs and is silent on safe ones', () => {
		expect(() => assertSafeExternalUrl('http://localhost/x')).toThrow();
		expect(() => assertSafeExternalUrl('https://example.com/cal.ics')).not.toThrow();
	});
});
