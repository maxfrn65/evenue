import type { PageServerLoad } from './$types';
import { getListingById } from '$lib/server/listings';

const sampleDetails: Record<string, any> = {
	'villa-aix-01': {
		id: 'villa-aix-01',
		title: 'Villa d\'Exception avec Piscine & Sound System',
		description: 'Magnifique villa contemporaine de 350 m² située sur les hauteurs d\'Aix-en-Provence. Équipée spécialement pour accueillir des soirées privées, anniversaires et cocktails d\'entreprise jusqu\'à 40 convives dans un cadre sécurisé et assuré.',
		city: 'Aix-en-Provence',
		address: 'Domaine des Pins, 13100 Aix-en-Provence',
		pricePerNight: 850,
		securityDeposit: 500,
		maxCapacity: 40,
		eventTypeAllowed: ['Soirée Privée', 'Anniversaire', 'Cocktail'],
		amenities: [
			'Système Son Pro 2000W Bluetooth',
			'Jeux de lumières & Machine à fumée',
			'Piscine à débordement chauffée',
			'Grand espace traiteur aménagé',
			'Parking privé 15 véhicules'
		],
		host: { firstName: 'Jean-Marc', lastName: 'Dupont', kycStatus: 'VERIFIED', createdAt: 'Membre depuis 2025' },
		imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
	},
	'loft-paris-02': {
		id: 'loft-paris-02',
		title: 'Loft Industriel & Rooftop Privatif',
		description: 'Superbe loft d\'architecte de 280 m² au cœur du 11e arrondissement de Paris. Dispose d\'un rooftop sonorisé avec vue panoramique à 360°, idéal pour les cocktails d\'anniversaire et soirées privées jusqu\'à 60 convives.',
		city: 'Paris',
		address: 'Boulevard Voltaire, 75011 Paris',
		pricePerNight: 1200,
		securityDeposit: 800,
		maxCapacity: 60,
		eventTypeAllowed: ['Cocktail', 'Soirée Privée'],
		amenities: [
			'Rooftop privatif 120 m²',
			'Platines DJ Pioneer intégrées',
			'Bar professionnel équipé',
			'Insonorisation complète',
			'Accès handicapé & Ascenseur'
		],
		host: { firstName: 'Sophie', lastName: 'Lefebvre', kycStatus: 'VERIFIED', createdAt: 'Membre depuis 2024' },
		imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
	},
	'domaine-lyon-03': {
		id: 'domaine-lyon-03',
		title: 'Domaine de la Roseraie & Grange Aménagée',
		description: 'Domaine historique s\'étendant sur 3 hectares en périphérie de Lyon. Sa grange en pierre restaurée accueille mariages, grandes réunions de famille et soirées dansantes jusqu\'à 80 convives.',
		city: 'Lyon',
		address: 'Chemin de la Roseraie, 69000 Lyon',
		pricePerNight: 950,
		securityDeposit: 600,
		maxCapacity: 80,
		eventTypeAllowed: ['Mariage', 'Anniversaire', 'Réception'],
		amenities: [
			'Grange en pierre chauffée 200 m²',
			'Système son & projection HD',
			'Grand parc boisé illuminé',
			'Cuisine professionnelle inox',
			'Hébergement 12 couchages sur place'
		],
		host: { firstName: 'Marc', lastName: 'Bertrand', kycStatus: 'VERIFIED', createdAt: 'Membre depuis 2024' },
		imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
	},
	'chateau-bordeaux-04': {
		id: 'chateau-bordeaux-04',
		title: 'Château Viticole & Orangerie Événementielle',
		description: 'Château viticole du XIXe siècle entouré de vignes à Bordeaux. Orangerie baignée de lumière pour les réceptions de mariage et grandes soirées de prestige jusqu\'à 120 convives.',
		city: 'Bordeaux',
		address: 'Route des Châteaux, 33000 Bordeaux',
		pricePerNight: 1500,
		securityDeposit: 1000,
		maxCapacity: 120,
		eventTypeAllowed: ['Mariage', 'Gala', 'Soirée'],
		amenities: [
			'Orangerie 300 m² vitrée',
			'Dégustation de vins du domaine',
			'Système audio & éclairage scénique',
			'Parking 50 places',
			'Sécurité gardiennage nocturne'
		],
		host: { firstName: 'Claire', lastName: 'de Saint-Germain', kycStatus: 'VERIFIED', createdAt: 'Membre depuis 2023' },
		imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
	}
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();
	const dbListing = await getListingById(params.id);

	if (dbListing) {
		return { listing: dbListing, user };
	}

	const fallback = sampleDetails[params.id] || sampleDetails['villa-aix-01'];
	return { listing: fallback, user };
};
