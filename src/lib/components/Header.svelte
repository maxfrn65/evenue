<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { PartyPopper, ShieldCheck, User, Search, PlusCircle } from 'lucide-svelte';
</script>

<header class="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 transition-all">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
		<!-- Brand Logo -->
		<a href="/" class="flex items-center gap-3 group">
			<div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
				<div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
					<PartyPopper class="w-5 h-5 text-purple-400" />
				</div>
			</div>
			<div class="flex flex-col">
				<span class="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
					Evenue
					<Badge variant="purple" class="text-[10px] px-2 py-0.5">
						Events
					</Badge>
				</span>
				<span class="text-[10px] text-slate-400 tracking-wide font-medium">Locations & Soirées Couvertes</span>
			</div>
		</a>

		<!-- Navigation Links -->
		<nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
			<a href="/listings" class="hover:text-purple-400 transition-colors flex items-center gap-1.5">
				<Search class="w-4 h-4 text-slate-400" />
				Explorer les lieux
			</a>
			<a href="/assurance" class="hover:text-purple-400 transition-colors flex items-center gap-1.5">
				<ShieldCheck class="w-4 h-4 text-emerald-400" />
				Garantie Wakam
			</a>
			<a href="/comment-ca-marche" class="hover:text-purple-400 transition-colors">
				Comment ça marche
			</a>
		</nav>

		<!-- Action Buttons using Shadcn Button Components -->
		<div class="flex items-center gap-3">
			<Button href="/become-host" variant="outline" size="sm" class="hidden sm:inline-flex gap-2">
				<PlusCircle class="w-4 h-4 text-purple-400" />
				Devenir Hôte
			</Button>

			<Button href="/auth/login" variant="gradient" size="sm" class="gap-2">
				<User class="w-4 h-4" />
				Se connecter
			</Button>
		</div>
	</div>
</header>
