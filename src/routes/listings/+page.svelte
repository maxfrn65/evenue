<script lang="ts">
	import { page } from '$app/state';
	import InteractiveMap from '$lib/components/InteractiveMap.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import {
		MapPin,
		Users,
		Funnel,
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
	const eventTypes = [
		{ value: '', label: 'Tous événements' },
		{ value: 'SOIRÉE', label: 'Soirée privée' },
		{ value: 'ANNIVERSAIRE', label: 'Anniversaire' },
		{ value: 'MARIAGE', label: 'Mariage / Réception' },
		{ value: 'COCKTAIL', label: 'Cocktail professionnel' }
	];

	let eventType = $state('');
	
	const triggerEventTypeLabel = $derived(
		eventTypes.find((e) => e.value === eventType)?.label ?? 'Tous événements'
	);

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

<div class="mx-auto max-w-7xl space-y-8 bg-white px-4 py-10 sm:px-6 lg:px-8">
	<!-- Header -->
	<div
		class="flex flex-col justify-between gap-4 pb-6 md:flex-row md:items-center"
	>
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-950">
				Catalogue des lieux d'événements
			</h1>
			<p class="mt-1 text-sm text-slate-500">
				Trouvez le lieu idéal adapté à la capacité et au type de votre soirée.
			</p>
		</div>
	</div>

	<!-- Filter Widget Bar with Explicit Labels -->
	<Card.Root class="border-slate-200 p-4 md:p-6 flex items-center">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				fetchListings();
			}}
			class="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5"
		>
			<!-- City -->
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="filter-city">Ville</Label>
				<InputGroup.Root class="relative">
					<InputGroup.Addon>
						<MapPin />
					</InputGroup.Addon>
					<InputGroup.Input
						id="filter-city"
						list="cities-list"
						bind:value={city}
						placeholder="Ex: Paris, Aix..."
						class="pl-9"
					/>
				</InputGroup.Root>
			</div>

			<!-- Max Price -->
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="filter-max-price">Prix max / soirée (€)</Label>
				<InputGroup.Root class="relative">
					<InputGroup.Addon>
						<SlidersHorizontal />
					</InputGroup.Addon>
					<InputGroup.Input
						id="filter-max-price"
						type="number"
						min="0"
						step="50"
						bind:value={maxPrice}
						placeholder="Ex: 1000 €"
						class="pl-9"
					/>
				</InputGroup.Root>
			</div>

			<!-- Min Capacity -->
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="filter-capacity">Capacité min (invités)</Label>
				<InputGroup.Root class="relative">
					<InputGroup.Addon>
						<Users />
					</InputGroup.Addon>
					<InputGroup.Input
						id="filter-capacity"
						type="number"
						min="1"
						step="1"
						bind:value={minCapacity}
						placeholder="Ex: 30 convives"
					/>
				</InputGroup.Root>
			</div>

			<!-- Event Type -->
			<Select.Root type="single" name="eventType" bind:value={eventType}>
				<Select.Trigger class="w-full">
					{triggerEventTypeLabel}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
					<Select.Label>Événements</Select.Label>
					{#each eventTypes as item (item.value)}
						<Select.Item value={item.value} label={item.label}>
						{item.label}
						</Select.Item>
					{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<!-- Submit Button Component -->
			<Button
				type="submit"
				variant="default"
			>
				<Funnel />
				Filtrer
			</Button>
		</form>
	</Card.Root>

	<!-- Main Layout: Grid + Map Section -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Listings Grid (2 Cols) -->
		<div class="space-y-6 lg:col-span-2">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each listings as item (item.id)}
					<Card.Root class="relative mx-auto w-full max-w-sm pt-0 h-full flex flex-col">
						<img
							src={item.imageUrl ||
								'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
							alt={item.title}
							class="relative z-20 aspect-video w-full object-cover"
						/>
						<Card.Header class="flex-1">
							<Card.Action>
								<Badge variant="secondary">{item.rating ? `★ ${item.rating}` : 'Featured'}</Badge>
							</Card.Action>
							<Card.Title>{item.title}</Card.Title>
							<Card.Description>
								{item.city} • Max {item.maxCapacity} convives • {item.pricePerNight} € / soirée
							</Card.Description>
						</Card.Header>
						<Card.Footer>
							<Button href={`/listings/${item.id}`} class="w-full">Voir détails</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		</div>

		<!-- Interactive Map Column (1 Col) -->
		<div class="lg:col-span-1">
			<Card.Root class="sticky top-24 space-y-3 rounded-xl border-slate-200 p-4">
				<div class="flex items-center justify-between">
					<h3 class="flex items-center gap-2 text-sm font-bold text-slate-950">
						<MapPin class="h-4 w-4 text-slate-950" />
						Carte Géolocalisée Interactive
					</h3>
					<Badge variant="secondary" class="text-[10px]">OpenStreetMap</Badge>
				</div>

				<!-- Real Interactive Leaflet Map -->
				<InteractiveMap {listings} />
			</Card.Root>
		</div>
	</div>
</div>
