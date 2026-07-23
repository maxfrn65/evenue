<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import ListingForm, { type ListingFormData } from '$lib/components/ListingForm.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let { data } = $props();

	let loading = $state(false);
	let errorMessage = $state('');

	async function handleSubmit(formData: ListingFormData) {
		loading = true;
		errorMessage = '';

		try {
			const res = await fetch('/api/listings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const resData = await res.json();
			if (!res.ok || !resData.success) {
				throw new Error(resData.error || 'Erreur lors de la création de l\'annonce.');
			}

			goto(`/listings/${resData.listing.id}`);
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<Button href="/dashboard" variant="ghost" size="sm" class="gap-1 text-slate-600">
			<ArrowLeft class="h-4 w-4" />
			Retour au Dashboard
		</Button>
		<Badge variant="purple">Nouvelle Annonce Hôte</Badge>
	</div>

	<div class="space-y-2 text-center">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950">
			Publier une nouvelle annonce
		</h1>
		<p class="text-xs text-slate-500">
			Remplissez les détails de votre logement pour ouvrir vos réservations avec la protection Wakam.
		</p>
	</div>

	<ListingForm
		mode="create"
		cancelHref="/dashboard"
		onSubmit={handleSubmit}
		{loading}
		{errorMessage}
	/>
</div>
