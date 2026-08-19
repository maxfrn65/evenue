<script lang="ts">
	import SearchEngine from '$lib/components/SearchEngine.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ArrowRight } from '@lucide/svelte';

	let { data } = $props();
	const featuredListings = $derived(data.featuredListings || []);
</script>

<div class="space-y-16 bg-white pb-20">
	<!-- Hero Section -->
	<section class="relative border-b border-slate-200 bg-slate-50 pt-12 pb-20">
		<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
			<h1
				class="mx-auto max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-slate-950 sm:text-6xl"
			>
				Louez des lieux uniques pour vos événements privés.
			</h1>

			<p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
				Faites la fête l'esprit tranquille. Chaque réservation inclut nativement une <strong
					class="font-semibold text-slate-950">assurance bris & dégradations Wakam</strong
				>.
			</p>

			<!-- Reusable SearchEngine Component -->
			<div class="mx-auto mt-10 max-w-5xl">
				<SearchEngine variant="hero" />
			</div>
		</div>
	</section>

	<!-- Featured Listings Grid -->
	<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-slate-950">
					Logements coup de cœur autorisant les soirées
				</h2>
				<p class="mt-1 text-sm text-slate-500">
					Lieux vérifiés avec matériel audio et espaces réceptifs
				</p>
			</div>

			<Button
				href="/listings"
				variant="ghost"
				size="sm"
				class="gap-1 font-semibold text-slate-900 hover:bg-slate-100"
			>
				Voir tout le catalogue <ArrowRight class="h-4 w-4" />
			</Button>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each featuredListings as item (item.id)}
				<Card.Root class="relative mx-auto flex h-full w-full max-w-sm flex-col pt-0">
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
