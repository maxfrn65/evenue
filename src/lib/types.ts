/**
 * Shapes shared between the server modules and the components that render them.
 *
 * Kept out of `$lib/server` so client code can import them without pulling a
 * server-only module into the browser bundle.
 */

/** One window during which a host accepts bookings, as stored on `Listing.availabilityRanges`. */
export interface AvailabilityRange {
	startDate: string;
	endDate: string;
}

/** Lifecycle of an insurance policy and of the claim opened against it. */
export type ClaimStatus = 'PENDING' | 'ACTIVE' | 'CLAIMED' | 'UNDER_REVIEW' | 'EXPIRED' | 'FAILED';

/** Result returned by the claim endpoint and rendered on the confirmation screen. */
export interface ClaimResult {
	claimId: string;
	claimNumber: string;
	bookingId: string;
	policyNumber: string;
	/** Mirrors the row actually stored, so the screen never shows a status the database does not hold. */
	status: ClaimStatus;
	estimatedCost: number;
	submittedAt: Date;
}

/**
 * An existing listing as `ListingForm` reads it when editing. Every field is optional:
 * the form falls back to its own defaults for anything the record does not carry.
 */
export interface ListingFormSource {
	title?: string;
	description?: string;
	address?: string;
	city?: string;
	zipCode?: string;
	pricePerNight?: number;
	securityDeposit?: number;
	maxCapacity?: number;
	imageUrl?: string | null;
	imageUrls?: string[];
	eventTypeAllowed?: string[];
	icalSyncUrl?: string | null;
	availableStartDate?: Date | string | null;
	availableEndDate?: Date | string | null;
	availabilityRanges?: AvailabilityRange[] | unknown;
}
