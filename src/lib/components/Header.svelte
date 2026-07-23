<script lang="ts">
	import logoFull from '$lib/assets/full.png';
	import Button from '$lib/components/ui/button/button.svelte';
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
		Home
	} from '@lucide/svelte';

	interface UserData {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	}

	let { user = null }: { user?: UserData | null } = $props();

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
					<DropdownMenu.Trigger>
						<Button
							variant="outline"
							size="lg"
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
									<a href="/listings/new" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700">
										<PlusCircle class="mr-2 h-4 w-4 text-purple-600" />
										<span>Publier une annonce</span>
									</a>
								</DropdownMenu.Item>
							{:else}
								<DropdownMenu.Item class="p-0">
									<a href="/become-host" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700">
										<PlusCircle class="mr-2 h-4 w-4 text-purple-600" />
										<span>Devenir Hôte</span>
									</a>
								</DropdownMenu.Item>
							{/if}

							<DropdownMenu.Item class="p-0">
								<a href="/dashboard" class="flex w-full items-center px-2 py-1.5 font-medium text-slate-700">
									<Home class="mr-2 h-4 w-4 text-slate-500" />
									<span>Mon Espace</span>
								</a>
							</DropdownMenu.Item>
						</DropdownMenu.Group>

						<DropdownMenu.Separator />

						<DropdownMenu.Item onclick={handleLogout}>
							<LogOut />
							<span>Se déconnecter</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
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
