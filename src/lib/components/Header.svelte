<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { PartyPopper, ShieldCheck, User, Search, PlusCircle, LogOut, Calendar, Home, ChevronDown } from '@lucide/svelte';

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

<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
		<!-- Brand Logo -->
		<a href="/" class="flex items-center gap-3 group">
			<div class="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors">
				<PartyPopper class="w-5 h-5 text-white" />
			</div>
			<div class="flex flex-col">
				<span class="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5">
					Evenue
				</span>
				<span class="text-[10px] text-slate-500 tracking-wide font-medium">Locations & Soirées Couvertes</span>
			</div>
		</a>

		<!-- Navigation Links -->
		<nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
			<a href="/listings" class="hover:text-slate-950 transition-colors flex items-center gap-1.5">
				<Search class="w-4 h-4 text-slate-400" />
				Explorer les lieux
			</a>
			<a href="/comment-ca-marche" class="hover:text-slate-950 transition-colors">
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
						class="gap-2.5 bg-white border-slate-200"
					>
						<div class="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
							{user.firstName[0]}
						</div>
						<span class="text-xs font-semibold text-slate-900">{user.firstName}</span>
						<ChevronDown class="w-3.5 h-3.5 text-slate-500" />
					</Button>

					{#if menuOpen}
						<div class="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 text-xs">
							<div class="px-4 py-2 border-b border-slate-100">
								<p class="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
								<p class="text-[11px] text-slate-500 line-clamp-1">{user.email}</p>
								<Badge variant={user.role === 'HOST' ? 'purple' : 'secondary'} class="mt-1">
									{user.role === 'HOST' ? 'Compte Hôte' : 'Compte Invité'}
								</Badge>
							</div>

							{#if user.role === 'HOST'}
								<a href="/listings/new" class="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium">
									<PlusCircle class="w-4 h-4 text-purple-600" />
									Publier une annonce
								</a>
							{:else}
								<a href="/become-host" class="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium">
									<PlusCircle class="w-4 h-4 text-purple-600" />
									Devenir Hôte
								</a>
							{/if}

							<a href="/dashboard" class="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium">
								<Home class="w-4 h-4 text-slate-500" />
								Mon Espace
							</a>

							<a href="/dashboard" class="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium">
								<Calendar class="w-4 h-4 text-slate-500" />
								Mes Réservations
							</a>

							<div class="border-t border-slate-100 my-1"></div>

							<button
								onclick={handleLogout}
								class="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-medium text-left"
							>
								<LogOut class="w-4 h-4" />
								Se déconnecter
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Anonymous State -->
				<Button href="/become-host" variant="outline" size="sm" class="hidden sm:inline-flex gap-2">
					<PlusCircle class="w-4 h-4 text-slate-700" />
					Devenir Hôte
				</Button>

				<Button href="/auth/login" variant="default" size="sm" class="gap-2">
					<User class="w-4 h-4" />
					Se connecter
				</Button>
			{/if}
		</div>
	</div>
</header>
