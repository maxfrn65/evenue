<script lang="ts">
	import { onMount } from 'svelte';
	import CoverageBanner from '$lib/components/CoverageBanner.svelte';
	import { Search, MapPin, Users, ShieldCheck, Filter, Star, Sparkles, SlidersHorizontal } from 'lucide-svelte';

	let city = $state('');
	let minCapacity = $state<number | undefined>(undefined);
	let maxPrice = $state<number | undefined>(undefined);
	let eventType = $state('');

	let listings = $state<any[]>([
		{
			id: 'villa-aix-01',
			title: 'Villa d\'Exception avec Piscine & Sound System',
			city: 'Aix-en-Provence',
			pricePerNight: 850,
			maxCapacity: 40,
			eventTypeAllowed: ['SOIRÉE', 'ANNIVERSAIRE'],
			latitude: 43.5297,
			longitude: 5.4474,
			rating: 4.95,
			host: { firstName: 'Jean', kycStatus: 'VERIFIED' },
			imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: 'loft-paris-02',
			title: 'Loft Industriel & Rooftop Privatif',
			city: 'Paris',
			pricePerNight: 1200,
			maxCapacity: 60,
			eventTypeAllowed: ['COCKTAIL', 'SOIRÉE'],
			latitude: 48.8566,
			longitude: 2.3522,
			rating: 4.88,
			host: { firstName: 'Sophie', kycStatus: 'VERIFIED' },
			imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: 'domaine-lyon-03',
			title: 'Domaine de la Roseraie & Grange Aménagée',
			city: 'Lyon',
			pricePerNight: 950,
			maxCapacity: 80,
			eventTypeAllowed: ['MARIAGE', 'ANNIVERSAIRE'],
			latitude: 45.764,
			longitude: 4.8357,
			rating: 4.98,
			host: { firstName: 'Marc', kycStatus: 'VERIFIED' },
			imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
		}
	]);

	let loading = $state(false);

	async function fetchListings() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (city) params.set('city', city);
			if (minCapacity) params.set('minCapacity', minCapacity.toString());
			if (maxPrice) params.set('maxPrice', maxPrice.toString());
			if (eventType) params.set('eventType', eventType);

			const res = await fetch(`/api/listings?${params.toString()}`);
			const data = await res.json();
			if (data.success && data.listings.length > 0) {
				listings = data.listings;
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
	<!-- Title & Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
		<div>
			<h1 class="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
				Catalogue des lieux d'événements
				<span class="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-medium">
					{listings.length} lieux disponibles
				</span>
			</h1>
			<p class="text-sm text-slate-400 mt-1">
				Tous les logements autorisent les événements privés et sont couveurs par l'assurance Wakam.
			</p>
		</div>

		<a
			href="/listings/new"
			class="gradient-button text-xs font-semibold px-4 py-2.5 flex items-center gap-2 self-start md:self-auto"
		>
			<Sparkles class="w-4 h-4 text-amber-400" />
			Publier un lieu (Hôte)
		</a>
	</div>

	<!-- Filter Widget Bar -->
	<div class="glass-card p-4 rounded-2xl">
		<form onsubmit={(e) => { e.preventDefault(); fetchListings(); }} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
			<!-- City -->
			<div class="relative">
				<MapPin class="w-4 h-4 text-purple-400 absolute left-3 top-3" />
				<input
					type="text"
					bind:value={city}
					placeholder="Ville (Paris, Lyon...)"
					class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
				/>
			</div>

			<!-- Max Price -->
			<div class="relative">
				<SlidersHorizontal class="w-4 h-4 text-purple-400 absolute left-3 top-3" />
				<input
					type="number"
					bind:value={maxPrice}
					placeholder="Prix max / soirée (€)"
					class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
				/>
			</div>

			<!-- Min Capacity -->
			<div class="relative">
				<Users class="w-4 h-4 text-purple-400 absolute left-3 top-3" />
				<input
					type="number"
					bind:value={minCapacity}
					placeholder="Capacité min (invités)"
					class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
				/>
			</div>

			<!-- Event Type -->
			<div>
				<select
					bind:value={eventType}
					class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
				>
					<option value="">Tous événements</option>
					<option value="SOIRÉE">Soirée privée</option>
					<option value="ANNIVERSAIRE">Anniversaire</option>
					<option value="MARIAGE">Mariage / Réception</option>
					<option value="COCKTAIL">Cocktail professionnel</option>
				</select>
			</div>

			<!-- Filter Button -->
			<button
				type="submit"
				class="gradient-button text-xs py-2 px-4 flex items-center justify-center gap-2 font-semibold"
			>
				<Filter class="w-3.5 h-3.5" />
				Filtrer
			</button>
		</form>
	</div>

	<!-- Main Layout: Grid + Map Section -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Listings Grid (2 Cols) -->
		<div class="lg:col-span-2 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each listings as item}
					<div class="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between">
						<div>
							<div class="relative h-52 overflow-hidden">
								<img
									src={item.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
									alt={item.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
								<div class="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-semibold text-purple-300 flex items-center gap-1">
									<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
									Police Wakam Incluses
								</div>
								<div class="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 text-[11px] font-bold text-amber-400 flex items-center gap-1">
									<Star class="w-3 h-3 fill-amber-400" />
									{item.rating || 4.9}
								</div>
							</div>

							<div class="p-5 space-y-3">
								<div class="flex items-center justify-between text-xs text-slate-400">
									<span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5 text-purple-400" /> {item.city}</span>
									<span class="flex items-center gap-1"><Users class="w-3.5 h-3.5 text-indigo-400" /> Max {item.maxCapacity} convives</span>
								</div>

								<h3 class="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
									{item.title}
								</h3>
							</div>
						</div>

						<div class="p-5 pt-0 border-t border-white/5 flex items-center justify-between">
							<div>
								<span class="text-xl font-extrabold text-white">{item.pricePerNight} €</span>
								<span class="text-[10px] text-slate-400"> / soirée</span>
							</div>

							<a
								href={`/listings/${item.id}`}
								class="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors"
							>
								Voir détails
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Interactive Map Column (1 Col) -->
		<div class="lg:col-span-1">
			<div class="glass-card p-6 rounded-2xl sticky top-24 space-y-4 border border-purple-500/20">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-bold text-white flex items-center gap-2">
						<MapPin class="w-4 h-4 text-purple-400" />
						Carte Géolocalisée (Mapbox)
					</h3>
					<span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Live Sync</span>
				</div>

				<!-- Mock Interactive Map Container -->
				<div class="w-full h-80 rounded-xl bg-slate-900 border border-white/10 relative overflow-hidden flex items-center justify-center">
					<!-- Stylized SVG Map mockup -->
					<div class="absolute inset-0 opacity-40 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:16px_16px]"></div>
					
					<!-- Interactive Map Markers -->
					<div class="absolute top-1/3 left-1/4 p-2 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-lg border border-white/20 animate-bounce">
						850 €
					</div>
					<div class="absolute top-1/2 right-1/3 p-2 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-lg border border-white/20">
						1 200 €
					</div>
					<div class="absolute bottom-1/4 left-1/2 p-2 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-lg border border-white/20">
						950 €
					</div>

					<div class="relative z-10 text-center px-4">
						<p class="text-xs text-slate-300 font-semibold">Géo-filtrage actif Mapbox / OpenStreetMap</p>
						<p class="text-[10px] text-slate-400 mt-1">3 repères d'événements positionnés en France</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Coverage Banner Footer -->
	<CoverageBanner />
</div>
