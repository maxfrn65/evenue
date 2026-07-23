<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import {
		Calendar,
		Home,
		ShieldCheck,
		TrendingUp,
		MapPin,
		Users,
		PlusCircle,
		X,
		Eye,
		LayoutDashboard,
		CalendarDays,
		Wallet,
		Building2,
		FileText,
		AlertTriangle,
		Pencil,
		Trash2,

		CirclePlus

	} from '@lucide/svelte';

	let { data } = $props();
	const user = $derived(data.user);
	const dashboard = $derived(data.dashboard);

	let cancellingId = $state<string | null>(null);

	function formatDate(date: string | Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
	}

	function isClaimWindowActive(endDateStr: string | Date): { active: boolean; reason?: string } {
		const now = new Date();
		const end = new Date(endDateStr);
		const diffHours = (now.getTime() - end.getTime()) / (1000 * 60 * 60);

		if (diffHours < 0) {
			return { active: false, reason: 'Réservation non terminée' };
		}
		if (diffHours > 7 * 24) {
			return { active: false, reason: 'Délai 7j expiré' };
		}
		return { active: true };
	}

	function getStatusVariant(
		status: string
	): 'default' | 'secondary' | 'outline' | 'emerald' | 'amber' {
		switch (status) {
			case 'CONFIRMED':
				return 'emerald';
			case 'COMPLETED':
				return 'secondary';
			case 'PENDING_PAYMENT':
				return 'outline';
			case 'CANCELLED':
			case 'DISPUTED':
				return 'amber';
			default:
				return 'secondary';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'CONFIRMED':
				return 'Confirmée';
			case 'COMPLETED':
				return 'Terminée';
			case 'PENDING_PAYMENT':
				return 'En attente';
			case 'CANCELLED':
				return 'Annulée';
			case 'DISPUTED':
				return 'Litige';
			default:
				return status;
		}
	}

	function getInsuranceStatusLabel(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return 'Active';
			case 'PENDING':
				return 'En cours';
			case 'CLAIMED':
				return 'Sinistre';
			case 'EXPIRED':
				return 'Expirée';
			case 'FAILED':
				return 'Échec';
			default:
				return status;
		}
	}

	async function handleCancel(bookingId: string) {
		if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
		cancellingId = bookingId;

		try {
			const res = await fetch('/api/bookings/cancel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bookingId })
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				alert(data.error || 'Erreur lors de l\'annulation.');
			} else {
				window.location.reload();
			}
		} catch (e: any) {
			alert(e.message || 'Erreur réseau.');
		} finally {
			cancellingId = null;
		}
	}

	let deletingListingId = $state<string | null>(null);

	async function handleDeleteListing(listingId: string) {
		if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) return;
		deletingListingId = listingId;

		try {
			const res = await fetch(`/api/listings/${listingId}`, {
				method: 'DELETE'
			});
			const resData = await res.json();
			if (!res.ok || !resData.success) {
				alert(resData.error || 'Erreur lors de la suppression.');
			} else {
				window.location.reload();
			}
		} catch (e: any) {
			alert(e.message || 'Erreur réseau.');
		} finally {
			deletingListingId = null;
		}
	}
</script>

<div class="mx-auto max-w-7xl space-y-8 bg-white px-4 py-10 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-950">
				Mon espace
			</h1>
			<p class="mt-1 text-sm text-slate-500">
				Bienvenue, {user.firstName}. Gérez vos réservations et vos annonces.
			</p>
		</div>
		{#if user.role === 'HOST'}
			<Button href="/listings/new" class="gap-2">
				<PlusCircle class="h-4 w-4" />
				Publier une annonce
			</Button>
		{:else}
			<Button href="/become-host" variant="outline">
				<CirclePlus class="h-4 w-4" />
				Devenir hôte et publier
			</Button>
		{/if}
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<Card.Root class="border-slate-200 p-4">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
					<CalendarDays class="h-5 w-5 text-slate-600" />
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">Réservations</p>
					<p class="text-2xl font-bold text-slate-950">{dashboard.stats.totalBookings}</p>
				</div>
			</div>
		</Card.Root>

		<Card.Root class="border-slate-200 p-4">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
					<Calendar class="h-5 w-5 text-slate-600" />
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">À venir</p>
					<p class="text-2xl font-bold text-slate-950">{dashboard.stats.upcomingBookings}</p>
				</div>
			</div>
		</Card.Root>

		<Card.Root class="border-slate-200 p-4">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
					<Wallet class="h-5 w-5 text-slate-600" />
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">Total dépensé</p>
					<p class="text-2xl font-bold text-slate-950">{formatCurrency(dashboard.stats.totalSpent)}</p>
				</div>
			</div>
		</Card.Root>

		{#if user.role === 'HOST'}
			<Card.Root class="border-slate-200 p-4">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
						<TrendingUp class="h-5 w-5 text-slate-600" />
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500">Revenus hôte</p>
						<p class="text-2xl font-bold text-slate-950">{formatCurrency(dashboard.stats.totalEarnings)}</p>
					</div>
				</div>
			</Card.Root>
		{:else}
			<Card.Root class="border-slate-200 p-4">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
						<ShieldCheck class="h-5 w-5 text-slate-600" />
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500">Assurance</p>
						<p class="text-2xl font-bold text-slate-950">Wakam</p>
					</div>
				</div>
			</Card.Root>
		{/if}
	</div>

	<Separator />

	<!-- Bookings Section -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="flex items-center gap-2 text-xl font-bold text-slate-950">
				<Calendar class="h-5 w-5" />
				Mes réservations
			</h2>
			<Badge variant="secondary">{dashboard.bookings.length} réservation{dashboard.bookings.length > 1 ? 's' : ''}</Badge>
		</div>

		{#if dashboard.bookings.length === 0}
			<Card.Root class="border-slate-200 p-8 text-center">
				<p class="text-sm text-slate-500">Aucune réservation pour le moment.</p>
				<Button href="/listings" variant="outline" class="mt-4 gap-2">
					Explorer les lieux
				</Button>
			</Card.Root>
		{:else}
			<div class="space-y-3">
				{#each dashboard.bookings as booking (booking.id)}
					<Card.Root class="border-slate-200 p-4">
						<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div class="flex-1 space-y-1">
								<div class="flex items-center gap-2">
									<a href={`/listings/${booking.listing.id}`} class="text-sm font-semibold text-slate-950 hover:underline">
										{booking.listing.title}
									</a>
									<Badge variant={getStatusVariant(booking.status)}>{getStatusLabel(booking.status)}</Badge>
								</div>
								<div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
									<span class="flex items-center gap-1">
										<MapPin class="h-3 w-3" />
										{booking.listing.city}
									</span>
									<span class="flex items-center gap-1">
										<Calendar class="h-3 w-3" />
										{formatDate(booking.startDate)} — {formatDate(booking.endDate)}
									</span>
									{#if booking.insurancePolicy}
										<span class="flex items-center gap-1">
											<ShieldCheck class="h-3 w-3" />
											Wakam {booking.insurancePolicy.policyNumber}
											<Badge variant="outline" class="text-[10px]">
												{getInsuranceStatusLabel(booking.insurancePolicy.status)}
											</Badge>
										</span>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-3">
								<span class="text-sm font-bold text-slate-950">
									{formatCurrency(booking.totalPrice)}
								</span>

								<Button href={`/listings/${booking.listing.id}`} variant="outline" size="sm" class="gap-1">
									<Eye class="h-3.5 w-3.5" />
									Voir
								</Button>

								{#if booking.insurancePolicy}
									<Button href={`/bookings/${booking.id}/certificate`} target="_blank" variant="outline" size="sm" class="gap-1">
										<FileText class="h-3.5 w-3.5 text-emerald-600" />
										Attestation PDF
									</Button>

									{#if booking.status === 'DISPUTED'}
										<Badge variant="amber" class="gap-1">
											<AlertTriangle class="h-3 w-3" />
											Sinistre déclaré par l'hôte
										</Badge>
									{/if}
								{/if}

								{#if booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT'}
									<Button
										variant="destructive"
										size="sm"
										class="gap-1"
										disabled={cancellingId === booking.id}
										onclick={() => handleCancel(booking.id)}
									>
										<X class="h-3.5 w-3.5" />
										{cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
									</Button>
								{/if}
							</div>
						</div>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Host Received Bookings Section (Claims Host Portal) -->
	{#if user.role === 'HOST'}
		<Separator />

		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-xl font-bold text-slate-950">
					<ShieldCheck class="h-5 w-5" />
					Réservations reçues
				</h2>
			</div>

			{#if !dashboard.hostReceivedBookings || dashboard.hostReceivedBookings.length === 0}
				<Card.Root class="border-slate-200 p-6 text-center">
					<p class="text-xs text-slate-500">Aucune réservation reçue sur vos annonces pour le moment.</p>
				</Card.Root>
				{:else}
				<div class="space-y-3">
					{#each dashboard.hostReceivedBookings as rBooking (rBooking.id)}
						<Card.Root>
							<div class="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
								<div class="flex-1 space-y-1">
									<div class="flex items-center gap-2">
										<a href={`/listings/${rBooking.listing.id}`} class="text-sm font-bold text-slate-950 hover:underline">
											{rBooking.listing.title}
										</a>
										<Badge variant={getStatusVariant(rBooking.status)}>{getStatusLabel(rBooking.status)}</Badge>
									</div>
									<div class="flex flex-wrap items-center gap-3 text-xs text-slate-600">
										<span class="font-semibold">
											Invité : {rBooking.guest?.firstName} {rBooking.guest?.lastName}
										</span>
										<span class="flex items-center gap-1 text-slate-500">
											<Calendar class="h-3 w-3" />
											{formatDate(rBooking.startDate)} — {formatDate(rBooking.endDate)}
										</span>
										{#if rBooking.insurancePolicy}
											<span class="flex items-center gap-1 text-emerald-700 font-medium">
												<ShieldCheck class="h-3 w-3" />
												Police Wakam {rBooking.insurancePolicy.policyNumber}
											</span>
										{/if}
									</div>
								</div>

								<div class="flex items-center gap-3">
									<span class="text-sm font-bold text-slate-950">
										{formatCurrency(rBooking.totalPrice)}
									</span>

									{#if isClaimWindowActive(rBooking.endDate).active}
										<Button
											href={`/claims/new?bookingId=${rBooking.id}`}
											variant="default"
											size="sm"
											class="gap-1.5 bg-purple-700 text-white hover:bg-purple-800 font-semibold"
										>
											<AlertTriangle class="h-3.5 w-3.5" />
											Déclarer un sinistre
										</Button>
									{:else}
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button
														disabled={true}
														variant="outline"
														size="sm"
														class="gap-1.5 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
													>
														<AlertTriangle class="h-3.5 w-3.5" />
														Sinistre indisponible
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p>{isClaimWindowActive(rBooking.endDate).reason}</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</Tooltip.Provider>
									{/if}
								</div>
							</div>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</section>

		<Separator />

		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-xl font-bold text-slate-950">
					<Building2 class="h-5 w-5" />
					Mes annonces
				</h2>
				<Badge variant="secondary">{dashboard.listings.length} annonce{dashboard.listings.length > 1 ? 's' : ''}</Badge>
			</div>

			{#if dashboard.listings.length === 0}
				<Card.Root class="border-slate-200 p-8 text-center flex justify-center items-center">
					<p class="text-sm text-slate-500">Vous n'avez publié aucune annonce.</p>
					<Button href="/listings/new" class="w-fit">
						<CirclePlus class="h-4 w-4" />
						Publier une annonce
					</Button>
				</Card.Root>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each dashboard.listings as listing (listing.id)}
						<Card.Root class="border-slate-200">
							<Card.Header>
								<Card.Title class="text-sm">{listing.title}</Card.Title>
								<Card.Description>
									<span class="flex items-center gap-1">
										<MapPin class="h-3 w-3" />
										{listing.city}
									</span>
								</Card.Description>
							</Card.Header>
							<Card.Content>
								<div class="grid grid-cols-3 gap-3 text-center">
									<div>
										<p class="text-lg font-bold text-slate-950">{listing._count.bookings}</p>
										<p class="text-[10px] text-slate-500">Réservations</p>
									</div>
									<div>
										<p class="text-lg font-bold text-slate-950">{formatCurrency(listing.totalRevenue)}</p>
										<p class="text-[10px] text-slate-500">Revenus</p>
									</div>
									<div>
										<p class="text-lg font-bold text-slate-950">{listing.maxCapacity}</p>
										<p class="text-[10px] text-slate-500">Capacité max</p>
									</div>
								</div>
							</Card.Content>
							<Card.Footer class="grid grid-cols-3 gap-2">
								<Button href={`/listings/${listing.id}`} variant="outline" size="sm" class="gap-1">
									<Eye class="h-3.5 w-3.5" />
									Voir
								</Button>
								<Button href={`/listings/${listing.id}/edit`} variant="outline" size="sm" class="gap-1">
									<Pencil class="h-3.5 w-3.5" />
									Éditer
								</Button>
								<Button
									variant="destructive"
									size="sm"
									class="gap-1 hover:cursor-pointer"
									disabled={deletingListingId === listing.id}
									onclick={() => handleDeleteListing(listing.id)}
								>
									<Trash2 class="h-3.5 w-3.5" />
									{deletingListingId === listing.id ? '...' : 'Suppr.'}
								</Button>
							</Card.Footer>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
