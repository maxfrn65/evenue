<script lang="ts">
	import CoverageBanner from '$lib/components/CoverageBanner.svelte';
	import { Search, MapPin, Calendar, Users, ShieldCheck, Sparkles, ArrowRight, Star } from 'lucide-svelte';

	const sampleListings = [
		{
			id: '1',
			title: 'Villa d\'Exception avec Piscine & Sound System',
			city: 'Aix-en-Provence',
			pricePerNight: 850,
			maxCapacity: 40,
			eventType: 'Soirée Privée / Anniversaire',
			rating: 4.95,
			reviewsCount: 28,
			imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: '2',
			title: 'Loft Industriel & Rooftop Privatif',
			city: 'Paris (11e)',
			pricePerNight: 1200,
			maxCapacity: 60,
			eventType: 'Cocktail / Soirée',
			rating: 4.88,
			reviewsCount: 42,
			imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
		},
		{
			id: '3',
			title: 'Domaine de la Roseraie & Grange Aménagée',
			city: 'Lyon (Périphérie)',
			pricePerNight: 950,
			maxCapacity: 80,
			eventType: 'Mariage / Anniversaire',
			rating: 4.98,
			reviewsCount: 35,
			imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
		}
	];
</script>

<div class="space-y-20 pb-20">
	<!-- Hero Section -->
	<section class="relative pt-16 pb-24 overflow-hidden">
		<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950 -z-10"></div>
		
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-8">
				<Sparkles class="w-4 h-4 text-amber-400" />
				<span>Le marché délaissé par Airbnb — Enfin un cadre légal pour vos soirées</span>
			</div>

			<h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
				Louez des lieux uniques pour vos <span class="gradient-text">événements privés</span>.
			</h1>
			
			<p class="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
				Faites la fête l'esprit tranquille. Chaque réservation inclut nativement une <strong class="text-purple-300 font-semibold">assurance bris & dégradations Wakam</strong> (jusqu'à 10 000 €).
			</p>

			<!-- Search Widget -->
			<div class="mt-10 max-w-4xl mx-auto">
				<div class="glass-card p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3">
					<!-- Destination -->
					<div class="flex items-center gap-3 px-4 py-3 bg-slate-900/60 rounded-xl border border-white/5 w-full md:w-1/3">
						<MapPin class="w-5 h-5 text-purple-400 shrink-0" />
						<div class="text-left w-full">
							<label for="search-location" class="block text-[10px] text-slate-400 uppercase font-semibold">Où souhaitez-vous fêter ?</label>
							<input id="search-location" type="text" placeholder="Paris, Lyon, Aix..." class="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-500" />
						</div>
					</div>

					<!-- Dates -->
					<div class="flex items-center gap-3 px-4 py-3 bg-slate-900/60 rounded-xl border border-white/5 w-full md:w-1/3">
						<Calendar class="w-5 h-5 text-purple-400 shrink-0" />
						<div class="text-left w-full">
							<label for="search-date" class="block text-[10px] text-slate-400 uppercase font-semibold">Date de l'événement</label>
							<input id="search-date" type="text" placeholder="Sélectionner une date" class="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-500" />
						</div>
					</div>

					<!-- Guests -->
					<div class="flex items-center gap-3 px-4 py-3 bg-slate-900/60 rounded-xl border border-white/5 w-full md:w-1/3">
						<Users class="w-5 h-5 text-purple-400 shrink-0" />
						<div class="text-left w-full">
							<label for="search-capacity" class="block text-[10px] text-slate-400 uppercase font-semibold">Invités prévus</label>
							<input id="search-capacity" type="text" placeholder="Ex: 30 convives" class="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-500" />
						</div>
					</div>

					<!-- Submit -->
					<button class="gradient-button w-full md:w-auto h-full px-8 py-3.5 flex items-center justify-center gap-2 whitespace-nowrap">
						<Search class="w-4 h-4" />
						Rechercher
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Transparency Banner (Wakam Insurance) -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<CoverageBanner />
	</section>

	<!-- Featured Listings Grid -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h2 class="text-2xl font-bold text-white">Logements coup de cœur autorisant les soirées</h2>
				<p class="text-slate-400 text-sm mt-1">Lieux vérifiés avec matériel audio et espaces réceptifs</p>
			</div>
			<a href="/listings" class="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
				Voir tout le catalogue <ArrowRight class="w-4 h-4" />
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each sampleListings as item}
				<div class="glass-card rounded-2xl overflow-hidden group">
					<div class="relative h-64 overflow-hidden">
						<img src={item.imageUrl} alt={item.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
						<div class="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold text-purple-300 flex items-center gap-1.5">
							<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
							Assurance Wakam incluse
						</div>
						<div class="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs font-bold text-amber-400 flex items-center gap-1">
							<Star class="w-3.5 h-3.5 fill-amber-400" />
							{item.rating}
						</div>
					</div>

					<div class="p-6 space-y-4">
						<div class="flex items-center justify-between text-xs text-slate-400">
							<span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5 text-purple-400" /> {item.city}</span>
							<span class="flex items-center gap-1"><Users class="w-3.5 h-3.5 text-indigo-400" /> Max {item.maxCapacity} pers.</span>
						</div>

						<h3 class="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
							{item.title}
						</h3>

						<div class="pt-4 border-t border-white/10 flex items-center justify-between">
							<div>
								<span class="text-2xl font-extrabold text-white">{item.pricePerNight} €</span>
								<span class="text-xs text-slate-400"> / soirée</span>
							</div>

							<a href={`/listings/${item.id}`} class="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors">
								Réserver
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
