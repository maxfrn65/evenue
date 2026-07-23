<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Lock, Mail, ArrowRight, PartyPopper } from '@lucide/svelte';

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

			window.location.href = '/listings';
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto my-16 px-4">
	<Card class="p-8 space-y-6 border-slate-200">
		<div class="text-center space-y-2">
			<div class="w-12 h-12 rounded-xl bg-slate-950 text-white mx-auto flex items-center justify-center shadow-sm">
				<PartyPopper class="w-6 h-6" />
			</div>
			<h1 class="text-2xl font-bold text-slate-950">Connexion à Evenue</h1>
			<p class="text-xs text-slate-500">Accédez à votre espace réservations et vos assurances Wakam</p>
		</div>

		{#if errorMessage}
			<div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="flex flex-col gap-1.5">
				<Label for="login-email">Adresse Email</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Mail />
					</InputGroup.Addon>
					<InputGroup.Input
						id="login-email"
						type="email"
						bind:value={email}
						required
						placeholder="nom@exemple.com"
					/>
				</InputGroup.Root>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="login-password">Mot de passe</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Lock />
					</InputGroup.Addon>
					<InputGroup.Input
						id="login-password"
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
					/>
				</InputGroup.Root>
			</div>

			<Button
				type="submit"
				variant="default"
				disabled={loading}
				class="w-full py-3 text-sm mt-4 gap-2 font-semibold bg-slate-950 hover:bg-slate-800 text-white"
			>
				{loading ? 'Connexion en cours...' : 'Se connecter'}
				<ArrowRight class="w-4 h-4" />
			</Button>
		</form>

		<div class="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
			Pas encore de compte ?
			<a href="/auth/register" class="text-slate-950 font-bold hover:underline ml-1">Créer un compte</a>
		</div>
	</Card>
</div>
