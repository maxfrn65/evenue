<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import CalendarWidget from '$lib/components/ui/calendar/calendar.svelte';
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
		ArrowLeft,
		Pencil,
		ChevronLeft,
		ChevronRight,
		Calendar,
		MessageSquare,
		FileText,
		AlertTriangle
	} from '@lucide/svelte';

	let { data }: { data: { listing: any; user?: any; existingUserBooking?: any; availabilityInfo?: any } } = $props();

	const listing = $derived(data.listing);
	const user = $derived(data.user);
	const existingBooking = $derived(data.existingUserBooking);
	const availabilityInfo = $derived(data.availabilityInfo || { disabledRanges: [] });

	function isDateDisabled(dateVal: any) {
		const dateStr = `${dateVal.year}-${String(dateVal.month).padStart(2, '0')}-${String(dateVal.day).padStart(2, '0')}`;
		const todayStr = new Date().toISOString().split('T')[0];
		if (dateStr < todayStr) return true;

		const ranges = availabilityInfo.availabilityRanges || [];
		if (ranges.length > 0) {
			const isInsideAnyRange = ranges.some(
				(r: any) => dateStr >= r.startDate && dateStr <= r.endDate
			);
			if (!isInsideAnyRange) return true;
		} else {
			if (availabilityInfo.availableStartDate && dateStr < availabilityInfo.availableStartDate) {
				return true;
			}
			if (availabilityInfo.availableEndDate && dateStr > availabilityInfo.availableEndDate) {
				return true;
			}
		}

		if (availabilityInfo.disabledRanges) {
			for (const range of availabilityInfo.disabledRanges) {
				if (dateStr >= range.startDate && dateStr < range.endDate) {
					return true;
				}
			}
		}

		return false;
	}
	const isOwner = $derived(
		user && (user.id === listing.hostId || (listing.host && user.id === listing.host.id))
	);

	let activeImageIndex = $state(0);
	const galleryImages = $derived(
		listing.imageUrls && listing.imageUrls.length > 0
			? listing.imageUrls
			: [listing.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80']
	);

	function prevImage() {
		activeImageIndex = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length;
	}

	function nextImage() {
		activeImageIndex = (activeImageIndex + 1) % galleryImages.length;
	}
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

		<!-- Interactive Image Carousel -->
		<div class="space-y-3">
			<Card class="group relative h-96 overflow-hidden rounded-2xl border-slate-200">
				<img
					src={galleryImages[activeImageIndex]}
					alt={`${listing.title} - Photo ${activeImageIndex + 1}`}
					referrerpolicy="no-referrer"
					class="h-full w-full object-cover transition-all duration-300"
				/>

				{#if galleryImages.length > 1}
					<!-- Prev / Next Controls -->
					<button
						type="button"
						onclick={prevImage}
						aria-label="Image précédente"
						class="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-110"
					>
						<ChevronLeft class="h-6 w-6" />
					</button>

					<button
						type="button"
						onclick={nextImage}
						aria-label="Image suivante"
						class="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-110"
					>
						<ChevronRight class="h-6 w-6" />
					</button>

					<!-- Image Counter Badge -->
					<div class="absolute bottom-4 right-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
						{activeImageIndex + 1} / {galleryImages.length}
					</div>
				{/if}

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

			<!-- Gallery Thumbnails Bar -->
			{#if galleryImages.length > 1}
				<div class="flex items-center gap-3 pb-1">
					{#each galleryImages as imgUrl, idx (idx)}
						<button
							type="button"
							onclick={() => (activeImageIndex = idx)}
							class={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
								activeImageIndex === idx ? 'border-slate-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
							}`}
						>
							<img src={imgUrl} alt={`Vignette ${idx + 1}`} referrerpolicy="no-referrer" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>
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

				<!-- Interactive Calendar Availability Preview -->
				<div class="space-y-2 border-t border-slate-100 pt-4">
					<div class="flex items-center justify-between text-xs font-bold text-slate-900">
						<span>Calendrier des disponibilités</span>
						<span class="text-[10px] font-normal text-slate-500">Grisé = Indisponible</span>
					</div>
					<div class="flex justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-2">
						<CalendarWidget
							type="single"
							{isDateDisabled}
							class="rounded-md"
						/>
					</div>
				</div>

				<div
					class="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-slate-950"
				>
					<span>Total à régler</span>
					<span class="text-xl text-slate-950">{listing.pricePerNight} €</span>
				</div>

				{#if isOwner}
					<div class="space-y-2">
						<Button
							href={`/listings/${listing.id}/edit`}
							variant="default"
							class="w-full gap-2 bg-purple-700 py-3.5 text-sm font-bold text-white hover:bg-purple-800"
						>
							<Pencil class="h-4 w-4" />
							Éditer mon annonce
						</Button>

						<Button
							href={`/listings/${listing.id}/ical`}
							target="_blank"
							variant="outline"
							size="sm"
							class="w-full gap-2 border-slate-200 text-slate-700"
						>
							<Calendar class="h-3.5 w-3.5 text-purple-600" />
							Exporter Calendrier iCal (.ics)
						</Button>
					</div>
				{:else if existingBooking}
					<!-- Guest already booked this listing -->
					<div class="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
						<div class="flex items-center gap-2 text-xs font-bold text-emerald-800">
							<CheckCircle2 class="h-4 w-4 text-emerald-600" />
							Réservation confirmée sur ce lieu
						</div>
						<p class="text-[11px] text-slate-600">
							Du {new Date(existingBooking.startDate).toLocaleDateString()} au {new Date(existingBooking.endDate).toLocaleDateString()}
						</p>

						<div class="space-y-2 pt-1">
							<Button
								href={`/bookings/${existingBooking.id}/certificate`}
								target="_blank"
								variant="default"
								class="w-full gap-2 bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
							>
								<FileText class="h-4 w-4" />
								Attestation Wakam (PDF)
							</Button>

							<Button
								href={`/claims/new?bookingId=${existingBooking.id}`}
								variant="outline"
								size="sm"
								class="w-full gap-2 border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50"
							>
								<AlertTriangle class="h-3.5 w-3.5" />
								Déclarer un sinistre
							</Button>

							<Button
								href={`/messages?hostId=${listing.hostId}&bookingId=${existingBooking.id}`}
								variant="outline"
								size="sm"
								class="w-full gap-2 border-slate-200 text-xs text-slate-700"
							>
								<MessageSquare class="h-3.5 w-3.5 text-purple-600" />
								Contacter l'Hôte
							</Button>
						</div>
					</div>
				{:else}
					<div class="space-y-2">
						<Button
							href={`/bookings/new?listingId=${listing.id}`}
							variant="default"
							class="w-full gap-2 bg-slate-950 py-3.5 text-sm font-bold text-white hover:bg-slate-800"
						>
							Continuer vers la réservation
							<ArrowRight class="h-4 w-4" />
						</Button>

						<Button
							href={`/messages?hostId=${listing.hostId}`}
							variant="outline"
							size="sm"
							class="w-full gap-2 border-slate-200 text-slate-700"
						>
							<MessageSquare class="h-3.5 w-3.5 text-purple-600" />
							Contacter l'Hôte
						</Button>
					</div>
				{/if}

				<p class="text-center text-[10px] text-slate-500">
					Séquestre sécurisé via Stripe Connect. L'assurance Wakam est générée au paiement.
				</p>
			</Card>
		</div>
	</div>
</div>
