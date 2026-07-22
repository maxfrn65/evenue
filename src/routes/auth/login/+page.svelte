<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Lock, Mail, ArrowRight, PartyPopper } from 'lucide-svelte';

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
	<Card class="p-8 space-y-6">
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
				<Label for="login-email">Adresse Email</Label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10" />
					<Input
						id="login-email"
						type="email"
						bind:value={email}
						required
						placeholder="nom@exemple.com"
						class="pl-10"
					/>
				</div>
			</div>

			<div>
				<Label for="login-password">Mot de passe</Label>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10" />
					<Input
						id="login-password"
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="pl-10"
					/>
				</div>
			</div>

			<Button
				type="submit"
				variant="gradient"
				disabled={loading}
				class="w-full py-3 text-sm mt-4 gap-2 font-semibold"
			>
				{loading ? 'Connexion en cours...' : 'Se connecter'}
				<ArrowRight class="w-4 h-4" />
			</Button>
		</form>

		<div class="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
			Pas encore de compte ?
			<a href="/auth/register" class="text-purple-400 font-semibold hover:underline ml-1">Créer un compte</a>
		</div>
	</Card>
</div>
