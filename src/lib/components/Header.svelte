<script lang="ts">
	import { onMount } from 'svelte';
	import logoFull from '$lib/assets/full.png';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import {
		User,
		Search,
		PlusCircle,
		LogOut,
		ChevronDown,
		CirclePlus,
		LayoutDashboard,
		MessageSquare
	} from '@lucide/svelte';

	interface UserData {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	}

	let {
		user = null,
		unreadMessageCount = 0
	}: { user?: UserData | null; unreadMessageCount?: number } = $props();

	let unreadCount = $state(unreadMessageCount);

	$effect(() => {
		unreadCount = unreadMessageCount;
	});

	async function refreshUnreadCount() {
		if (!user) return;

		try {
			const response = await fetch('/api/messages/unread');
			const data = await response.json();
			if (response.ok && data.success) unreadCount = data.unreadCount;
		} catch {
			// Keep the last known count when the network is unavailable.
		}
	}

	onMount(() => {
		if (!user) return;

		const interval = window.setInterval(refreshUnreadCount, 15_000);
		return () => window.clearInterval(interval);
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/';
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-slate-200 bg-white transition-all"
>
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Brand Logo -->
		<a href="/" class="group flex items-center gap-3">
			<img src={logoFull} alt="Evenue" class="h-10 w-auto object-contain" />
		</a>

		<!-- Navigation Links -->
		<nav class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
			<a href="/listings" class="flex items-center gap-1.5 transition-colors hover:text-slate-950">
				<Search class="h-4 w-4 text-slate-400" />
				Explorer les lieux
			</a>
			<a href="/comment-ca-marche" class="transition-colors hover:text-slate-950">
				Comment ça marche
			</a>
		</nav>

		<!-- Auth & Profile Action Buttons -->
		<div class="flex items-center gap-3">
			{#if user}
				<!-- User Account Menu Dropdown using Shadcn DropdownMenu -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="relative inline-flex h-9 items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-900 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-300"
						aria-label={`Ouvrir le menu de ${user.firstName}${unreadCount ? `, ${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}` : ''}`}
					>
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white"
							>
								{user.firstName[0]}
							</div>
							<span class="text-xs font-semibold text-slate-900">{user.firstName}</span>
							<ChevronDown class="h-3.5 w-3.5 text-slate-500" />
							{#if unreadCount > 0}
								<span
									class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-600 px-1 text-[10px] font-bold leading-none text-white"
									aria-hidden="true"
								>
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							{/if}
					</DropdownMenu.Trigger>

					<DropdownMenu.Content align="end" class="w-56">
						<DropdownMenu.Label class="flex flex-col space-y-1">
							<p class="font-bold text-slate-950">{user.firstName} {user.lastName}</p>
							<p class="line-clamp-1 text-xs font-normal text-slate-500">{user.email}</p>
							<Badge variant={user.role === 'HOST' ? 'purple' : 'secondary'} class="mt-1 w-fit">
								{user.role === 'HOST' ? 'Compte Hôte' : 'Compte Invité'}
							</Badge>
						</DropdownMenu.Label>

						<DropdownMenu.Separator />

						<DropdownMenu.Group>
							{#if user.role === 'HOST'}
								<DropdownMenu.Item class="p-0">
									<a href="/listings/new" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700 gap-2">
										<CirclePlus />
										<span>Publier une annonce</span>
									</a>
								</DropdownMenu.Item>
							{:else}
								<DropdownMenu.Item class="p-0">
									<a href="/become-host" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700 gap-2">
										<CirclePlus />
										<span>Devenir Hôte</span>
									</a>
								</DropdownMenu.Item>
							{/if}

							<DropdownMenu.Item class="p-0">
								<a href="/dashboard" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700 gap-2">
									<LayoutDashboard />
									<span>Mon Espace</span>
								</a>
							</DropdownMenu.Item>

							<DropdownMenu.Item class="p-0">
								<a href="/messages" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700 gap-2">
									<MessageSquare />
									<span>Messagerie</span>
									{#if unreadCount > 0}
										<span class="flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
									{/if}
								</a>
							</DropdownMenu.Item>
						</DropdownMenu.Group>

						<DropdownMenu.Separator />

						<DropdownMenu.Item onclick={handleLogout}>
							<LogOut class="mr-2 h-4 w-4" />
							<span>Se déconnecter</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<!-- Anonymous State -->
				<a href="/become-host" class="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex">
					<PlusCircle class="h-4 w-4 text-slate-700" />
					Devenir Hôte
				</a>

				<a href="/auth/login" class="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800">
					<User class="h-4 w-4" />
					Se connecter
				</a>
			{/if}
		</div>
	</div>
</header>
