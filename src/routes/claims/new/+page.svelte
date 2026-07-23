<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, FileText } from '@lucide/svelte';

	let { data } = $props();
	const user = $derived(data.user);
	const bookings = $derived(data.bookings);

	let selectedBookingId = $state('');

	$effect(() => {
		selectedBookingId = data.selectedBookingId || (data.bookings[0]?.id ?? '');
	});
	let damageType = $state('SOUND_SYSTEM');
	let description = $state('');
	let estimatedCost = $state<number | undefined>(undefined);
	let loading = $state(false);
	let errorMessage = $state('');
	let claimSuccess = $state<any | null>(null);

	const damageTypes = [
		{ value: 'SOUND_SYSTEM', label: 'Matériel de Sonorisation / Éclairage' },
		{ value: 'FURNITURE', label: 'Mobilier / Décoration' },
		{ value: 'STRUCTURE', label: 'Structure / Murs / Sols' },
		{ value: 'OTHER', label: 'Autre dégradation matérielle' }
	];

	const triggerDamageLabel = $derived(
		damageTypes.find((d) => d.value === damageType)?.label ?? 'Type de dégât'
	);

	const selectedBooking = $derived(bookings.find((b: any) => b.id === selectedBookingId));

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		errorMessage = '';

		if (!selectedBookingId) {
			errorMessage = 'Veuillez sélectionner une réservation.';
			loading = false;
			return;
		}

		if (!estimatedCost || estimatedCost <= 0) {
			errorMessage = 'Le montant estimé doit être supérieur à 0 €.';
			loading = false;
			return;
		}

		try {
			const res = await fetch('/api/claims', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bookingId: selectedBookingId,
					damageType,
					description,
					estimatedCost
				})
			});

			const resData = await res.json();
			if (!res.ok || !resData.success) {
				throw new Error(resData.error || 'Erreur lors de l\'enregistrement du sinistre.');
			}

			claimSuccess = resData.claim;
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="space-y-2 text-center">
		<Badge variant="emerald" class="gap-1 px-3 py-1">
			<ShieldCheck class="h-4 w-4" />
			Garantie Wakam — Déclaration de Sinistre
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950">
			Déclarer un Sinistre ou une Dégradation
		</h1>
		<p class="text-xs text-slate-500">
			Protection Wakam embarquée jusqu'à 10 000 € de dommages matériels.
		</p>
	</div>

	{#if claimSuccess}
		<Card class="space-y-6 border-emerald-300 bg-emerald-50/50 p-8 text-center">
			<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
				<CheckCircle2 class="h-8 w-8" />
			</div>
			<div class="space-y-2">
				<h2 class="text-2xl font-bold text-slate-950">Sinistre Enregistré avec Succès !</h2>
				<p class="text-xs text-slate-600">
					Dossier N° <strong class="font-bold text-emerald-800">{claimSuccess.claimNumber}</strong> rattaché à la police <strong class="font-bold text-slate-900">{claimSuccess.policyNumber}</strong>.
				</p>
			</div>

			<div class="rounded-xl border border-emerald-200 bg-white p-4 text-left text-xs text-slate-700 space-y-2">
				<div class="flex justify-between">
					<span class="text-slate-500">Montant estimé réclamé :</span>
					<strong class="font-bold text-slate-950">{claimSuccess.estimatedCost} €</strong>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Statut du dossier :</span>
					<Badge variant="amber">En cours d'étude par Wakam</Badge>
				</div>
			</div>

			<div class="flex flex-wrap justify-center gap-3 pt-2">
				<Button href={`/bookings/${claimSuccess.bookingId}/certificate`} target="_blank" variant="outline" class="gap-2">
					<FileText class="h-4 w-4" />
					Voir l'Attestation Wakam (PDF/HTML)
				</Button>
				<Button href="/dashboard" variant="default">
					Retourner à mon Espace
				</Button>
			</div>
		</Card>
	{:else}
		{#if errorMessage}
			<div class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700">
				{errorMessage}
			</div>
		{/if}

		<Card class="space-y-6 border-slate-200 p-6 sm:p-8">
			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Booking Selection -->
				<div class="flex flex-col gap-1.5">
					<Label>Réservation concernée</Label>
					{#if bookings.length === 0}
						<p class="text-xs text-slate-500">Aucune réservation éligible trouvée.</p>
					{:else}
						<Select.Root type="single" name="bookingId" bind:value={selectedBookingId}>
							<Select.Trigger class="w-full">
								{selectedBooking ? `${selectedBooking.listing.title} (${selectedBooking.listing.city})` : 'Sélectionner une réservation'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Label>Réservations Couvertes</Select.Label>
									{#each bookings as b (b.id)}
										<Select.Item value={b.id} label={b.listing.title}>
											{b.listing.title} ({b.listing.city}) — {b.insurancePolicy?.policyNumber || 'Police Active'}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					{/if}
				</div>

				<!-- Damage Type -->
				<div class="flex flex-col gap-1.5">
					<Label>Nature des Dommages</Label>
					<Select.Root type="single" name="damageType" bind:value={damageType}>
						<Select.Trigger class="w-full">
							{triggerDamageLabel}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Types de Dégâts</Select.Label>
								{#each damageTypes as d (d.value)}
									<Select.Item value={d.value} label={d.label}>
										{d.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Estimated Cost -->
				<div class="flex flex-col gap-1.5">
					<Label for="claim-cost">Estimation du préjudice (€)</Label>
					<InputGroup.Root>
						<InputGroup.Input
							id="claim-cost"
							type="number"
							bind:value={estimatedCost}
							required
							placeholder="Ex: 850 €"
						/>
					</InputGroup.Root>
				</div>

				<!-- Detailed Description -->
				<div class="flex flex-col gap-1.5">
					<Label for="claim-desc">Description détaillée des circonstances</Label>
					<Textarea
						id="claim-desc"
						bind:value={description}
						required
						rows={5}
						placeholder="Décrivez précisément l'origine du sinistre, les objets dégradés et les circonstances..."
					/>
				</div>

				<!-- Submit Button -->
				<Button
					type="submit"
					variant="default"
					disabled={loading || bookings.length === 0}
					class="w-full gap-2 bg-slate-950 py-3.5 text-sm font-bold text-white hover:bg-slate-800"
				>
					{loading ? 'Enregistrement du dossier...' : 'Transmettre la Déclaration à Wakam'}
					<ArrowRight class="h-4 w-4" />
				</Button>
			</form>
		</Card>
	{/if}
</div>
