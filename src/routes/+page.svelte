<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Search, MapPin, Calendar, Users, ShieldCheck, Sparkles, ArrowRight, Star } from '@lucide/svelte';

	let { data } = $props();

	let city = $state('');
	let eventDate = $state('');
	let capacity = $state<number | undefined>(undefined);

	const todayIso = new Date().toISOString().split('T')[0];

	function handleSearch(event: Event) {
		event.preventDefault();
		const params = new URLSearchParams();
		if (city) params.set('city', city);
		if (eventDate) params.set('date', eventDate);
		if (capacity) params.set('minCapacity', capacity.toString());

		goto(`/listings?${params.toString()}`);
	}

	const featuredListings = $derived(data.featuredListings || []);
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

<div class="space-y-16 pb-20 bg-white">
	<!-- Hero Section -->
	<section class="relative pt-12 pb-20 bg-slate-50 border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h1 class="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
				Louez des lieux uniques pour vos événements privés.
			</h1>

			<p class="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
				Faites la fête l'esprit tranquille. Chaque réservation inclut nativement une <strong class="text-slate-950 font-semibold">assurance bris & dégradations Wakam</strong>.
			</p>

			<!-- Search Form Widget using InputGroup -->
			<div class="mt-10 max-w-4xl mx-auto">
				<Card.Root class="p-4 md:p-6 text-left border-slate-200">
					<form onsubmit={handleSearch} class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
						<!-- City Input Group -->
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<Label for="home-search-city">Où fêter ?</Label>
							<InputGroup.Root>
								<InputGroup.Addon>
									<MapPin />
								</InputGroup.Addon>
								<InputGroup.Input
									id="home-search-city"
									list="cities-list"
									bind:value={city}
									placeholder="Paris, Lyon, Aix..."
								/>
							</InputGroup.Root>
						</div>

						<!-- Date Input Group -->
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<Label for="home-search-date">Date de l'événement</Label>
							<InputGroup.Root>
								<InputGroup.Addon>
									<Calendar />
								</InputGroup.Addon>
								<InputGroup.Input
									id="home-search-date"
									type="date"
									min={todayIso}
									bind:value={eventDate}
								/>
							</InputGroup.Root>
						</div>

						<!-- Guests Capacity Input Group -->
						<div class="flex w-full max-w-sm flex-col gap-1.5">
							<Label for="home-search-capacity">Nombre d'invités</Label>
							<InputGroup.Root>
								<InputGroup.Addon>
									<Users />
								</InputGroup.Addon>
								<InputGroup.Input
									id="home-search-capacity"
									type="number"
									min="1"
									step="1"
									bind:value={capacity}
									placeholder="Ex: 30 convives"
								/>
							</InputGroup.Root>
						</div>

						<!-- Submit Button Component -->
						<Button type="submit" size="lg" class="hover:cursor-pointer">
							<Search />
							Rechercher
						</Button>
					</form>
				</Card.Root>
			</div>
		</div>
	</section>

	<!-- Featured Listings Grid -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h2 class="text-2xl font-bold text-slate-950">Logements coup de cœur autorisant les soirées</h2>
				<p class="text-slate-500 text-sm mt-1">Lieux vérifiés avec matériel audio et espaces réceptifs</p>
			</div>

			<Button href="/listings" variant="ghost" size="sm" class="gap-1 text-slate-900 font-semibold hover:bg-slate-100">
				Voir tout le catalogue <ArrowRight class="w-4 h-4" />
			</Button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each featuredListings as item (item.id)}
				<Card.Root class="relative mx-auto w-full max-w-sm pt-0 h-full flex flex-col">
					<img
						src={item.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
						alt={item.title}
						referrerpolicy="no-referrer"
						class="relative z-20 aspect-video w-full object-cover"
					/>
					<Card.Header class="flex-1">
						<Card.Action>
							<Badge variant="secondary">★ 4.95</Badge>
						</Card.Action>
						<Card.Title>{item.title}</Card.Title>
						<Card.Description>
							{item.city} • Max {item.maxCapacity} pers. • {item.pricePerNight} € / soirée
						</Card.Description>
					</Card.Header>
					<Card.Footer>
						<Button href={`/listings/${item.id}`} class="w-full">Réserver</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</section>
</div>
