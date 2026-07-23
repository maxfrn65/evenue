<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { MapPin, Users, ShieldCheck, Star, Music, Sparkles, CheckCircle2, Lock, ArrowRight, ArrowLeft } from '@lucide/svelte';

	let { data }: { data: { listing: any } } = $props();

	const listing = $derived(data.listing);
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
	<!-- Top Navigation Header -->
	<div class="flex items-center justify-between">
		<Button href="/listings" variant="ghost" size="sm" class="gap-1 text-slate-600 hover:text-slate-900">
			<ArrowLeft class="w-4 h-4" />
			Retour au catalogue
		</Button>

		<div class="flex items-center gap-2">
			<Badge variant="emerald" class="gap-1">
				<ShieldCheck class="w-3.5 h-3.5" />
				Identité Hôte Vérifiée par Stripe Connect
			</Badge>
		</div>
	</div>

	<!-- Main Image & Title Section -->
	<div class="space-y-4">
		<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
			{listing.title}
		</h1>
		<div class="flex flex-wrap items-center gap-4 text-xs text-slate-600">
			<span class="flex items-center gap-1"><MapPin class="w-4 h-4 text-slate-950" /> {listing.address || listing.city}</span>
			<span class="flex items-center gap-1"><Users class="w-4 h-4 text-slate-700" /> Capacité max: {listing.maxCapacity} personnes</span>
			<span class="flex items-center gap-1 text-amber-600 font-bold"><Star class="w-4 h-4 fill-amber-400" /> 4.95 (28 avis)</span>
		</div>

		<Card class="h-96 rounded-2xl overflow-hidden relative border-slate-200">
			<img src={listing.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'} alt={listing.title} class="w-full h-full object-cover" />
			<div class="absolute bottom-4 left-4">
				<Badge variant="purple" class="gap-2 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white">
					<Sparkles class="w-4 h-4 text-amber-400" />
					Lieu pré-équipé pour la musique et les événements
				</Badge>
			</div>
		</Card>
	</div>

	<!-- Content Grid: Details vs Booking Widget -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
		<!-- Left: Description, Host, Amenities -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Host Info Card -->
			<Card class="p-6 flex items-center justify-between border-slate-200">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-full bg-slate-950 text-white border border-slate-800 flex items-center justify-center text-lg font-bold">
						{listing.host ? listing.host.firstName[0] : 'H'}
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-950 flex items-center gap-2">
							Hôte : {listing.host ? listing.host.firstName : 'Propriétaire'} {listing.host?.lastName ? listing.host.lastName[0] + '.' : ''}
							<ShieldCheck class="w-4 h-4 text-emerald-600" />
						</h3>
						<p class="text-xs text-slate-500">{listing.host?.createdAt || 'Membre vérifié'} • KYC Vérifié via Stripe</p>
					</div>
				</div>
				<Badge variant="outline" class="font-medium">
					Réponse rapide (&lt; 1h)
				</Badge>
			</Card>

			<!-- Description -->
			<Card class="p-6 space-y-3 border-slate-200">
				<h3 class="text-lg font-bold text-slate-950">À propos de ce logement</h3>
				<p class="text-sm text-slate-600 leading-relaxed">
					{listing.description}
				</p>
			</Card>

			<!-- Equipment & Sound System -->
			{#if listing.amenities}
				<Card class="p-6 space-y-4 border-slate-200">
					<h3 class="text-lg font-bold text-slate-950 flex items-center gap-2">
						<Music class="w-5 h-5 text-slate-950" />
						Équipements Événementiels & Sonorisation
					</h3>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each listing.amenities as item (item)}
							<div class="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
								<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
								<span>{item}</span>
							</div>
						{/each}
					</div>
				</Card>
			{/if}
		</div>

		<!-- Right: Booking Calculation Widget -->
		<div class="lg:col-span-1">
			<Card class="p-6 sticky top-24 space-y-6 border-slate-200 shadow-md">
				<div class="flex items-center justify-between border-b border-slate-100 pb-4">
					<div>
						<span class="text-3xl font-extrabold text-slate-950">{listing.pricePerNight} €</span>
						<span class="text-xs text-slate-500"> / soirée</span>
					</div>
					<Badge variant="emerald">
						Assurance Wakam Incluses
					</Badge>
				</div>

				<div class="space-y-3 text-xs text-slate-600">
					<div class="flex justify-between py-1">
						<span>Location du lieu (1 soirée)</span>
						<span class="font-semibold text-slate-950">{listing.pricePerNight} €</span>
					</div>
					<div class="flex justify-between py-1 text-emerald-700 font-medium">
						<span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5" /> Police d'Assurance Wakam</span>
						<span class="font-semibold">Offerte (0 €)</span>
					</div>
					<div class="flex justify-between py-1 text-slate-700">
						<span class="flex items-center gap-1"><Lock class="w-3.5 h-3.5" /> Caution Séquestrée (Stripe)</span>
						<span class="font-semibold">{listing.securityDeposit || 500} €</span>
					</div>
				</div>

				<div class="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold text-slate-950">
					<span>Total à régler</span>
					<span class="text-xl text-slate-950">{listing.pricePerNight} €</span>
				</div>

				<Button href={`/bookings/new?listingId=${listing.id}`} variant="default" class="w-full py-3.5 text-sm font-bold gap-2 bg-slate-950 hover:bg-slate-800 text-white">
					Continuer vers la réservation
					<ArrowRight class="w-4 h-4" />
				</Button>

				<p class="text-[10px] text-center text-slate-500">
					Séquestre sécurisé via Stripe Connect. L'assurance Wakam est générée au paiement.
				</p>
			</Card>
		</div>
	</div>
</div>
