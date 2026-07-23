<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
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
				Mon Espace
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
			<Button href="/become-host" variant="outline" class="gap-2 border-purple-300 text-purple-900 hover:bg-purple-50">
				<PlusCircle class="h-4 w-4" />
				Devenir Hôte & Publier
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
				Mes Réservations
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

									{#if booking.insurancePolicy.status !== 'CLAIMED'}
										<Button href={`/claims/new?bookingId=${booking.id}`} variant="outline" size="sm" class="gap-1 text-amber-700 hover:text-amber-800">
											<AlertTriangle class="h-3.5 w-3.5" />
											Sinistre
										</Button>
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

	<!-- Host Listings Section (only for HOST role) -->
	{#if user.role === 'HOST'}
		<Separator />

		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-xl font-bold text-slate-950">
					<Building2 class="h-5 w-5" />
					Mes Annonces
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
