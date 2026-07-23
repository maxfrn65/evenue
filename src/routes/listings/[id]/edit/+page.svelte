<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import ListingForm, { type ListingFormData } from '$lib/components/ListingForm.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let { data } = $props();
	const listing = $derived(data.listing);

	let loading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	async function handleSubmit(formData: ListingFormData) {
		loading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const res = await fetch(`/api/listings/${listing.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const resData = await res.json();
			if (!res.ok || !resData.success) {
				throw new Error(resData.error || 'Erreur lors de la modification.');
			}

			successMessage = 'Annonce mise à jour avec succès !';
			setTimeout(() => {
				goto(`/listings/${listing.id}`);
			}, 1000);
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
		<Button href={`/listings/${listing.id}`} variant="ghost" size="sm" class="gap-1 text-slate-600">
			<ArrowLeft class="h-4 w-4" />
			Retour à la fiche
		</Button>
		<Badge variant="purple">Mode Édition Hôte</Badge>
	</div>

	<div class="space-y-2 text-center">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950">
			Éditer mon annonce
		</h1>
		<p class="text-xs text-slate-500">
			Mettez à jour les informations, la capacité, les tarifs et la photo de votre logement.
		</p>
	</div>

	<ListingForm
		mode="edit"
		{listing}
		cancelHref={`/listings/${listing.id}`}
		onSubmit={handleSubmit}
		{loading}
		{errorMessage}
		{successMessage}
	/>
</div>
