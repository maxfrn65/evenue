<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import {
		MapPin,
		Users,
		ShieldCheck,
		Star,
		Music,
		Sparkles,
		CheckCircle2,
		Lock,
		ArrowRight,
		ArrowLeft
	} from '@lucide/svelte';

	let { data }: { data: { listing: any } } = $props();

	const listing = $derived(data.listing);
</script>

<div class="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
	<!-- Top Navigation Header -->
	<div class="flex items-center justify-between">
		<Button
			href="/listings"
			variant="ghost"
			size="sm"
			class="gap-1 text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="h-4 w-4" />
			Retour au catalogue
		</Button>

		<div class="flex items-center gap-2">
			<Badge variant="emerald" class="gap-1">
				<ShieldCheck class="h-3.5 w-3.5" />
				Identité Hôte Vérifiée par Stripe Connect
			</Badge>
		</div>
	</div>

	<!-- Main Image & Title Section -->
	<div class="space-y-4">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			{listing.title}
		</h1>
		<div class="flex flex-wrap items-center gap-4 text-xs text-slate-600">
			<span class="flex items-center gap-1"
				><MapPin class="h-4 w-4 text-slate-950" /> {listing.address || listing.city}</span
			>
			<span class="flex items-center gap-1"
				><Users class="h-4 w-4 text-slate-700" /> Capacité max: {listing.maxCapacity} personnes</span
			>
			<span class="flex items-center gap-1 font-bold text-amber-600"
				><Star class="h-4 w-4 fill-amber-400" /> 4.95 (28 avis)</span
			>
		</div>

		<Card class="relative h-96 overflow-hidden rounded-2xl border-slate-200">
			<img
				src={listing.imageUrl ||
					'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'}
				alt={listing.title}
				referrerpolicy="no-referrer"
				class="h-full w-full object-cover"
			/>
			<div class="absolute bottom-4 left-4">
				<Badge
					variant="purple"
					class="gap-2 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
				>
					<Sparkles class="h-4 w-4 text-amber-400" />
					Lieu pré-équipé pour la musique et les événements
				</Badge>
			</div>
		</Card>
	</div>

	<!-- Content Grid: Details vs Booking Widget -->
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
		<!-- Left: Description, Host, Amenities -->
		<div class="space-y-8 lg:col-span-2">
			<!-- Host Info Card -->
			<Card class="flex items-center justify-between border-slate-200 p-6">
				<div class="flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-lg font-bold text-white"
					>
						{listing.host ? listing.host.firstName[0] : 'H'}
					</div>
					<div>
						<h3 class="flex items-center gap-2 text-base font-bold text-slate-950">
							Hôte : {listing.host ? listing.host.firstName : 'Propriétaire'}
							{listing.host?.lastName ? listing.host.lastName[0] + '.' : ''}
							<ShieldCheck class="h-4 w-4 text-emerald-600" />
						</h3>
						<p class="text-xs text-slate-500">
							{listing.host?.createdAt || 'Membre vérifié'} • KYC Vérifié via Stripe
						</p>
					</div>
				</div>
				<Badge variant="outline" class="font-medium">Réponse rapide (&lt; 1h)</Badge>
			</Card>

			<!-- Description -->
			<Card class="space-y-3 border-slate-200 p-6">
				<h3 class="text-lg font-bold text-slate-950">À propos de ce logement</h3>
				<p class="text-sm leading-relaxed text-slate-600">
					{listing.description}
				</p>
			</Card>

			<!-- Equipment & Sound System -->
			{#if listing.amenities}
				<Card class="space-y-4 border-slate-200 p-6">
					<h3 class="flex items-center gap-2 text-lg font-bold text-slate-950">
						<Music class="h-5 w-5 text-slate-950" />
						Équipements Événementiels & Sonorisation
					</h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{#each listing.amenities as item (item)}
							<div
								class="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
							>
								<CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
								<span>{item}</span>
							</div>
						{/each}
					</div>
				</Card>
			{/if}
		</div>

		<!-- Right: Booking Calculation Widget -->
		<div class="lg:col-span-1">
			<Card class="sticky top-24 space-y-6 border-slate-200 p-6">
				<div class="flex items-center justify-between border-b border-slate-100 pb-4">
					<div>
						<span class="text-3xl font-extrabold text-slate-950">{listing.pricePerNight} €</span>
						<span class="text-xs text-slate-500"> / soirée</span>
					</div>
					<Badge variant="emerald">Assurance Wakam Incluses</Badge>
				</div>

				<div class="space-y-3 text-xs text-slate-600">
					<div class="flex justify-between py-1">
						<span>Location du lieu (1 soirée)</span>
						<span class="font-semibold text-slate-950">{listing.pricePerNight} €</span>
					</div>
					<div class="flex justify-between py-1 font-medium text-emerald-700">
						<span class="flex items-center gap-1"
							><ShieldCheck class="h-3.5 w-3.5" /> Police d'Assurance Wakam</span
						>
						<span class="font-semibold">Offerte (0 €)</span>
					</div>
					<div class="flex justify-between py-1 text-slate-700">
						<span class="flex items-center gap-1"
							><Lock class="h-3.5 w-3.5" /> Caution Séquestrée (Stripe)</span
						>
						<span class="font-semibold">{listing.securityDeposit || 500} €</span>
					</div>
				</div>

				<div
					class="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-slate-950"
				>
					<span>Total à régler</span>
					<span class="text-xl text-slate-950">{listing.pricePerNight} €</span>
				</div>

				<Button
					href={`/bookings/new?listingId=${listing.id}`}
					variant="default"
					class="w-full gap-2 bg-slate-950 py-3.5 text-sm font-bold text-white hover:bg-slate-800"
				>
					Continuer vers la réservation
					<ArrowRight class="h-4 w-4" />
				</Button>

				<p class="text-center text-[10px] text-slate-500">
					Séquestre sécurisé via Stripe Connect. L'assurance Wakam est générée au paiement.
				</p>
			</Card>
		</div>
	</div>
</div>
