import { prisma } from './db';
import { isSafeExternalUrl } from './url-safety';

export interface ICalEvent {
	startDate: Date;
	endDate: Date;
	summary?: string;
}

export interface AvailabilityResult {
	available: boolean;
	reason?: string;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) content for a listing's confirmed bookings.
 */
export async function generateListingICal(listingId: string): Promise<string> {
	const listing = await prisma.listing.findUnique({
		where: { id: listingId },
		include: {
			bookings: {
				where: {
					status: { in: ['CONFIRMED', 'COMPLETED', 'DISPUTED'] }
				}
			}
		}
	});

	if (!listing) {
		throw new Error('Annonce introuvable.');
	}

	const formatICalDate = (date: Date): string => {
		const d = new Date(date);
		const year = d.getUTCFullYear();
		const month = String(d.getUTCMonth() + 1).padStart(2, '0');
		const day = String(d.getUTCDate()).padStart(2, '0');
		return `${year}${month}${day}`;
	};

	const formatTimestamp = (date: Date): string => {
		return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
	};

	let ical = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Evenue Inc//NONSGML Event Platform//FR',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:Evenue - ${listing.title.replace(/[\r\n]/g, ' ')}`
	];

	for (const booking of listing.bookings) {
		ical.push(
			'BEGIN:VEVENT',
			`UID:${booking.id}@evenue.fr`,
			`DTSTAMP:${formatTimestamp(new Date())}`,
			`DTSTART;VALUE=DATE:${formatICalDate(booking.startDate)}`,
			`DTEND;VALUE=DATE:${formatICalDate(booking.endDate)}`,
			`SUMMARY:Réservation Evenue (${listing.city})`,
			'DESCRIPTION:Réservation sécurisée avec séquestre Stripe et assurance Wakam.',
			'STATUS:CONFIRMED',
			'END:VEVENT'
		);
	}

	ical.push('END:VCALENDAR');
	return ical.join('\r\n');
}

/**
 * Parse an iCalendar (.ics) string content into a list of events with start & end dates.
 */
export function parseICalEvents(icalContent: string): ICalEvent[] {
	const events: ICalEvent[] = [];
	const veventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/gi;
	const matches = icalContent.match(veventRegex) || [];

	const parseDateStr = (dateStr: string): Date | null => {
		const cleaned = dateStr.replace(/[^0-9T]/g, '');
		if (cleaned.length >= 8) {
			const year = parseInt(cleaned.substring(0, 4), 10);
			const month = parseInt(cleaned.substring(4, 6), 10) - 1;
			const day = parseInt(cleaned.substring(6, 8), 10);
			return new Date(Date.UTC(year, month, day));
		}
		return null;
	};

	for (const block of matches) {
		let startDate: Date | null = null;
		let endDate: Date | null = null;
		let summary: string | undefined;

		const lines = block.split(/\r?\n/);
		for (const line of lines) {
			if (line.startsWith('DTSTART')) {
				const parts = line.split(':');
				if (parts.length > 1) startDate = parseDateStr(parts[1]);
			} else if (line.startsWith('DTEND')) {
				const parts = line.split(':');
				if (parts.length > 1) endDate = parseDateStr(parts[1]);
			} else if (line.startsWith('SUMMARY')) {
				const parts = line.split(':');
				if (parts.length > 1) summary = parts.slice(1).join(':').trim();
			}
		}

		if (startDate) {
			// Default end date to start date + 1 day if DTEND is missing
			if (!endDate) {
				endDate = new Date(startDate);
				endDate.setUTCDate(endDate.getUTCDate() + 1);
			}
			events.push({ startDate, endDate, summary });
		}
	}

	return events;
}

/**
 * Fetch and parse external iCal stream with graceful 3-second timeout fallback.
 */
export async function fetchAndParseExternalICal(url: string): Promise<ICalEvent[]> {
	// SSRF guard (OWASP A10): never fetch a host-supplied URL without validating
	// it points to a public http(s) endpoint. Defense-in-depth — the same check
	// runs at the listing input boundary.
	if (!isSafeExternalUrl(url).safe) {
		return [];
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(url, {
			signal: controller.signal,
			headers: { 'User-Agent': 'Evenue-iCal-Sync/1.0' }
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return [];
		}

		const content = await response.text();
		return parseICalEvents(content);
	} catch (error) {
		// Graceful fallback on network error or timeout
		return [];
	}
}

/**
 * Check if a listing is available for a given period (startDate -> endDate).
 * Checks both internal Prisma database bookings and external imported iCal calendars.
 */
export async function isListingAvailable(
	listingId: string,
	startDate: Date,
	endDate: Date
): Promise<AvailabilityResult> {
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
		return { available: false, reason: 'Les dates fournies sont invalides.' };
	}

	// 1. Check internal database bookings
	const existingBooking = await prisma.booking.findFirst({
		where: {
			listingId,
			status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'DISPUTED'] },
			startDate: { lt: end },
			endDate: { gt: start }
		}
	});

	if (existingBooking) {
		return {
			available: false,
			reason: 'Le logement est déjà réservé sur ces dates par un autre invité.'
		};
	}

	// 2. Check external iCal sync if configured
	const listing = await prisma.listing.findUnique({
		where: { id: listingId },
		select: { icalSyncUrl: true }
	});

	if (listing?.icalSyncUrl) {
		const externalEvents = await fetchAndParseExternalICal(listing.icalSyncUrl);

		for (const evt of externalEvents) {
			if (evt.startDate < end && evt.endDate > start) {
				return {
					available: false,
					reason: `Le logement est indisponible sur cette période (${evt.summary || 'Réservation externe iCal'}).`
				};
			}
		}
	}

	return { available: true };
}
