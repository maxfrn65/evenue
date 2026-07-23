<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { User, Mail, Lock, ShieldCheck, ArrowRight } from '@lucide/svelte';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state<'GUEST' | 'HOST'>('GUEST');
	let errorMessage = $state('');
	let loading = $state(false);

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
				throw new Error(data.error || 'Erreur lors de l\'inscription.');
			}

			window.location.href = role === 'HOST' ? '/become-host' : '/listings';
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto my-12 px-4">
	<Card class="p-8 space-y-6 border-slate-200 shadow-md">
		<div class="text-center space-y-2">
			<div class="w-12 h-12 rounded-xl bg-slate-950 text-white mx-auto flex items-center justify-center shadow-sm">
				<ShieldCheck class="w-6 h-6 text-emerald-400" />
			</div>
			<h1 class="text-2xl font-bold text-slate-950">Créer un compte Evenue</h1>
			<p class="text-xs text-slate-500">Garantie d'assurance Wakam incluse dès la première réservation</p>
		</div>

		{#if errorMessage}
			<div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Role Toggle -->
			<div>
				<Label>Type de compte</Label>
				<div class="grid grid-cols-2 gap-3">
					<Button
						type="button"
						variant={role === 'GUEST' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (role = 'GUEST')}
					>
						Organisateur / Invité
					</Button>
					<Button
						type="button"
						variant={role === 'HOST' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (role = 'HOST')}
					>
						Propriétaire / Hôte
					</Button>
				</div>
			</div>

			<!-- First & Last Name -->
			<div class="grid grid-cols-2 gap-3">
				<div>
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
				<div>
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
			<div>
				<Label for="register-email">Adresse Email</Label>
				<InputGroup.Root>
					<InputGroup.Icon>
						<Mail class="w-4 h-4 text-slate-400" />
					</InputGroup.Icon>
					<InputGroup.Input
						id="register-email"
						type="email"
						bind:value={email}
						required
						placeholder="nom@exemple.com"
					/>
				</InputGroup.Root>
			</div>

			<!-- Password -->
			<div>
				<Label for="register-password">Mot de passe (8 car. min)</Label>
				<InputGroup.Root>
					<InputGroup.Icon>
						<Lock class="w-4 h-4 text-slate-400" />
					</InputGroup.Icon>
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
				class="w-full py-3 text-sm mt-4 gap-2 font-semibold bg-slate-950 hover:bg-slate-800 text-white"
			>
				{loading ? 'Création du compte...' : 'S\'inscrire'}
				<ArrowRight class="w-4 h-4" />
			</Button>
		</form>

		<div class="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
			Déjà un compte ?
			<a href="/auth/login" class="text-slate-950 font-bold hover:underline ml-1">Se connecter</a>
		</div>
	</Card>
</div>
