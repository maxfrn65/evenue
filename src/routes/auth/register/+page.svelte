<script lang="ts">
	import { goto } from '$app/navigation';
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
	<div class="glass-card p-8 rounded-2xl space-y-6">
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
				<span class="block text-xs font-semibold text-slate-300 mb-2 uppercase">Type de compte</span>
				<div class="grid grid-cols-2 gap-3">
					<button
						type="button"
						onclick={() => (role = 'GUEST')}
						class={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
							role === 'GUEST'
								? 'bg-purple-600/30 border-purple-500 text-purple-300'
								: 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
						}`}
					>
						Organisateur / Invité
					</button>
					<button
						type="button"
						onclick={() => (role = 'HOST')}
						class={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
							role === 'HOST'
								? 'bg-purple-600/30 border-purple-500 text-purple-300'
								: 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
						}`}
					>
						Propriétaire / Hôte
					</button>
				</div>
			</div>

			<!-- First & Last Name -->
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="register-firstname" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Prénom</label>
					<input
						id="register-firstname"
						type="text"
						bind:value={firstName}
						required
						placeholder="Maxime"
						class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
					/>
				</div>
				<div>
					<label for="register-lastname" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Nom</label>
					<input
						id="register-lastname"
						type="text"
						bind:value={lastName}
						required
						placeholder="Dupont"
						class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
					/>
				</div>
			</div>

			<!-- Email -->
			<div>
				<label for="register-email" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Adresse Email</label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
					<input
						id="register-email"
						type="email"
						bind:value={email}
						required
						placeholder="nom@exemple.com"
						class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
					/>
				</div>
			</div>

			<!-- Password -->
			<div>
				<label for="register-password" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Mot de passe (8 car. min)</label>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
					<input
						id="register-password"
						type="password"
						bind:value={password}
						required
						minlength="8"
						placeholder="••••••••"
						class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="gradient-button w-full py-3 flex items-center justify-center gap-2 text-sm mt-4 font-semibold disabled:opacity-50"
			>
				{loading ? 'Création du compte...' : 'S\'inscrire'}
				<ArrowRight class="w-4 h-4" />
			</button>
		</form>

		<div class="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
			Déjà un compte ?
			<a href="/auth/login" class="text-purple-400 font-semibold hover:underline ml-1">Se connecter</a>
		</div>
	</div>
</div>
