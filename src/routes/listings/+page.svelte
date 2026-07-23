<script lang="ts">
	import { page } from '$app/state';
	import InteractiveMap from '$lib/components/InteractiveMap.svelte';
	import SearchEngine from '$lib/components/SearchEngine.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { MapPin, Users } from '@lucide/svelte';

	let { data } = $props();

	let city = $state(page.url.searchParams.get('city') || '');
	let startDate = $state(page.url.searchParams.get('startDate') || '');
	let endDate = $state(page.url.searchParams.get('endDate') || '');
	let minCapacity = $state<number | undefined>(
		page.url.searchParams.get('minCapacity')
			? Number(page.url.searchParams.get('minCapacity'))
			: undefined
	);

	let listings = $state<any[]>(data.listings || []);
	let loading = $state(false);

	$effect(() => {
		if (data.listings) {
			listings = data.listings;
		}
	});

	async function handleFilterSearch(filters: Record<string, string>) {
		loading = true;
		try {
			const params = new URLSearchParams(filters);
			const res = await fetch(`/api/listings?${params.toString()}`);
			const resData = await res.json();
			if (resData.success && Array.isArray(resData.listings)) {
				listings = resData.listings;
			}
			if (typeof window !== 'undefined') {
				const newUrl = params.toString() ? `/listings?${params.toString()}` : '/listings';
				window.history.replaceState({}, '', newUrl);
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl space-y-8 bg-white px-4 py-10 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="flex flex-col justify-between gap-4 pb-6 md:flex-row md:items-center">
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-950">
				Catalogue des lieux d'événements
			</h1>
			<p class="mt-1 text-sm text-slate-500">
				Trouvez le lieu idéal adapté à la capacité et aux dates de votre soirée.
			</p>
		</div>
	</div>

	<!-- Reusable SearchEngine Bar -->
	<SearchEngine
		variant="bar"
		initialCity={city}
		initialStartDate={startDate}
		initialEndDate={endDate}
		initialMinCapacity={minCapacity}
		onsearch={handleFilterSearch}
	/>

	<!-- Main Layout: Grid + Map Section -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Listings Grid (2 Cols) -->
		<div class="space-y-6 lg:col-span-2">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each listings as item (item.id)}
					<Card.Root class="relative mx-auto flex h-full w-full max-w-sm flex-col pt-0">
						<img
							src={item.imageUrl}
							alt={item.title}
							referrerpolicy="no-referrer"
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
