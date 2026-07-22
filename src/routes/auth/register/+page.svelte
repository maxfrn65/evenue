<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-svelte';

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

			if (role === 'HOST') {
				goto('/become-host');
			} else {
				goto('/listings');
			}
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto my-12 px-4">
	<Card class="p-8 space-y-6">
		<div class="text-center space-y-2">
			<div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
				<ShieldCheck class="w-6 h-6 text-emerald-400" />
			</div>
			<h1 class="text-2xl font-bold text-white">Créer un compte Evenue</h1>
			<p class="text-xs text-slate-400">Garantie d'assurance Wakam incluse dès la première réservation</p>
		</div>

		{#if errorMessage}
			<div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-medium">
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
					<Input
						id="register-firstname"
						type="text"
						bind:value={firstName}
						required
						placeholder="Maxime"
					/>
				</div>
				<div>
					<Label for="register-lastname">Nom</Label>
					<Input
						id="register-lastname"
						type="text"
						bind:value={lastName}
						required
						placeholder="Dupont"
					/>
				</div>
			</div>

			<!-- Email -->
			<div>
				<Label for="register-email">Adresse Email</Label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10" />
					<Input
						id="register-email"
						type="email"
						bind:value={email}
						required
						placeholder="nom@exemple.com"
						class="pl-10"
					/>
				</div>
			</div>

			<!-- Password -->
			<div>
				<Label for="register-password">Mot de passe (8 car. min)</Label>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10" />
					<Input
						id="register-password"
						type="password"
						bind:value={password}
						required
						minlength="8"
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
				{loading ? 'Création du compte...' : 'S\'inscrire'}
				<ArrowRight class="w-4 h-4" />
			</Button>
		</form>

		<div class="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
			Déjà un compte ?
			<a href="/auth/login" class="text-purple-400 font-semibold hover:underline ml-1">Se connecter</a>
		</div>
	</Card>
</div>
