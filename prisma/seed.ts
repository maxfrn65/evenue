import { prisma } from '../src/lib/server/db';
import { hashPassword } from '../src/lib/server/auth';

async function main() {
	console.log('🌱 Starting database seeding...');

	// Clear existing data in reverse order of dependencies
	await prisma.payout.deleteMany();
	await prisma.insurancePolicy.deleteMany();
	await prisma.booking.deleteMany();
	await prisma.listing.deleteMany();
	await prisma.user.deleteMany();

	console.log('🧹 Cleaned existing database tables.');

	// 1. Create Users
	const hostPasswordHash = hashPassword('HostPassword123!');
	const guestPasswordHash = hashPassword('GuestPassword123!');

	const host1 = await prisma.user.create({
		data: {
			id: 'host-jean-01',
			email: 'jean.dupont@evenue.fr',
			passwordHash: hostPasswordHash,
			firstName: 'Jean',
			lastName: 'Dupont',
			role: 'HOST',
			kycStatus: 'VERIFIED',
			stripeAccountId: 'acct_1MockStripeHost01'
		}
	});

	const host2 = await prisma.user.create({
		data: {
			id: 'host-sophie-02',
			email: 'sophie.martin@evenue.fr',
			passwordHash: hostPasswordHash,
			firstName: 'Sophie',
			lastName: 'Martin',
			role: 'HOST',
			kycStatus: 'VERIFIED',
			stripeAccountId: 'acct_1MockStripeHost02'
		}
	});

	const guest1 = await prisma.user.create({
		data: {
			id: 'guest-alex-01',
			email: 'alexandre.riviere@evenue.fr',
			passwordHash: guestPasswordHash,
			firstName: 'Alexandre',
			lastName: 'Rivière',
			role: 'GUEST',
			kycStatus: 'NOT_STARTED'
		}
	});

	console.log('👤 Created demo users (Hôtes & Invité).');

	// 2. Create Listings
	const listing1 = await prisma.listing.create({
		data: {
			id: 'villa-aix-01',
			hostId: host1.id,
			title: "Villa d'Exception avec Piscine & Sound System",
			description:
				"Superbe villa contemporaine située sur les hauteurs d'Aix-en-Provence. Idéale pour mariages intimate, cocktails professionnels et anniversaires de prestige. Équipée d'un système son haut de gamme et d'un grand espace extérieur avec piscine éclairée.",
			address: '450 Chemin du Tholonet',
			city: 'Aix-en-Provence',
			zipCode: '13100',
			latitude: 43.5297,
			longitude: 5.4474,
			pricePerNight: 850.0,
			securityDeposit: 600.0,
			maxCapacity: 40,
			eventTypeAllowed: ['SOIRÉE', 'ANNIVERSAIRE', 'COCKTAIL'],
			imageUrl:
				'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
			imageUrls: [
				'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
			]
		}
	});

	const listing2 = await prisma.listing.create({
		data: {
			id: 'loft-paris-02',
			hostId: host2.id,
			title: 'Loft Industriel & Rooftop Privatif',
			description:
				"Ancien atelier d'artiste réhabilité en loft ultra-moderne au cœur du 11ème arrondissement. Vue à 360° sur Paris depuis le rooftop privatif. Équipé pour les cocktails d'entreprise et les soirées privées haut de gamme.",
			address: '18 Rue de la Roquette',
			city: 'Paris',
			zipCode: '75011',
			latitude: 48.8566,
			longitude: 2.3522,
			pricePerNight: 1200.0,
			securityDeposit: 800.0,
			maxCapacity: 60,
			eventTypeAllowed: ['COCKTAIL', 'SOIRÉE', 'ANNIVERSAIRE'],
			imageUrl:
				'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
			imageUrls: [
				'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
			]
		}
	});

	const listing3 = await prisma.listing.create({
		data: {
			id: 'domaine-lyon-03',
			hostId: host1.id,
			title: 'Domaine de la Roseraie & Grange Aménagée',
			description:
				"Domaine d'exception au cœur des monts du Lyonnais. Une grange rénovée avec poutres apparentes et sonorisation intégrée, entourée d'un parc boisé d'un hectare. Parfait pour les mariages et grandes réceptions.",
			address: '12 Route des Monts',
			city: 'Lyon',
			zipCode: '69005',
			latitude: 45.764,
			longitude: 4.8357,
			pricePerNight: 950.0,
			securityDeposit: 750.0,
			maxCapacity: 80,
			eventTypeAllowed: ['MARIAGE', 'ANNIVERSAIRE', 'SOIRÉE'],
			imageUrl:
				'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
			imageUrls: [
				'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80'
			]
		}
	});

	const listing4 = await prisma.listing.create({
		data: {
			id: 'chateau-bordeaux-04',
			hostId: host2.id,
			title: 'Château Viticole & Orangerie Événementielle',
			description:
				"Prestigieux château bordelais du XVIIIe siècle au milieu des vignes. Orangerie chauffée et sonorisée pouvant accueillir jusqu'à 120 invités. Hébergement sur place pour 15 personnes.",
			address: '1 Château Saint-Émilion',
			city: 'Bordeaux',
			zipCode: '33000',
			latitude: 44.8378,
			longitude: -0.5792,
			pricePerNight: 1500.0,
			securityDeposit: 1000.0,
			maxCapacity: 120,
			eventTypeAllowed: ['MARIAGE', 'SOIRÉE', 'COCKTAIL'],
			imageUrl:
				'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
			imageUrls: [
				'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
				'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80'
			]
		}
	});

	const listing5 = await prisma.listing.create({
		data: {
			id: 'bastide-marseille-05',
			hostId: host1.id,
			title: 'Bastide Provençale & Terrasses Vue Mer',
			description:
				"Magnifique bastide nichée sur les calanques avec vue panoramique sur la Méditerranée. Terrasses en restanque, terrain de pétanque et sonorisation extérieure.",
			address: '88 Corniche Kennedy',
			city: 'Marseille',
			zipCode: '13007',
			latitude: 43.279,
			longitude: 5.3585,
			pricePerNight: 1100.0,
			securityDeposit: 700.0,
			maxCapacity: 50,
			eventTypeAllowed: ['SOIRÉE', 'COCKTAIL', 'ANNIVERSAIRE'],
			imageUrl:
				'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
		}
	});

	const listing6 = await prisma.listing.create({
		data: {
			id: 'penthouse-nice-06',
			hostId: host2.id,
			title: 'Penthouse Baie des Anges & Rooftop Panoramique',
			description:
				"Penthouse d'exception sur la Promenade des Anglais. Espace lounge intérieur et terrasse extérieure avec jacuzzi et vue sur la baie.",
			address: '120 Promenade des Anglais',
			city: 'Nice',
			zipCode: '06000',
			latitude: 43.695,
			longitude: 7.265,
			pricePerNight: 1350.0,
			securityDeposit: 900.0,
			maxCapacity: 45,
			eventTypeAllowed: ['COCKTAIL', 'SOIRÉE', 'ANNIVERSAIRE'],
			imageUrl:
				'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
		}
	});

	console.log('🏡 Created 6 unique demo listings (Aix, Paris, Lyon, Bordeaux, Marseille, Nice).');

	// 3. Create Sample Booking & Wakam Insurance Policy
	const booking1 = await prisma.booking.create({
		data: {
			id: 'booking-demo-01',
			listingId: listing1.id,
			guestId: guest1.id,
			startDate: new Date('2026-08-15T14:00:00Z'),
			endDate: new Date('2026-08-16T12:00:00Z'),
			totalPrice: 850.0,
			hostEarnings: 765.0,
			platformFee: 85.0,
			insuranceFee: 0.0,
			securityDepositAmount: 600.0,
			status: 'CONFIRMED',
			stripePaymentIntentId: 'pi_3MockStripePaymentIntent01'
		}
	});

	const insurance1 = await prisma.insurancePolicy.create({
		data: {
			id: 'policy-demo-01',
			bookingId: booking1.id,
			policyNumber: 'WAK-2026-89412',
			coverageAmount: 10000.0,
			status: 'ACTIVE'
		}
	});

	await prisma.payout.create({
		data: {
			id: 'payout-demo-01',
			bookingId: booking1.id,
			hostAmount: 765.0,
			platformAmount: 85.0,
			insurerAmount: 0.0,
			status: 'HELD_IN_ESCROW'
		}
	});

	console.log('📋 Created demo booking with active Wakam Insurance Policy & Escrow.');
	console.log('🎉 Database seeding completed successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Seeding failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
