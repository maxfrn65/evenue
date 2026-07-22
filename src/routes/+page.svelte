<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import {
		Search,
		MapPin,
		Calendar,
		Users,
		ShieldCheck,
		Sparkles,
		ArrowRight,
		Star
	} from 'lucide-svelte';

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

	const sampleListings = [
		{
			id: 'villa-aix-01',
			title: "Villa d'Exception avec Piscine & Sound System",
			city: 'Aix-en-Provence',
			pricePerNight: 850,
			maxCapacity: 40,
			rating: 4.95,
			imageUrl:
				'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: 'loft-paris-02',
			title: 'Loft Industriel & Rooftop Privatif',
			city: 'Paris (11e)',
			pricePerNight: 1200,
			maxCapacity: 60,
			rating: 4.88,
			imageUrl:
				'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: 'domaine-lyon-03',
			title: 'Domaine de la Roseraie & Grange Aménagée',
			city: 'Lyon (Périphérie)',
			pricePerNight: 950,
			maxCapacity: 80,
			rating: 4.98,
			imageUrl:
				'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
		}
	];
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

<div class="space-y-20 pb-20">
	<!-- Hero Section -->
	<section class="relative overflow-hidden pt-16 pb-24">
		<div
			class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950"
		></div>

		<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
			<h1
				class="mx-auto max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-6xl"
			>
				Louez des lieux uniques pour vos <span class="gradient-text">événements privés</span>.
			</h1>

			<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
				Faites la fête l'esprit tranquille. Chaque réservation inclut nativement une <strong
					class="font-semibold text-purple-300">assurance bris & dégradations Wakam</strong
				>.
			</p>

			<!-- Search Form Widget -->
			<div class="mx-auto mt-10 max-w-4xl">
				<Card class="p-4 text-left md:p-6">
					<form onsubmit={handleSearch} class="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
						<!-- City Input with Autocomplete Datalist -->
						<div>
							<Label for="home-search-city">Où fêter ?</Label>
							<div class="relative">
								<MapPin class="absolute top-3 left-3 z-10 h-4 w-4 text-purple-400" />
								<Input
									id="home-search-city"
									list="cities-list"
									bind:value={city}
									placeholder="Paris, Lyon, Aix..."
									class="pl-9"
								/>
							</div>
						</div>

						<!-- Date Input -->
						<div>
							<Label for="home-search-date">Date de l'événement</Label>
							<div class="relative">
								<Calendar class="absolute top-3 left-3 z-10 h-4 w-4 text-purple-400" />
								<Input
									id="home-search-date"
									type="date"
									min={todayIso}
									bind:value={eventDate}
									class="pl-9"
								/>
							</div>
						</div>

						<!-- Guests Capacity Number Input -->
						<div>
							<Label for="home-search-capacity">Nombre d'invités</Label>
							<div class="relative">
								<Users class="absolute top-3 left-3 z-10 h-4 w-4 text-purple-400" />
								<Input
									id="home-search-capacity"
									type="number"
									min="1"
									step="1"
									bind:value={capacity}
									placeholder="Ex: 30 convives"
									class="pl-9"
								/>
							</div>
						</div>

						<!-- Submit Button Component -->
						<Button type="submit" variant="gradient" class="h-10 w-full gap-2">
							<Search class="h-4 w-4" />
							Rechercher
						</Button>
					</form>
				</Card>
			</div>
		</div>
	</section>

	<!-- Featured Listings Grid -->
	<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-white">Logements coup de cœur autorisant les soirées</h2>
				<p class="mt-1 text-sm text-slate-400">
					Lieux vérifiés avec matériel audio et espaces réceptifs
				</p>
			</div>

			<Button
				href="/listings"
				variant="ghost"
				size="sm"
				class="gap-1 text-purple-400 hover:text-purple-300"
			>
				Voir tout le catalogue <ArrowRight class="h-4 w-4" />
			</Button>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each sampleListings as item}
				<Card class="group flex flex-col justify-between">
					<div>
						<div class="relative h-64 overflow-hidden">
							<img
								src={item.imageUrl}
								alt={item.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div class="absolute top-3 left-3">
								<Badge variant="emerald" class="gap-1 backdrop-blur-md">
									<ShieldCheck class="h-3.5 w-3.5" />
									Assurance Wakam
								</Badge>
							</div>
							<div class="absolute top-3 right-3">
								<Badge variant="amber" class="gap-1 font-bold backdrop-blur-md">
									<Star class="h-3.5 w-3.5 fill-amber-400" />
									{item.rating}
								</Badge>
							</div>
						</div>

						<div class="space-y-4 p-6">
							<div class="flex items-center justify-between text-xs text-slate-400">
								<span class="flex items-center gap-1"
									><MapPin class="h-3.5 w-3.5 text-purple-400" /> {item.city}</span
								>
								<span class="flex items-center gap-1"
									><Users class="h-3.5 w-3.5 text-indigo-400" /> Max {item.maxCapacity} pers.</span
								>
							</div>

							<h3
								class="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-purple-300"
							>
								{item.title}
							</h3>
						</div>
					</div>

					<div class="flex items-center justify-between border-t border-white/10 p-6 pt-0">
						<div>
							<span class="text-2xl font-extrabold text-white">{item.pricePerNight} €</span>
							<span class="text-xs text-slate-400"> / soirée</span>
						</div>

						<Button href={`/listings/${item.id}`} variant="outline" size="sm">Réserver</Button>
					</div>
				</Card>
			{/each}
		</div>
	</section>
</div>
