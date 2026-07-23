<script lang="ts">
	import { page } from '$app/state';
	import CoverageBanner from '$lib/components/CoverageBanner.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { ShieldCheck, Lock, CreditCard, Calendar, Users, CheckCircle2, ArrowRight } from '@lucide/svelte';

	let listingId = $state(page.url.searchParams.get('listingId') || 'villa-aix-01');
	let startDate = $state('');
	let endDate = $state('');
	let guestCount = $state(25);
	let loading = $state(false);
	let bookingSuccess = $state(false);
	let errorMessage = $state('');
	let generatedPolicy = $state<string>('');

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
		errorMessage = '';

		try {
			const res = await fetch('/api/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					listingId,
					startDate,
					endDate,
					guestCount
				})
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Erreur lors de la réservation.');
			}

			generatedPolicy = data.insurancePolicy?.policyNumber || 'WAK-2026-88492';
			bookingSuccess = true;
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
	<!-- Tunnel Header -->
	<div class="text-center space-y-2 border-b border-slate-200 pb-6">
		<Badge variant="emerald" class="py-1 px-3 gap-1">
			<ShieldCheck class="w-4 h-4" />
			Tunnel de Réservation Sécurisé & Assurance Wakam
		</Badge>
		<h1 class="text-3xl font-extrabold text-slate-950 tracking-tight">
			Finaliser votre Réservation d'Événement
		</h1>
		<p class="text-xs text-slate-500">
			Paiement par séquestre Stripe Connect. La police d'assurance Wakam est générée automatiquement à la validation.
		</p>
	</div>

	<!-- Wakam Insurance Transparency Banner -->
	<CoverageBanner />

	{#if bookingSuccess}
		<Card class="p-8 text-center space-y-4 border-emerald-300 bg-emerald-50/50">
			<div class="w-14 h-14 bg-emerald-600 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md">
				<CheckCircle2 class="w-8 h-8" />
			</div>
			<h2 class="text-2xl font-bold text-slate-950">Réservation & Police d'Assurance Confirmées !</h2>
			<p class="text-sm text-slate-600 max-w-lg mx-auto">
				Votre demande a été enregistrée avec succès. La police d'assurance <strong class="text-emerald-700 font-semibold">{generatedPolicy}</strong> a été émise et rattachée à votre réservation sous séquestre Stripe.
			</p>
			<div class="pt-4 flex justify-center gap-4">
				<Button href="/listings" variant="default">
					Retourner au catalogue
				</Button>
			</div>
		</Card>
	{:else}
		{#if errorMessage}
			<div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<!-- Booking & Payment Form -->
		<form onsubmit={handleBooking} class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Form Inputs (2 Cols) -->
			<div class="md:col-span-2 space-y-6">
				<Card class="p-6 space-y-4 border-slate-200">
					<h3 class="text-base font-bold text-slate-950 flex items-center gap-2">
						<Calendar class="w-4 h-4 text-slate-950" />
						1. Dates de l'Événement
					</h3>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Label for="booking-start-date">Date de Début</Label>
							<InputGroup.Root>
								<InputGroup.Icon>
									<Calendar class="w-4 h-4 text-slate-400" />
								</InputGroup.Icon>
								<InputGroup.Input id="booking-start-date" type="date" min={todayIso} bind:value={startDate} required />
							</InputGroup.Root>
						</div>
						<div>
							<Label for="booking-end-date">Date de Fin</Label>
							<InputGroup.Root>
								<InputGroup.Icon>
									<Calendar class="w-4 h-4 text-slate-400" />
								</InputGroup.Icon>
								<InputGroup.Input id="booking-end-date" type="date" min={startDate || todayIso} bind:value={endDate} required />
							</InputGroup.Root>
						</div>
					</div>

					<div>
						<Label for="booking-guests">Nombre d'Invités prévus (Max {listing.maxCapacity})</Label>
						<InputGroup.Root>
							<InputGroup.Icon>
								<Users class="w-4 h-4 text-slate-400" />
							</InputGroup.Icon>
							<InputGroup.Input id="booking-guests" type="number" min="1" max={listing.maxCapacity} bind:value={guestCount} required />
						</InputGroup.Root>
					</div>
				</Card>

				<Card class="p-6 space-y-4 border-slate-200">
					<h3 class="text-base font-bold text-slate-950 flex items-center gap-2">
						<CreditCard class="w-4 h-4 text-slate-950" />
						2. Paiement Séquestre Stripe & Caution
					</h3>

					<div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
						<div class="flex items-center gap-2 font-semibold text-slate-950">
							<Lock class="w-4 h-4 text-slate-800" />
							Garantie de Séquestre Stripe Connect
						</div>
						<p class="text-slate-600 leading-relaxed">
							Vos fonds et la caution ({listing.securityDeposit} €) sont capturés et conservés sous séquestre. La ventilation vers l'hôte n'intervient qu'après la fin de l'événement sans sinistre déclaré.
						</p>
					</div>
				</Card>
			</div>

			<!-- Summary Sidebar (1 Col) -->
			<div class="md:col-span-1">
				<Card class="p-6 space-y-6 sticky top-24 border-slate-200 shadow-md">
					<h3 class="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
						Récapitulatif
					</h3>

					<div class="space-y-3 text-xs text-slate-600">
						<div class="flex justify-between">
							<span>Location ({listing.title})</span>
							<span class="font-semibold text-slate-950">{listing.pricePerNight} €</span>
						</div>
						<div class="flex justify-between text-emerald-700 font-semibold">
							<span>Police Wakam Événement</span>
							<span>Offerte (0 €)</span>
						</div>
						<div class="flex justify-between text-slate-700">
							<span>Caution sous séquestre</span>
							<span>{listing.securityDeposit} €</span>
						</div>
					</div>

					<div class="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold text-slate-950">
						<span>Total à payer</span>
						<span class="text-xl text-slate-950">{listing.pricePerNight} €</span>
					</div>

					<Button type="submit" variant="default" disabled={loading} class="w-full py-3.5 text-sm font-bold gap-2 bg-slate-950 hover:bg-slate-800 text-white">
						{loading ? 'Paiement en cours...' : 'Confirmer & Payer'}
						<ArrowRight class="w-4 h-4" />
					</Button>
				</Card>
			</div>
		</form>
	{/if}
</div>
