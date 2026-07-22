<script lang="ts">
	import { page } from '$app/state';
	import InteractiveMap from '$lib/components/InteractiveMap.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Select from '$lib/components/ui/select/select.svelte';
	import {
		Search,
		MapPin,
		Users,
		ShieldCheck,
		Filter,
		Star,
		Sparkles,
		SlidersHorizontal
	} from 'lucide-svelte';

	let city = $state(page.url.searchParams.get('city') || '');
	let minCapacity = $state<number | undefined>(
		page.url.searchParams.get('minCapacity')
			? Number(page.url.searchParams.get('minCapacity'))
			: undefined
	);
	let maxPrice = $state<number | undefined>(
		page.url.searchParams.get('maxPrice')
			? Number(page.url.searchParams.get('maxPrice'))
			: undefined
	);
	let eventType = $state(page.url.searchParams.get('eventType') || '');

	let listings = $state<any[]>([
		{
			id: 'villa-aix-01',
			title: "Villa d'Exception avec Piscine & Sound System",
			city: 'Aix-en-Provence',
			pricePerNight: 850,
			maxCapacity: 40,
			eventTypeAllowed: ['SOIRÉE', 'ANNIVERSAIRE'],
			latitude: 43.5297,
			longitude: 5.4474,
			rating: 4.95,
			host: { firstName: 'Jean', kycStatus: 'VERIFIED' },
			imageUrl:
				'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
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
			imageUrl:
				'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
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
			imageUrl:
				'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: 'chateau-bordeaux-04',
			title: 'Château Viticole & Orangerie Événementielle',
			city: 'Bordeaux',
			pricePerNight: 1500,
			maxCapacity: 120,
			eventTypeAllowed: ['MARIAGE', 'SOIRÉE'],
			latitude: 44.8378,
			longitude: -0.5792,
			rating: 4.99,
			host: { firstName: 'Claire', kycStatus: 'VERIFIED' },
			imageUrl:
				'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
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

	$effect(() => {
		fetchListings();
	});
</script>

<datalist id="cities-list">
	<option value="Paris"></option>
	<option value="Lyon"></option>
	<option value="Marseille"></option>
	<option value="Aix-en-Provence"></option>
	<option value="Bordeaux"></option>
	<option value="Toulouse"></option>
	<option value="Lille"></option>
	<option value="Nice"></option>
</datalist>

<div class="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
	<!-- Header -->
	<div
		class="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center"
	>
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white">
				Catalogue des lieux d'événements
				<Badge variant="purple" class="px-3 py-1">
					{listings.length} lieux disponibles
				</Badge>
			</h1>
			<p class="mt-1 text-sm text-slate-400">
				Trouvez le lieu idéal adapté à la capacité et au type de votre soirée.
			</p>
		</div>

		<Button href="/listings/new" variant="gradient" size="sm" class="gap-2">
			<Sparkles class="h-4 w-4 text-amber-400" />
			Publier un lieu (Hôte)
		</Button>
	</div>

	<!-- Filter Widget Bar with Explicit Labels -->
	<Card class="p-4 md:p-6">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				fetchListings();
			}}
			class="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5"
		>
			<!-- City -->
			<div>
				<Label for="filter-city">Ville</Label>
				<div class="relative">
					<MapPin class="absolute top-3 left-3 z-10 h-4 w-4 text-purple-400" />
					<Input
						id="filter-city"
						list="cities-list"
						bind:value={city}
						placeholder="Ex: Paris, Aix..."
						class="pl-9"
					/>
				</div>
			</div>

			<!-- Max Price -->
			<div>
				<Label for="filter-max-price">Prix max / soirée (€)</Label>
				<div class="relative">
					<SlidersHorizontal class="absolute top-3 left-3 z-10 h-4 w-4 text-purple-400" />
					<Input
						id="filter-max-price"
						type="number"
						min="0"
						step="50"
						bind:value={maxPrice}
						placeholder="Ex: 1000 €"
						class="pl-9"
					/>
				</div>
			</div>

			<!-- Min Capacity -->
			<div>
				<Label for="filter-capacity">Capacité min (invités)</Label>
				<div class="relative">
					<Users class="absolute top-3 left-3 z-10 h-4 w-4 text-purple-400" />
					<Input
						id="filter-capacity"
						type="number"
						min="1"
						step="1"
						bind:value={minCapacity}
						placeholder="Ex: 30 convives"
						class="pl-9"
					/>
				</div>
			</div>

			<!-- Event Type -->
			<div>
				<Label for="filter-event-type">Type d'événement</Label>
				<Select id="filter-event-type" bind:value={eventType}>
					<option value="">Tous événements</option>
					<option value="SOIRÉE">Soirée privée</option>
					<option value="ANNIVERSAIRE">Anniversaire</option>
					<option value="MARIAGE">Mariage / Réception</option>
					<option value="COCKTAIL">Cocktail professionnel</option>
				</Select>
			</div>

			<!-- Submit Button Component -->
			<Button type="submit" variant="gradient" class="h-10 w-full gap-2">
				<Filter class="h-4 w-4" />
				Filtrer
			</Button>
		</form>
	</Card>

	<!-- Main Layout: Grid + Map Section -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Listings Grid (2 Cols) -->
		<div class="space-y-6 lg:col-span-2">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each listings as item (item.id)}
					<Card class="group flex flex-col justify-between">
						<div>
							<div class="relative h-52 overflow-hidden">
								<img
									src={item.imageUrl ||
										'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
									alt={item.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
								<div class="absolute top-3 left-3">
									<Badge variant="emerald" class="gap-1 backdrop-blur-md">
										<ShieldCheck class="h-3.5 w-3.5" />
										Assurance Incluses
									</Badge>
								</div>
								<div class="absolute top-3 right-3">
									<Badge variant="amber" class="gap-1 font-bold backdrop-blur-md">
										<Star class="h-3 w-3 fill-amber-400" />
										{item.rating || 4.9}
									</Badge>
								</div>
							</div>

							<div class="space-y-3 p-5">
								<div class="flex items-center justify-between text-xs text-slate-400">
									<span class="flex items-center gap-1"
										><MapPin class="h-3.5 w-3.5 text-purple-400" /> {item.city}</span
									>
									<span class="flex items-center gap-1"
										><Users class="h-3.5 w-3.5 text-indigo-400" /> Max {item.maxCapacity} convives</span
									>
								</div>

								<h3
									class="line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-purple-300"
								>
									{item.title}
								</h3>
							</div>
						</div>

						<div class="flex items-center justify-between border-t border-white/5 p-5 pt-0">
							<div>
								<span class="text-xl font-extrabold text-white">{item.pricePerNight} €</span>
								<span class="text-[10px] text-slate-400"> / soirée</span>
							</div>

							<Button href={`/listings/${item.id}`} variant="outline" size="sm">
								Voir détails
							</Button>
						</div>
					</Card>
				{/each}
			</div>
		</div>

		<!-- Interactive Map Column (1 Col) -->
		<div class="lg:col-span-1">
			<Card class="sticky top-24 space-y-3 rounded-2xl border-purple-500/20 p-4">
				<div class="flex items-center justify-between">
					<h3 class="flex items-center gap-2 text-sm font-bold text-white">
						<MapPin class="h-4 w-4 text-purple-400" />
						Carte
					</h3>
				</div>

				<!-- Real Interactive Leaflet Map -->
				<InteractiveMap {listings} />
			</Card>
		</div>
	</div>
</div>
