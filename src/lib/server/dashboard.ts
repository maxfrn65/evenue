import { prisma } from './db';

export interface DashboardData {
	bookings: DashboardBooking[];
	listings: DashboardListing[];
	stats: DashboardStats;
}

export interface DashboardBooking {
	id: string;
	startDate: Date;
	endDate: Date;
	totalPrice: number;
	status: string;
	listing: {
		id: string;
		title: string;
		city: string;
	};
	insurancePolicy: {
		policyNumber: string;
		status: string;
	} | null;
}

export interface DashboardListing {
	id: string;
	title: string;
	city: string;
	pricePerNight: number;
	maxCapacity: number;
	createdAt: Date;
	_count: {
		bookings: number;
	};
	totalRevenue: number;
}

export interface DashboardStats {
	totalBookings: number;
	upcomingBookings: number;
	totalSpent: number;
	totalListings: number;
	totalEarnings: number;
}

/**
 * Get dashboard data for the connected user.
 * Includes their bookings (as guest) and their listings (as host).
 */
export async function getDashboardData(userId: string, userRole: string): Promise<DashboardData> {
	const now = new Date();

	// Fetch user bookings (as guest)
	const bookings = await prisma.booking.findMany({
		where: { guestId: userId },
		include: {
			listing: {
				select: {
					id: true,
					title: true,
					city: true
				}
			},
			insurancePolicy: {
				select: {
					policyNumber: true,
					status: true
				}
			}
		},
		orderBy: { startDate: 'desc' }
	});

	// Fetch host listings (only if user is HOST)
	let listings: DashboardListing[] = [];
	if (userRole === 'HOST') {
		const rawListings = await prisma.listing.findMany({
			where: { hostId: userId },
			include: {
				_count: {
					select: { bookings: true }
				},
				bookings: {
					where: { status: 'CONFIRMED' },
					select: { hostEarnings: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		listings = rawListings.map((l: typeof rawListings[number]) => ({
			id: l.id,
			title: l.title,
			city: l.city,
			pricePerNight: l.pricePerNight,
			maxCapacity: l.maxCapacity,
			createdAt: l.createdAt,
			_count: l._count,
			totalRevenue: l.bookings.reduce((sum: number, b: { hostEarnings: number }) => sum + b.hostEarnings, 0)
		}));
	}

	// Compute stats
	const upcomingBookings = bookings.filter((b: typeof bookings[number]) => new Date(b.startDate) >= now).length;
	const totalSpent = bookings
		.filter((b: typeof bookings[number]) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
		.reduce((sum: number, b: typeof bookings[number]) => sum + b.totalPrice, 0);
	const totalEarnings = listings.reduce((sum: number, l: DashboardListing) => sum + l.totalRevenue, 0);

	return {
		bookings,
		listings,
		stats: {
			totalBookings: bookings.length,
			upcomingBookings,
			totalSpent: Math.round(totalSpent * 100) / 100,
			totalListings: listings.length,
			totalEarnings: Math.round(totalEarnings * 100) / 100
		}
	};
}

/**
 * Cancel a booking (set status to CANCELLED).
 * Only the guest who made the booking can cancel.
 */
export async function cancelBooking(bookingId: string, userId: string): Promise<boolean> {
	const booking = await prisma.booking.findFirst({
		where: {
			id: bookingId,
			guestId: userId,
			status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
		}
	});

	if (!booking) {
		return false;
	}

	await prisma.booking.update({
		where: { id: bookingId },
		data: { status: 'CANCELLED' }
	});

	return true;
}
