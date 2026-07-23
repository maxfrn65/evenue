import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		listing: {
			findUnique: vi.fn()
		},
		booking: {
			findFirst: vi.fn()
		}
	}
}));

import { prisma } from './db';
import {
	generateListingICal,
	parseICalEvents,
	isListingAvailable
} from './ical';

describe('iCal Sync & Double-Booking Prevention Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('generateListingICal', () => {
		it('should generate valid RFC 5545 iCalendar content with bookings', async () => {
			const mockListing = {
				id: 'villa-aix-01',
				title: "Villa d'Exception",
				city: 'Aix-en-Provence',
				bookings: [
					{
						id: 'booking-101',
						startDate: new Date('2026-08-15T00:00:00Z'),
						endDate: new Date('2026-08-17T00:00:00Z')
					}
				]
			};

			vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);

			const ical = await generateListingICal('villa-aix-01');

			expect(ical).toContain('BEGIN:VCALENDAR');
			expect(ical).toContain('VERSION:2.0');
			expect(ical).toContain('BEGIN:VEVENT');
			expect(ical).toContain('DTSTART;VALUE=DATE:20260815');
			expect(ical).toContain('DTEND;VALUE=DATE:20260817');
			expect(ical).toContain('END:VCALENDAR');
		});
	});

	describe('parseICalEvents', () => {
		it('should parse VEVENT blocks correctly from an .ics string', () => {
			const sampleICal = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:evt-1@airbnb.com
DTSTART;VALUE=DATE:20260901
DTEND;VALUE=DATE:20260905
SUMMARY:Airbnb Booking
END:VEVENT
END:VCALENDAR`;

			const events = parseICalEvents(sampleICal);
			expect(events).toHaveLength(1);
			expect(events[0].summary).toBe('Airbnb Booking');
			expect(events[0].startDate.getUTCFullYear()).toBe(2026);
			expect(events[0].startDate.getUTCMonth()).toBe(8); // Month index 8 = September
			expect(events[0].startDate.getUTCDate()).toBe(1);
		});
	});

	describe('isListingAvailable', () => {
		it('should return available true when no overlapping bookings exist', async () => {
			vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);
			vi.mocked(prisma.listing.findUnique).mockResolvedValue({ icalSyncUrl: null } as any);

			const result = await isListingAvailable(
				'villa-aix-01',
				new Date('2026-08-15'),
				new Date('2026-08-17')
			);

			expect(result.available).toBe(true);
		});

		it('should return available false when internal booking overlaps', async () => {
			vi.mocked(prisma.booking.findFirst).mockResolvedValue({
				id: 'booking-existing',
				startDate: new Date('2026-08-15'),
				endDate: new Date('2026-08-17')
			} as any);

			const result = await isListingAvailable(
				'villa-aix-01',
				new Date('2026-08-16'),
				new Date('2026-08-18')
			);

			expect(result.available).toBe(false);
			expect(result.reason).toContain('déjà réservé');
		});
	});
});
