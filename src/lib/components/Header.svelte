<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import {
		PartyPopper,
		ShieldCheck,
		User,
		Search,
		PlusCircle,
		LogOut,
		Calendar,
		Home,
		ChevronDown
	} from '@lucide/svelte';

	interface UserData {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	}

	let { user = null }: { user?: UserData | null } = $props();

	let menuOpen = $state(false);

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/';
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md transition-all"
>
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Brand Logo -->
		<a href="/" class="group flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-colors group-hover:bg-slate-800"
			>
				<PartyPopper class="h-5 w-5 text-white" />
			</div>
			<div class="flex flex-col">
				<span
					class="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-slate-950"
				>
					Evenue
				</span>
				<span class="text-[10px] font-medium tracking-wide text-slate-500"
					>Locations & Soirées Couvertes</span
				>
			</div>
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
				<!-- User Account Menu Dropdown -->
				<div class="relative">
					<Button
						variant="outline"
						size="sm"
						onclick={() => (menuOpen = !menuOpen)}
						class="gap-2.5 border-slate-200 bg-white"
					>
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white"
						>
							{user.firstName[0]}
						</div>
						<span class="text-xs font-semibold text-slate-900">{user.firstName}</span>
						<ChevronDown class="h-3.5 w-3.5 text-slate-500" />
					</Button>

					{#if menuOpen}
						<div
							class="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 text-xs shadow-xl"
						>
							<div class="border-b border-slate-100 px-4 py-2">
								<p class="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
								<p class="line-clamp-1 text-[11px] text-slate-500">{user.email}</p>
								<Badge variant={user.role === 'HOST' ? 'purple' : 'secondary'} class="mt-1">
									{user.role === 'HOST' ? 'Compte Hôte' : 'Compte Invité'}
								</Badge>
							</div>

							{#if user.role === 'HOST'}
								<a
									href="/listings/new"
									class="flex items-center gap-2 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
								>
									<PlusCircle class="h-4 w-4 text-purple-600" />
									Publier une annonce
								</a>
							{:else}
								<a
									href="/become-host"
									class="flex items-center gap-2 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
								>
									<PlusCircle class="h-4 w-4 text-purple-600" />
									Devenir Hôte
								</a>
							{/if}

							<a
								href="/dashboard"
								class="flex items-center gap-2 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
							>
								<Home class="h-4 w-4 text-slate-500" />
								Mon Espace
							</a>

							<div class="my-1 border-t border-slate-100"></div>

							<button
								onclick={handleLogout}
								class="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium text-rose-600 hover:bg-rose-50"
							>
								<LogOut class="h-4 w-4" />
								Se déconnecter
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Anonymous State -->
				<Button href="/become-host" variant="outline" size="sm" class="hidden gap-2 sm:inline-flex">
					<PlusCircle class="h-4 w-4 text-slate-700" />
					Devenir Hôte
				</Button>

				<Button href="/auth/login" variant="default" size="sm" class="gap-2">
					<User class="h-4 w-4" />
					Se connecter
				</Button>
			{/if}
		</div>
	</div>
</header>
