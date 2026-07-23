<script lang="ts">
	import SearchEngine from '$lib/components/SearchEngine.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ShieldCheck, Sparkles, ArrowRight, Star, MapPin, Users } from '@lucide/svelte';

	let { data } = $props();
	const featuredListings = $derived(data.featuredListings || []);
</script>

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

			<!-- Reusable SearchEngine Component -->
			<div class="mt-10 max-w-5xl mx-auto">
				<SearchEngine variant="hero" />
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
						src={item.imageUrl}
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
						<Button href={`/listings/${item.id}`} class="w-full">Voir plus</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</section>
</div>
