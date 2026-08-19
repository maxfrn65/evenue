<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import {
		Search,
		MapPin,
		Calendar,
		Users,
		X,
		Check,
		RotateCcw,
		PartyPopper
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let {
		variant = 'hero',
		initialCity = '',
		initialStartDate = '',
		initialEndDate = '',
		initialMinCapacity = undefined as number | undefined,
		initialEventType = '',
		onsearch = undefined as ((filters: Record<string, string>) => void) | undefined
	} = $props();

	// Writable deriveds: they follow the props on navigation, and the handlers below can
	// still overwrite them between two navigations. The previous $state + $effect pair only
	// captured the initial value, which is what svelte-check kept flagging.
	let selectedCity = $derived(initialCity);
	let cityInput = $state('');
	let showCityDropdown = $state(false);
	let availableCities = $state<string[]>([
		'Paris',
		'Marseille',
		'Aix-en-Provence',
		'Lyon',
		'Nice',
		'Bordeaux',
		'Toulouse',
		'Lille'
	]);

	let startDate = $derived(initialStartDate);
	let endDate = $derived(initialEndDate);
	let minCapacity = $derived<number | undefined>(initialMinCapacity);
	let eventType = $derived(initialEventType);

	onMount(async () => {
		try {
			const res = await fetch('/api/listings/cities');
			const data = await res.json();
			if (data.success && Array.isArray(data.cities)) {
				availableCities = data.cities;
			}
		} catch (e) {
			console.error('Failed to load cities:', e);
		}
	});

	const eventTypes = [
		{ value: '', label: 'Tous événements' },
		{ value: 'SOIRÉE', label: 'Soirée privée' },
		{ value: 'ANNIVERSAIRE', label: 'Anniversaire' },
		{ value: 'MARIAGE', label: 'Mariage / Réception' },
		{ value: 'COCKTAIL', label: 'Cocktail professionnel' }
	];

	const eventTypeLabel = $derived(
		eventTypes.find((e) => e.value === eventType)?.label ?? 'Tous événements'
	);

	const filteredCities = $derived(
		availableCities.filter((c) => c.toLowerCase().includes(cityInput.toLowerCase().trim()))
	);

	function selectCity(city: string) {
		selectedCity = city;
		cityInput = '';
		showCityDropdown = false;
	}

	function removeCityTag() {
		selectedCity = '';
		cityInput = '';
		showCityDropdown = true;
	}

	function handleReset() {
		selectedCity = '';
		cityInput = '';
		startDate = '';
		endDate = '';
		minCapacity = undefined;
		eventType = '';

		if (onsearch) {
			onsearch({});
		} else {
			goto(resolve('/listings'));
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		showCityDropdown = false;

		// Plain URLSearchParams on purpose: this instance is a local builder for the
		// query string, never reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams();
		if (selectedCity) params.set('city', selectedCity);
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		if (minCapacity) params.set('minCapacity', minCapacity.toString());
		if (eventType) params.set('eventType', eventType);

		const filtersObj = Object.fromEntries(params.entries());

		if (onsearch) {
			onsearch(filtersObj);
		} else {
			goto(resolve(`/listings?${params.toString()}`));
		}
	}
</script>

<Card.Root
	class={`overflow-visible border-slate-200 p-4 text-left shadow-lg md:p-6 ${variant === 'hero' ? 'bg-white' : 'bg-slate-50/50'}`}
>
	<form onsubmit={handleSubmit} class="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
		<!-- City Autocomplete & Tag Field -->
		<div class="relative flex flex-col gap-1.5 md:col-span-4">
			<Label for="search-city-input" class="text-xs font-bold text-slate-700"
				>Ville / Destination</Label
			>
			<div class="relative flex items-center">
				{#if selectedCity}
					<!-- Selected City Tag/Pill -->
					<div
						class="flex h-10 w-full items-center gap-2 rounded-lg border border-purple-300 bg-purple-50/80 px-3"
					>
						<MapPin class="h-4 w-4 shrink-0" />
						<span class="flex-1 truncate text-xs font-bold text-purple-950">{selectedCity}</span>
						<button
							type="button"
							onclick={removeCityTag}
							class="flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 text-purple-900 transition-colors hover:bg-purple-300"
							title="Supprimer la ville"
						>
							<X class="h-3 w-3" />
						</button>
					</div>
				{:else}
					<!-- City Input search -->
					<InputGroup.Root class="w-full">
						<InputGroup.Addon>
							<MapPin class="h-4 w-4 text-slate-400" />
						</InputGroup.Addon>
						<InputGroup.Input
							id="search-city-input"
							type="text"
							bind:value={cityInput}
							onfocus={() => (showCityDropdown = true)}
							onkeydown={(e) => {
								if (e.key === 'Escape') showCityDropdown = false;
							}}
							placeholder="Rechercher une ville (Paris, Marseille...)"
							autocomplete="off"
						/>
					</InputGroup.Root>
				{/if}
			</div>

			<!-- Autocomplete Suggestions Dropdown -->
			{#if showCityDropdown && !selectedCity}
				<div
					class="absolute top-full left-0 z-100 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
				>
					<div class="px-2 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
						Villes Disponibles
					</div>
					{#if filteredCities.length === 0}
						<div class="px-3 py-2 text-xs text-slate-500">Aucune ville trouvée.</div>
					{:else}
						{#each filteredCities as cityOption (cityOption)}
							<button
								type="button"
								onclick={() => selectCity(cityOption)}
								class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-800 transition-colors hover:bg-purple-50 hover:text-purple-950"
							>
								<span class="flex items-center gap-2">
									<MapPin class="h-3.5 w-3.5 text-purple-600" />
									{cityOption}
								</span>
								{#if selectedCity === cityOption}
									<Check class="h-4 w-4 text-purple-700" />
								{/if}
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</div>

		<!-- Date Range Selection (Airbnb style) -->
		<div class="grid grid-cols-2 gap-2 md:col-span-4">
			<!-- Start Date -->
			<div class="flex flex-col gap-1.5">
				<Label for="search-start-date" class="text-xs font-bold text-slate-700">Début</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Calendar class="h-4 w-4 text-slate-400" />
					</InputGroup.Addon>
					<InputGroup.Input id="search-start-date" type="date" bind:value={startDate} />
				</InputGroup.Root>
			</div>

			<!-- End Date -->
			<div class="flex flex-col gap-1.5">
				<Label for="search-end-date" class="text-xs font-bold text-slate-700">Fin</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Calendar class="h-4 w-4 text-slate-400" />
					</InputGroup.Addon>
					<InputGroup.Input id="search-end-date" type="date" bind:value={endDate} />
				</InputGroup.Root>
			</div>
		</div>

		<!-- Capacity & Filters -->
		<div class="flex flex-col gap-1.5 md:col-span-2">
			<Label for="search-capacity" class="text-xs font-bold text-slate-700">Capacité min.</Label>
			<InputGroup.Root>
				<InputGroup.Addon>
					<Users class="h-4 w-4 text-slate-400" />
				</InputGroup.Addon>
				<InputGroup.Input
					id="search-capacity"
					type="number"
					min="1"
					placeholder="Ex: 50"
					bind:value={minCapacity}
				/>
			</InputGroup.Root>
		</div>

		<!-- Event Type -->
		<div class="flex flex-col gap-1.5 md:col-span-2">
			<Label for="search-event-type" class="text-xs font-bold text-slate-700">Événement</Label>
			<Select.Root type="single" name="eventType" bind:value={eventType}>
				<Select.Trigger id="search-event-type" class="w-full">
					<span class="flex items-center gap-2 truncate">
						<PartyPopper class="h-4 w-4 shrink-0 text-slate-400" />
						{eventTypeLabel}
					</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Label>Type d'événement</Select.Label>
						{#each eventTypes as type (type.value)}
							<Select.Item value={type.value} label={type.label}>{type.label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Submit Action Button -->
		<div class="flex gap-2 md:col-span-12">
			<Button
				type="submit"
				variant="default"
				class="h-10 flex-1 gap-2 bg-slate-950 font-bold text-white hover:bg-slate-800"
			>
				<Search class="h-4 w-4" />
				Rechercher
			</Button>

			{#if selectedCity || startDate || endDate || minCapacity || eventType}
				<Button
					type="button"
					variant="outline"
					size="icon"
					onclick={handleReset}
					class="h-10 w-10 shrink-0 border-slate-200 text-slate-600 hover:bg-slate-100"
					title="Réinitialiser les filtres"
				>
					<RotateCcw class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	</form>
</Card.Root>
