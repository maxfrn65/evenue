<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import {
		Building2,
		ArrowLeft,
		Save,
		ShieldCheck,
		MapPin,
		Euro,
		Users,
		Image as ImageIcon,
		Plus,
		Trash2,
		UploadCloud,
		Calendar
	} from '@lucide/svelte';

	export interface ListingFormData {
		title: string;
		description: string;
		address: string;
		city: string;
		zipCode: string;
		pricePerNight: number;
		securityDeposit: number;
		maxCapacity: number;
		eventTypeAllowed: string[];
		imageUrl: string;
		imageUrls: string[];
		icalSyncUrl?: string;
	}

	interface Props {
		mode: 'create' | 'edit';
		listing?: any;
		cancelHref: string;
		onSubmit: (data: ListingFormData) => Promise<void>;
		loading?: boolean;
		errorMessage?: string;
		successMessage?: string;
	}

	let {
		mode,
		listing = null,
		cancelHref,
		onSubmit,
		loading = false,
		errorMessage = '',
		successMessage = ''
	}: Props = $props();

	let title = $state('');
	let description = $state('');
	let address = $state('');
	let city = $state('');
	let zipCode = $state('');
	let pricePerNight = $state<number>(500);
	let securityDeposit = $state<number>(500);
	let maxCapacity = $state<number>(30);
	let imagesList = $state<string[]>([]);
	let eventTypesList = $state<string[]>(['SOIRÉE', 'ANNIVERSAIRE']);
	let icalSyncUrl = $state('');

	let uploading = $state(false);
	let uploadError = $state('');

	$effect(() => {
		if (listing) {
			title = listing.title || '';
			description = listing.description || '';
			address = listing.address || '';
			city = listing.city || '';
			zipCode = listing.zipCode || '';
			pricePerNight = listing.pricePerNight || 500;
			securityDeposit = listing.securityDeposit || 500;
			maxCapacity = listing.maxCapacity || 30;
			imagesList =
				listing.imageUrls && listing.imageUrls.length > 0
					? [...listing.imageUrls]
					: listing.imageUrl
						? [listing.imageUrl]
						: [];
			eventTypesList = listing.eventTypeAllowed || ['SOIRÉE', 'ANNIVERSAIRE'];
			icalSyncUrl = listing.icalSyncUrl || '';
		}
	});

	const allEventTypes = [
		{ value: 'SOIRÉE', label: 'Soirée privée' },
		{ value: 'ANNIVERSAIRE', label: 'Anniversaire' },
		{ value: 'MARIAGE', label: 'Mariage / Réception' },
		{ value: 'COCKTAIL', label: 'Cocktail professionnel' }
	];

	function toggleEventType(val: string) {
		if (eventTypesList.includes(val)) {
			eventTypesList = eventTypesList.filter((t) => t !== val);
		} else {
			eventTypesList = [...eventTypesList, val];
		}
	}

	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		uploading = true;
		uploadError = '';

		const formData = new FormData();
		for (let i = 0; i < target.files.length; i++) {
			formData.append('files', target.files[i]);
		}

		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});
			const resData = await res.json();
			if (!res.ok || !resData.success) {
				throw new Error(resData.error || 'Erreur lors du téléversement.');
			}
			imagesList = [...imagesList, ...resData.urls];
		} catch (err: any) {
			uploadError = err.message;
		} finally {
			uploading = false;
			target.value = '';
		}
	}

	function removeImage(index: number) {
		imagesList = imagesList.filter((_, i) => i !== index);
	}

	async function handleFormSubmit(e: Event) {
		e.preventDefault();
		await onSubmit({
			title,
			description,
			address,
			city,
			zipCode,
			pricePerNight: Number(pricePerNight),
			securityDeposit: Number(securityDeposit),
			maxCapacity: Number(maxCapacity),
			eventTypeAllowed: eventTypesList,
			imageUrl: imagesList[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
			imageUrls: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
			icalSyncUrl: icalSyncUrl.trim()
		});
	}
</script>

<div class="space-y-6">
	{#if errorMessage || uploadError}
		<div class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700">
			{errorMessage || uploadError}
		</div>
	{/if}

	{#if successMessage}
		<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800">
			{successMessage}
		</div>
	{/if}

	<Card class="border-slate-200 p-6 sm:p-8">
		<form onsubmit={handleFormSubmit} class="space-y-6">
			<!-- Title -->
			<div class="flex flex-col gap-1.5">
				<Label for="listing-title">Titre de l'annonce</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Building2 />
					</InputGroup.Addon>
					<InputGroup.Input
						id="listing-title"
						type="text"
						bind:value={title}
						placeholder="Ex: Loft d'Artiste & Rooftop Privatif"
						required
					/>
				</InputGroup.Root>
			</div>

			<!-- Location fields -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="flex flex-col gap-1.5 sm:col-span-2">
					<Label for="listing-address">Adresse</Label>
					<InputGroup.Root>
						<InputGroup.Addon>
							<MapPin />
						</InputGroup.Addon>
						<InputGroup.Input
							id="listing-address"
							type="text"
							bind:value={address}
							placeholder="25 Rue exemple"
							required
						/>
					</InputGroup.Root>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="listing-city">Ville</Label>
					<InputGroup.Root>
						<InputGroup.Input id="listing-city" type="text" bind:value={city} placeholder="Paris" required />
					</InputGroup.Root>
				</div>
			</div>

			<!-- Pricing & Capacity -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="flex flex-col gap-1.5">
					<Label for="listing-price">Prix par soirée (€)</Label>
					<InputGroup.Root>
						<InputGroup.Addon>
							<Euro />
						</InputGroup.Addon>
						<InputGroup.Input id="listing-price" type="number" min="1" bind:value={pricePerNight} required />
					</InputGroup.Root>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="listing-deposit">Caution séquestrée (€)</Label>
					<InputGroup.Root>
						<InputGroup.Addon>
							<ShieldCheck />
						</InputGroup.Addon>
						<InputGroup.Input id="listing-deposit" type="number" min="0" bind:value={securityDeposit} required />
					</InputGroup.Root>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="listing-capacity">Capacité max convives</Label>
					<InputGroup.Root>
						<InputGroup.Addon>
							<Users />
						</InputGroup.Addon>
						<InputGroup.Input id="listing-capacity" type="number" min="1" bind:value={maxCapacity} required />
					</InputGroup.Root>
				</div>
			</div>

			<!-- Gallery Images Section -->
			<div class="flex flex-col gap-2">
				<Label>Photos du Logement (Téléversement)</Label>
				<p class="text-[11px] text-slate-500">Téléversez les photos de votre bien (formats JPG, PNG, WEBP acceptés).</p>

				{#if imagesList.length > 0}
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 my-2">
						{#each imagesList as img, idx (idx)}
							<div class="relative group h-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
								<img src={img} alt={`Photo ${idx + 1}`} referrerpolicy="no-referrer" class="h-full w-full object-cover" />
								<button
									type="button"
									onclick={() => removeImage(idx)}
									class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow hover:bg-rose-700"
								>
									<Trash2 class="h-3.5 w-3.5" />
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- File Dropzone Input -->
				<label class="flex flex-col items-center justify-center border-2 border-dashed border-purple-200 bg-purple-50/30 hover:bg-purple-50/70 rounded-2xl p-6 cursor-pointer transition-all">
					<UploadCloud class="h-8 w-8 text-purple-600 mb-2" />
					<span class="text-xs font-semibold text-slate-900">
						{uploading ? 'Téléversement en cours...' : 'Cliquez ou glissez-déposez vos images ici'}
					</span>
					<span class="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP jusqu'à 10 Mo</span>
					<input
						type="file"
						accept="image/*"
						multiple
						disabled={uploading}
						onchange={handleFileUpload}
						class="hidden"
					/>
				</label>
			</div>

			<!-- Event Types Checkboxes -->
			<div class="flex flex-col gap-2">
				<Label>Événements autorisés</Label>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{#each allEventTypes as et (et.value)}
						<button
							type="button"
							onclick={() => toggleEventType(et.value)}
							class={`rounded-xl border p-3 text-xs font-semibold transition-all text-left ${
								eventTypesList.includes(et.value)
									? 'border-slate-600 bg-slate-50 text-slate-950'
									: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
							}`}
						>
							{et.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- iCal Sync URL -->
			<div class="flex flex-col gap-1.5">
				<Label for="listing-ical">Importation Calendrier iCal (.ics) — Synchronisation Tiers</Label>
				<p class="text-[11px] text-slate-500">Insérez l'URL d'export iCal de votre annonce Airbnb ou Booking.com pour bloquer automatiquement les dates indisponibles.</p>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Calendar />
					</InputGroup.Addon>
					<InputGroup.Input
						id="listing-ical"
						type="url"
						bind:value={icalSyncUrl}
						placeholder="https://www.airbnb.com/calendar/ical/12345.ics?t=..."
					/>
				</InputGroup.Root>
			</div>

			<!-- Description -->
			<div class="flex flex-col gap-1.5">
				<Label for="listing-desc">Description complète</Label>
				<Textarea
					id="listing-desc"
					bind:value={description}
					rows={5}
					placeholder="Présentez les équipements, l'insonorisation, les espaces et l'accès..."
					required
				/>
			</div>

			<!-- Submit Buttons -->
			<div class="flex justify-end gap-4 pt-4">
				<Button href={cancelHref} variant="outline">
					Annuler
				</Button>
				<Button
					type="submit"
					variant="default"
					disabled={loading || uploading}
				>
					<Save class="h-4 w-4" />
					{loading
						? mode === 'create' ? 'Publication...' : 'Enregistrement...'
						: mode === 'create' ? 'Publier mon annonce' : 'Enregistrer les modifications'}
				</Button>
			</div>
		</form>
	</Card>
</div>
