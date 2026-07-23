/**
 * Server-side URL safety utilities — SSRF (OWASP A10:2021) mitigation.
 *
 * Any URL that Evenue fetches server-side (external iCal sync feeds configured
 * by hosts) must be validated BEFORE the request is made. Without this, a host
 * could point `icalSyncUrl` at internal infrastructure (localhost, the cloud
 * metadata endpoint 169.254.169.254, private RFC 1918 ranges…) and turn our
 * server into a proxy for internal reconnaissance.
 *
 * This module enforces:
 *   - a scheme allowlist (http / https only — no file:, gopher:, ftp:…)
 *   - a hostname/IP denylist covering loopback, link-local, private ranges,
 *     and the cloud metadata address.
 */

export interface UrlSafetyResult {
	safe: boolean;
	reason?: string;
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Blocked hostnames (exact match, lowercased).
 */
const BLOCKED_HOSTNAMES = new Set([
	'localhost',
	'localhost.localdomain',
	'ip6-localhost',
	'ip6-loopback',
	'metadata',
	'metadata.google.internal'
]);

/**
 * Return true if the given IPv4 address string belongs to a private,
 * loopback, link-local, or otherwise non-public range.
 */
function isPrivateIPv4(host: string): boolean {
	const parts = host.split('.');
	if (parts.length !== 4) return false;

	const octets = parts.map((p) => Number(p));
	if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;

	const [a, b] = octets;

	// 0.0.0.0/8 "this host"
	if (a === 0) return true;
	// 10.0.0.0/8 private
	if (a === 10) return true;
	// 127.0.0.0/8 loopback
	if (a === 127) return true;
	// 169.254.0.0/16 link-local (incl. 169.254.169.254 cloud metadata)
	if (a === 169 && b === 254) return true;
	// 172.16.0.0/12 private
	if (a === 172 && b >= 16 && b <= 31) return true;
	// 192.168.0.0/16 private
	if (a === 192 && b === 168) return true;
	// 100.64.0.0/10 carrier-grade NAT
	if (a === 100 && b >= 64 && b <= 127) return true;

	return false;
}

/**
 * Return true if the given host is an IPv6 loopback / link-local / unique-local
 * address, or an IPv4-mapped IPv6 address wrapping a private IPv4.
 */
function isPrivateIPv6(host: string): boolean {
	// URL hostnames keep IPv6 in brackets; normalise.
	let h = host.toLowerCase();
	if (h.startsWith('[') && h.endsWith(']')) h = h.slice(1, -1);

	if (h === '::1' || h === '::') return true; // loopback / unspecified
	if (h.startsWith('fe80')) return true; // link-local
	if (h.startsWith('fc') || h.startsWith('fd')) return true; // unique-local fc00::/7

	// IPv4-mapped IPv6 in dotted form, e.g. ::ffff:169.254.169.254
	const mappedDotted = h.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
	if (mappedDotted) return isPrivateIPv4(mappedDotted[1]);

	// IPv4-mapped IPv6 in hex form (URL parsers normalise to this),
	// e.g. ::ffff:a9fe:a9fe  ->  169.254.169.254
	const mappedHex = h.match(/::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
	if (mappedHex) {
		const hi = parseInt(mappedHex[1], 16);
		const lo = parseInt(mappedHex[2], 16);
		const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
		return isPrivateIPv4(ipv4);
	}

	return false;
}

/**
 * Validate that a URL is safe to fetch from the server (SSRF guard).
 *
 * @returns `{ safe: true }` when the URL uses http(s) and resolves to a public
 *          host; otherwise `{ safe: false, reason }` with a human-readable cause.
 */
export function isSafeExternalUrl(rawUrl: string | null | undefined): UrlSafetyResult {
	if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
		return { safe: false, reason: 'URL vide.' };
	}

	let parsed: URL;
	try {
		parsed = new URL(rawUrl.trim());
	} catch {
		return { safe: false, reason: 'URL malformée.' };
	}

	if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
		return {
			safe: false,
			reason: `Protocole non autorisé (${parsed.protocol}). Seuls http et https sont acceptés.`
		};
	}

	// Reject embedded credentials (user:pass@host) — a common SSRF/obfuscation vector.
	if (parsed.username || parsed.password) {
		return { safe: false, reason: "L'URL ne doit pas contenir d'identifiants." };
	}

	const hostname = parsed.hostname.toLowerCase();

	if (BLOCKED_HOSTNAMES.has(hostname)) {
		return { safe: false, reason: 'Hôte interne interdit.' };
	}

	// *.localhost and *.local resolve locally on many systems.
	if (hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
		return { safe: false, reason: 'Domaine local interdit.' };
	}

	if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
		return { safe: false, reason: 'Adresse IP privée ou de bouclage interdite.' };
	}

	return { safe: true };
}

/**
 * Assert a URL is safe, throwing a user-facing error otherwise.
 * Use at the input boundary (listing create/update) to reject unsafe feeds early.
 */
export function assertSafeExternalUrl(rawUrl: string): void {
	const result = isSafeExternalUrl(rawUrl);
	if (!result.safe) {
		throw new Error(`URL de synchronisation iCal refusée : ${result.reason}`);
	}
}
