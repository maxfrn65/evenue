<script lang="ts">
	import { page } from '$app/state';
	import CoverageBanner from '$lib/components/CoverageBanner.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { ShieldCheck, Lock, CreditCard, Calendar, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-svelte';

	let listingId = $state(page.url.searchParams.get('listingId') || 'villa-aix-01');
	let startDate = $state('');
	let endDate = $state('');
	let guestCount = $state(25);
	let loading = $state(false);
	let bookingSuccess = $state(false);

	const todayIso = new Date().toISOString().split('T')[0];

	const listing = {
		id: 'villa-aix-01',
		title: 'Villa d\'Exception avec Piscine & Sound System',
		city: 'Aix-en-Provence',
		pricePerNight: 850,
		securityDeposit: 500,
		maxCapacity: 40
	};

	async function handleBooking(e: Event) {
		e.preventDefault();
		loading = true;
		// Simulate booking & Wakam policy generation
		setTimeout(() => {
			loading = false;
			bookingSuccess = true;
		}, 1200);
	}
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
	<!-- Tunnel Header -->
	<div class="text-center space-y-2 border-b border-white/10 pb-6">
		<Badge variant="emerald" class="py-1 px-3 gap-1">
			<ShieldCheck class="w-4 h-4" />
			Tunnel de Réservation Sécurisé & Assurance Wakam
		</Badge>
		<h1 class="text-3xl font-extrabold text-white tracking-tight">
			Finaliser votre Réservation d'Événement
		</h1>
		<p class="text-xs text-slate-400">
			Paiement par séquestre Stripe Connect. La police d'assurance Wakam est générée automatiquement à la validation.
		</p>
	</div>

	<!-- Wakam Insurance Transparency Banner (Displayed ONLY in Booking Tunnel) -->
	<CoverageBanner />

	{#if bookingSuccess}
		<Card class="p-8 text-center space-y-4 border-emerald-500/30 bg-emerald-950/20">
			<div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center border border-emerald-500/30">
				<CheckCircle2 class="w-8 h-8" />
			</div>
			<h2 class="text-2xl font-bold text-white">Réservation & Police d'Assurance Confirmées !</h2>
			<p class="text-sm text-slate-300 max-w-lg mx-auto">
				Votre demande a été envoyée avec succès à l'hôte. La police d'assurance <strong class="text-emerald-400">Wakam N° WAK-2026-88492</strong> a été générée et rattachée à votre réservation.
			</p>
			<div class="pt-4 flex justify-center gap-4">
				<a href="/listings">
					<Button variant="gradient" size="sm">
						Retourner au catalogue
					</Button>
				</a>
			</div>
		</Card>
	{:else}
		<!-- Booking & Payment Form -->
		<form onsubmit={handleBooking} class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Form Inputs (2 Cols) -->
			<div class="md:col-span-2 space-y-6">
				<Card class="p-6 space-y-4">
					<h3 class="text-base font-bold text-white flex items-center gap-2">
						<Calendar class="w-4 h-4 text-purple-400" />
						1. Dates de l'Événement
					</h3>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Label for="booking-start-date">Date de Début</Label>
							<Input id="booking-start-date" type="date" min={todayIso} bind:value={startDate} required />
						</div>
						<div>
							<Label for="booking-end-date">Date de Fin</Label>
							<Input id="booking-end-date" type="date" min={startDate || todayIso} bind:value={endDate} required />
						</div>
					</div>

					<div>
						<Label for="booking-guests">Nombre d'Invités prévus (Max {listing.maxCapacity})</Label>
						<Input id="booking-guests" type="number" min="1" max={listing.maxCapacity} bind:value={guestCount} required />
					</div>
				</Card>

				<Card class="p-6 space-y-4">
					<h3 class="text-base font-bold text-white flex items-center gap-2">
						<CreditCard class="w-4 h-4 text-purple-400" />
						2. Paiement Séquestre Stripe & Caution
					</h3>

					<div class="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300">
						<div class="flex items-center gap-2 font-semibold text-white">
							<Lock class="w-4 h-4 text-indigo-400" />
							Garantie de Séquestre Stripe Connect
						</div>
						<p class="text-slate-400 leading-relaxed">
							Vos fonds et la caution ({listing.securityDeposit} €) sont capturés et conservés sous séquestre. La ventilation vers l'hôte n'intervient qu'après la fin de l'événement sans sinistre déclaré.
						</p>
					</div>
				</Card>
			</div>

			<!-- Summary Sidebar (1 Col) -->
			<div class="md:col-span-1">
				<Card class="p-6 space-y-6 sticky top-24 border-purple-500/30">
					<h3 class="text-base font-bold text-white border-b border-white/10 pb-3">
						Récapitulatif
					</h3>

					<div class="space-y-3 text-xs text-slate-300">
						<div class="flex justify-between">
							<span>Location ({listing.title})</span>
							<span class="font-semibold text-white">{listing.pricePerNight} €</span>
						</div>
						<div class="flex justify-between text-emerald-400 font-semibold">
							<span>Police Wakam Événement</span>
							<span>Offerte (0 €)</span>
						</div>
						<div class="flex justify-between text-indigo-300">
							<span>Caution sous séquestre</span>
							<span>{listing.securityDeposit} €</span>
						</div>
					</div>

					<div class="border-t border-white/10 pt-4 flex justify-between items-center text-sm font-bold text-white">
						<span>Total à payer</span>
						<span class="text-xl text-purple-400">{listing.pricePerNight} €</span>
					</div>

					<Button type="submit" variant="gradient" disabled={loading} class="w-full py-3.5 text-sm font-bold gap-2">
						{loading ? 'Paiement en cours...' : 'Confirmer & Payer'}
						<ArrowRight class="w-4 h-4" />
					</Button>
				</Card>
			</div>
		</form>
	{/if}
</div>
