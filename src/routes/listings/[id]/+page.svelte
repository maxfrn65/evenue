<script lang="ts">
	import CoverageBanner from '$lib/components/CoverageBanner.svelte';
	import { MapPin, Users, ShieldCheck, Star, Calendar, Music, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-svelte';

	let { data }: { data?: any } = $props();

	const listing = {
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
			'Parking privé 15 véhicules',
			'Insonorisation acoustique'
		],
		host: {
			firstName: 'Jean-Marc',
			lastName: 'Dupont',
			kycStatus: 'VERIFIED',
			createdAt: 'Membre depuis 2025'
		},
		imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
	};
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
	<!-- Top Navigation Header -->
	<div class="flex items-center justify-between">
		<a href="/listings" class="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1">
			← Retour au catalogue
		</a>
		<div class="flex items-center gap-2">
			<span class="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-medium flex items-center gap-1">
				<ShieldCheck class="w-3.5 h-3.5" />
				Identité Hôte Vérifiée par Stripe Connect
			</span>
		</div>
	</div>

	<!-- Main Image & Title Section -->
	<div class="space-y-4">
		<h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
			{listing.title}
		</h1>
		<div class="flex flex-wrap items-center gap-4 text-xs text-slate-400">
			<span class="flex items-center gap-1"><MapPin class="w-4 h-4 text-purple-400" /> {listing.address}</span>
			<span class="flex items-center gap-1"><Users class="w-4 h-4 text-indigo-400" /> Capacité max: {listing.maxCapacity} personnes</span>
			<span class="flex items-center gap-1 text-amber-400 font-bold"><Star class="w-4 h-4 fill-amber-400" /> 4.95 (28 avis)</span>
		</div>

		<div class="h-96 rounded-2xl overflow-hidden relative glass-card border border-white/10">
			<img src={listing.imageUrl} alt={listing.title} class="w-full h-full object-cover" />
			<div class="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white flex items-center gap-2">
				<Sparkles class="w-4 h-4 text-amber-400" />
				Lieu pré-équipé pour la musique et les événements
			</div>
		</div>
	</div>

	<!-- Content Grid: Details vs Booking Widget -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
		<!-- Left: Description, Host, Amenities -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Host Info Card -->
			<div class="glass-card p-6 rounded-2xl flex items-center justify-between border border-purple-500/20">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-lg font-bold text-white">
						{listing.host.firstName[0]}
					</div>
					<div>
						<h3 class="text-base font-bold text-white flex items-center gap-2">
							Hôte : {listing.host.firstName} {listing.host.lastName[0]}.
							<ShieldCheck class="w-4 h-4 text-emerald-400" />
						</h3>
						<p class="text-xs text-slate-400">{listing.host.createdAt} • KYC Vérifié via Stripe</p>
					</div>
				</div>
				<span class="text-xs text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-500/30 font-medium">
					Réponse rapide (&lt; 1h)
				</span>
			</div>

			<!-- Description -->
			<div class="glass-card p-6 rounded-2xl space-y-3">
				<h3 class="text-lg font-bold text-white">À propos de ce logement</h3>
				<p class="text-sm text-slate-300 leading-relaxed">
					{listing.description}
				</p>
			</div>

			<!-- Equipment & Sound System -->
			<div class="glass-card p-6 rounded-2xl space-y-4">
				<h3 class="text-lg font-bold text-white flex items-center gap-2">
					<Music class="w-5 h-5 text-purple-400" />
					Équipements Événementiels & Sonorisation
				</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each listing.amenities as item}
						<div class="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/5">
							<CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
							<span>{item}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Wakam Insurance Banner -->
			<CoverageBanner />
		</div>

		<!-- Right: Booking Calculation Widget -->
		<div class="lg:col-span-1">
			<div class="glass-card p-6 rounded-2xl sticky top-24 space-y-6 border border-purple-500/30 shadow-2xl">
				<div class="flex items-center justify-between border-b border-white/10 pb-4">
					<div>
						<span class="text-3xl font-extrabold text-white">{listing.pricePerNight} €</span>
						<span class="text-xs text-slate-400"> / soirée</span>
					</div>
					<span class="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
						Assurance Wakam Incluses
					</span>
				</div>

				<div class="space-y-3 text-xs text-slate-300">
					<div class="flex justify-between py-1">
						<span>Location du lieu (1 soirée)</span>
						<span class="font-semibold text-white">{listing.pricePerNight} €</span>
					</div>
					<div class="flex justify-between py-1 text-emerald-400">
						<span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5" /> Police d'Assurance Wakam</span>
						<span class="font-semibold">Offerte (0 €)</span>
					</div>
					<div class="flex justify-between py-1 text-indigo-300">
						<span class="flex items-center gap-1"><Lock class="w-3.5 h-3.5" /> Caution Séquestrée (Stripe)</span>
						<span class="font-semibold">{listing.securityDeposit} €</span>
					</div>
				</div>

				<div class="border-t border-white/10 pt-4 flex justify-between items-center text-sm font-bold text-white">
					<span>Total à régler</span>
					<span class="text-xl text-purple-400">{listing.pricePerNight} €</span>
				</div>

				<a
					href={`/bookings/new?listingId=${listing.id}`}
					class="gradient-button w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold"
				>
					Réserver avec Assurance Wakam
					<ArrowRight class="w-4 h-4" />
				</a>

				<p class="text-[10px] text-center text-slate-500">
					Séquestre sécurisé via Stripe Connect. Les fonds et la caution sont débloqués uniquement après la soirée sans sinistre.
				</p>
			</div>
		</div>
	</div>
</div>
