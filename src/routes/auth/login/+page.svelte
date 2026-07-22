<script lang="ts">
	import { goto } from '$app/navigation';
	import { Lock, Mail, ArrowRight, ShieldCheck, PartyPopper } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let loading = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Erreur de connexion.');
			}

			goto('/listings');
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto my-16 px-4">
	<div class="glass-card p-8 rounded-2xl space-y-6">
		<div class="text-center space-y-2">
			<div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
				<PartyPopper class="w-6 h-6" />
			</div>
			<h1 class="text-2xl font-bold text-white">Connexion à Evenue</h1>
			<p class="text-xs text-slate-400">Accédez à votre espace réservations et vos assurances Wakam</p>
		</div>

		{#if errorMessage}
			<div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="login-email" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Adresse Email</label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
					<input
						id="login-email"
						type="email"
						bind:value={email}
						required
						placeholder="nom@exemple.com"
						class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
					/>
				</div>
			</div>

			<div>
				<label for="login-password" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Mot de passe</label>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
					<input
						id="login-password"
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="gradient-button w-full py-3 flex items-center justify-center gap-2 text-sm mt-4 font-semibold disabled:opacity-50"
			>
				{loading ? 'Connexion en cours...' : 'Se connecter'}
				<ArrowRight class="w-4 h-4" />
			</button>
		</form>

		<div class="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
			Pas encore de compte ?
			<a href="/auth/register" class="text-purple-400 font-semibold hover:underline ml-1">Créer un compte</a>
		</div>
	</div>
</div>
