<script lang="ts">
	import logoFull from '$lib/assets/full.png';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { User, Mail, Lock, ShieldCheck, ArrowRight } from '@lucide/svelte';

	import { page } from '$app/state';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state<'GUEST' | 'HOST'>('GUEST');
	let errorMessage = $state('');
	let loading = $state(false);

	const targetRedirect = $derived(page.url.searchParams.get('redirectTo') || (role === 'HOST' ? '/become-host' : '/dashboard'));

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ firstName, lastName, email, password, role })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Erreur lors de l'inscription.");
			}

			window.location.href = targetRedirect;
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto my-12 max-w-md px-4">
	<Card class="space-y-6 border-slate-200 p-8 shadow-md">
		<div class="space-y-2 text-center">
			<a href="/" class="inline-block">
				<img src={logoFull} alt="Evenue" class="h-12 w-auto mx-auto object-contain mb-2" />
			</a>
			<h1 class="text-2xl font-bold text-slate-950">Créer un compte Evenue</h1>
			<p class="text-xs text-slate-500">
				Garantie d'assurance Wakam incluse dès la première réservation
			</p>
		</div>

		{#if errorMessage}
			<div
				id="register-error"
				role="alert"
				aria-live="assertive"
				class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700"
			>
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Role Toggle -->
			<fieldset class="flex flex-col gap-1.5 border-0 p-0 m-0">
				<legend class="text-sm font-medium mb-1.5">Type de compte</legend>
				<div class="grid grid-cols-2 gap-3">
					<Button
						type="button"
						variant={role === 'GUEST' ? 'default' : 'outline'}
						size="sm"
						aria-pressed={role === 'GUEST'}
						onclick={() => (role = 'GUEST')}
					>
						Organisateur / Invité
					</Button>
					<Button
						type="button"
						variant={role === 'HOST' ? 'default' : 'outline'}
						size="sm"
						aria-pressed={role === 'HOST'}
						onclick={() => (role = 'HOST')}
					>
						Propriétaire / Hôte
					</Button>
				</div>
			</fieldset>

			<!-- First & Last Name -->
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1.5">
					<Label for="register-firstname">Prénom</Label>
					<InputGroup.Root>
						<InputGroup.Input
							id="register-firstname"
							type="text"
							bind:value={firstName}
							required
							placeholder="Maxime"
						/>
					</InputGroup.Root>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="register-lastname">Nom</Label>
					<InputGroup.Root>
						<InputGroup.Input
							id="register-lastname"
							type="text"
							bind:value={lastName}
							required
							placeholder="Dupont"
						/>
					</InputGroup.Root>
				</div>
			</div>

			<!-- Email -->
			<div class="flex flex-col gap-1.5">
				<Label for="register-email">Adresse Email</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Mail />
					</InputGroup.Addon>
					<InputGroup.Input
						id="register-email"
						type="email"
						bind:value={email}
						required
						aria-invalid={errorMessage ? 'true' : undefined}
						aria-describedby={errorMessage ? 'register-error' : undefined}
						placeholder="nom@exemple.com"
					/>
				</InputGroup.Root>
			</div>

			<!-- Password -->
			<div class="flex flex-col gap-1.5">
				<Label for="register-password">Mot de passe (8 car. min)</Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<Lock />
					</InputGroup.Addon>
					<InputGroup.Input
						id="register-password"
						type="password"
						bind:value={password}
						required
						minlength={8}
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
				{loading ? 'Création du compte...' : "S'inscrire"}
				<ArrowRight class="h-4 w-4" />
			</Button>
		</form>

		<div class="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
			Déjà un compte ?
			<a href="/auth/login" class="ml-1 font-bold text-slate-950 hover:underline">Se connecter</a>
		</div>
	</Card>
</div>
