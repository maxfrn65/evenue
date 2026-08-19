<script lang="ts">
	import logoFull from '$lib/assets/full.png';
	import { toErrorMessage } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Lock, Mail, ArrowRight } from '@lucide/svelte';

	import { page } from '$app/state';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let loading = $state(false);

	const targetRedirect = $derived(page.url.searchParams.get('redirectTo') || '/dashboard');

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

			window.location.href = targetRedirect;
		} catch (err) {
			errorMessage = toErrorMessage(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto my-16 max-w-md px-4">
	<Card class="space-y-6 border-slate-200 p-8">
		<div class="space-y-2 text-center">
			<a href="/" class="inline-block">
				<img src={logoFull} alt="Evenue" class="mx-auto mb-2 h-12 w-auto object-contain" />
			</a>
			<h1 class="text-2xl font-bold text-slate-950">Connexion à Evenue</h1>
			<p class="text-xs text-slate-500">
				Accédez à votre espace réservations et vos assurances Wakam
			</p>
		</div>

		{#if errorMessage}
			<div
				id="login-error"
				role="alert"
				aria-live="assertive"
				class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700"
			>
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
						aria-invalid={errorMessage ? 'true' : undefined}
						aria-describedby={errorMessage ? 'login-error' : undefined}
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
						aria-invalid={errorMessage ? 'true' : undefined}
						aria-describedby={errorMessage ? 'login-error' : undefined}
						placeholder="••••••••"
					/>
				</InputGroup.Root>
			</div>

			<Button
				type="submit"
				variant="default"
				disabled={loading}
				class="mt-4 w-full gap-2 bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-800"
			>
				{loading ? 'Connexion en cours...' : 'Se connecter'}
				<ArrowRight class="h-4 w-4" />
			</Button>
		</form>

		<div class="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
			Pas encore de compte ?
			<a href="/auth/register" class="ml-1 font-bold text-slate-950 hover:underline"
				>Créer un compte</a
			>
		</div>
	</Card>
</div>
