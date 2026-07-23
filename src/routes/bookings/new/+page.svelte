<script lang="ts">
	import { page } from '$app/state';
	import CoverageBanner from '$lib/components/CoverageBanner.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import {
		ShieldCheck,
		Lock,
		CreditCard,
		Calendar,
		Users,
		CheckCircle2,
		ArrowRight
	} from '@lucide/svelte';

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
		title: "Villa d'Exception avec Piscine & Sound System",
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

<div class="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
	<!-- Tunnel Header -->
	<div class="space-y-2 border-b border-slate-200 pb-6 text-center">
		<Badge variant="emerald" class="gap-1 px-3 py-1">
			<ShieldCheck class="h-4 w-4" />
			Tunnel de Réservation Sécurisé & Assurance Wakam
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950">
			Finaliser votre Réservation d'Événement
		</h1>
		<p class="text-xs text-slate-500">
			Paiement par séquestre Stripe Connect. La police d'assurance Wakam est générée automatiquement
			à la validation.
		</p>
	</div>

	<!-- Wakam Insurance Transparency Banner -->
	<CoverageBanner />

	{#if bookingSuccess}
		<Card class="space-y-4 border-emerald-300 bg-emerald-50/50 p-8 text-center">
			<div
				class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md"
			>
				<CheckCircle2 class="h-8 w-8" />
			</div>
			<h2 class="text-2xl font-bold text-slate-950">
				Réservation & Police d'Assurance Confirmées !
			</h2>
			<p class="mx-auto max-w-lg text-sm text-slate-600">
				Votre demande a été enregistrée avec succès. La police d'assurance <strong
					class="font-semibold text-emerald-700">{generatedPolicy}</strong
				> a été émise et rattachée à votre réservation sous séquestre Stripe.
			</p>
			<div class="flex justify-center gap-4 pt-4">
				<Button href="/listings" variant="default">Retourner au catalogue</Button>
			</div>
		</Card>
	{:else}
		{#if errorMessage}
			<div
				class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700"
			>
				{errorMessage}
			</div>
		{/if}

		<!-- Booking & Payment Form -->
		<form onsubmit={handleBooking} class="grid grid-cols-1 gap-5 md:grid-cols-3">
			<!-- Form Inputs (2 Cols) -->
			<div class="space-y-6 md:col-span-2">
				<Card class="space-y-4 border-slate-200 p-6">
					<h3 class="flex items-center gap-2 text-base font-bold text-slate-950">
						<Calendar class="h-4 w-4 text-slate-950" />
						1. Dates de l'Événement
					</h3>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="flex flex-col gap-1.5">
							<Label for="booking-start-date">Date de Début</Label>
							<InputGroup.Root>
								<InputGroup.Addon>
									<Calendar />
								</InputGroup.Addon>
								<InputGroup.Input
									id="booking-start-date"
									type="date"
									min={todayIso}
									bind:value={startDate}
									required
								/>
							</InputGroup.Root>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="booking-end-date">Date de Fin</Label>
							<InputGroup.Root>
								<InputGroup.Addon>
									<Calendar />
								</InputGroup.Addon>
								<InputGroup.Input
									id="booking-end-date"
									type="date"
									min={startDate || todayIso}
									bind:value={endDate}
									required
								/>
							</InputGroup.Root>
						</div>
					</div>

					<div class="flex flex-col gap-1.5">
						<Label for="booking-guests">Nombre d'Invités prévus (Max {listing.maxCapacity})</Label>
						<InputGroup.Root>
							<InputGroup.Addon>
								<Users />
							</InputGroup.Addon>
							<InputGroup.Input
								id="booking-guests"
								type="number"
								min="1"
								max={listing.maxCapacity}
								bind:value={guestCount}
								required
							/>
						</InputGroup.Root>
					</div>
				</Card>

				<Card class="space-y-4 border-slate-200 p-6">
					<h3 class="flex items-center gap-2 text-base font-bold text-slate-950">
						<CreditCard class="h-4 w-4 text-slate-950" />
						2. Paiement Séquestre Stripe & Caution
					</h3>

					<div
						class="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700"
					>
						<div class="flex items-center gap-2 font-semibold text-slate-950">
							<Lock class="h-4 w-4 text-slate-800" />
							Garantie de Séquestre Stripe Connect
						</div>
						<p class="leading-relaxed text-slate-600">
							Vos fonds et la caution ({listing.securityDeposit} €) sont capturés et conservés sous séquestre.
							La ventilation vers l'hôte n'intervient qu'après la fin de l'événement sans sinistre déclaré.
						</p>
					</div>
				</Card>
			</div>

			<!-- Summary Sidebar (1 Col) -->
			<div class="md:col-span-1">
				<Card class="sticky top-24 space-y-6 border-slate-200 p-6">
					<h3 class="border-b border-slate-100 pb-3 text-base font-bold text-slate-950">
						Récapitulatif
					</h3>

					<div class="space-y-3 text-xs text-slate-600">
						<div class="flex justify-between">
							<span>Location ({listing.title})</span>
							<span class="font-semibold text-slate-950">{listing.pricePerNight} €</span>
						</div>
						<div class="flex justify-between font-semibold text-emerald-700">
							<span>Police Wakam Événement</span>
							<span>Offerte (0 €)</span>
						</div>
						<div class="flex justify-between text-slate-700">
							<span>Caution sous séquestre</span>
							<span>{listing.securityDeposit} €</span>
						</div>
					</div>

					<div
						class="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-slate-950"
					>
						<span>Total à payer</span>
						<span class="text-xl text-slate-950">{listing.pricePerNight} €</span>
					</div>

					<Button
						type="submit"
						variant="default"
						disabled={loading}
						class="w-full gap-2 bg-slate-950 py-3.5 text-sm font-bold text-white hover:bg-slate-800"
					>
						{loading ? 'Paiement en cours...' : 'Confirmer & Payer'}
						<ArrowRight class="h-4 w-4" />
					</Button>
				</Card>
			</div>
		</form>
	{/if}
</div>
