import { prisma } from './db';
import { issueWakamInsurancePolicy } from './wakam';
import { createBookingPaymentIntent } from './stripe';
import { isListingAvailable } from './ical';

export interface CreateBookingInput {
	listingId: string;
	guestId: string;
	startDate: string;
	endDate: string;
	guestCount: number;
}

export async function createBooking(input: CreateBookingInput) {
	const start = new Date(input.startDate);
	const end = new Date(input.endDate);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		throw new Error('Dates de réservation invalides.');
	}

	if (start >= end) {
		throw new Error('La date de début doit être strictement antérieure à la date de fin.');
	}

	// 1. Fetch listing details & host info
	const listing = await prisma.listing.findUnique({
		where: { id: input.listingId },
		include: { host: true }
	});

	if (!listing) {
		throw new Error('Logement non trouvé.');
	}

	if (input.guestCount > listing.maxCapacity) {
		throw new Error(`Le nombre d'invités (${input.guestCount}) dépasse la capacité maximale du lieu (${listing.maxCapacity}).`);
	}

	// 2. Check overlap with internal bookings and external iCal calendars
	const availability = await isListingAvailable(input.listingId, start, end);
	if (!availability.available) {
		throw new Error(availability.reason || 'Le logement est indisponible sur ces dates.');
	}

	// Calculate breakdown
	const nightsCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
	const totalPrice = listing.pricePerNight * nightsCount;
	const platformFee = Math.round(totalPrice * 0.1 * 100) / 100;
	const hostEarnings = totalPrice - platformFee;

	// 3. Initiate Stripe Connect Escrow PaymentIntent
	const stripeEscrow = await createBookingPaymentIntent(
		totalPrice,
		listing.securityDeposit,
		listing.host.stripeAccountId || undefined
	);

	// 4. Create Booking in database
	const booking = await prisma.booking.create({
		data: {
			listingId: input.listingId,
			guestId: input.guestId,
			startDate: start,
			endDate: end,
			totalPrice,
			hostEarnings,
			platformFee,
			insuranceFee: 0,
			securityDepositAmount: listing.securityDeposit,
			status: 'CONFIRMED',
			stripePaymentIntentId: stripeEscrow.paymentIntentId
		}
	});

	// 5. Generate Wakam Insurance Policy protected by Circuit Breaker
	const insurance = await issueWakamInsurancePolicy(
		booking.id,
		listing.title,
		totalPrice,
		input.guestCount
	);

	const policy = await prisma.insurancePolicy.create({
		data: {
			bookingId: booking.id,
			policyNumber: insurance.policyNumber,
			coverageAmount: insurance.coverageAmount,
			status: insurance.status === 'ISSUED' ? 'ACTIVE' : 'PENDING'
		}
	});

	return {
		booking,
		insurancePolicy: policy,
		stripeClientSecret: stripeEscrow.clientSecret
	};
}

export async function getUserBookings(userId: string) {
	return await prisma.booking.findMany({
		where: {
			OR: [
				{ guestId: userId },
				{ listing: { hostId: userId } }
			]
		},
		include: {
			listing: true,
			insurancePolicy: true
		},
		orderBy: { createdAt: 'desc' }
	});
}
