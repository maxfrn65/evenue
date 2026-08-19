<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Lock, Server } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="emerald" class="gap-1.5 px-3 py-1 text-xs">
			<Lock class="h-4 w-4" />
			Security by Design & OWASP Compliant
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Charte de Sécurité & Protection des Données
		</h1>
		<p class="mx-auto max-w-2xl text-xs text-slate-500">
			Infrastructure moderne construite selon les plus hauts standards de sécurité informatique.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Card.Root class="space-y-3 border-slate-200 p-6">
			<div class="flex items-center gap-2 text-sm font-bold text-slate-950">
				<Lock class="h-5 w-5 text-emerald-600" />
				Chiffrement & Jetons Sécurisés
			</div>
			<p class="text-xs leading-relaxed text-slate-600">
				Toutes les communications transitent via HTTPS/TLS 1.3 avec chiffrement AES-256. Les
				sessions utilisateur sont scellées par des cookies `HttpOnly` et `SameSite=Lax`.
			</p>
		</Card.Root>

		<Card.Root class="space-y-3 border-slate-200 p-6">
			<div class="flex items-center gap-2 text-sm font-bold text-slate-950">
				<Server class="h-5 w-5 text-indigo-600" />
				Circuit Breaker & Haute Disponibilité
			</div>
			<p class="text-xs leading-relaxed text-slate-600">
				Les integrations d'API tierces (Wakam, Stripe, Mapbox) sont protégées par un pattern Circuit
				Breaker pour garantir une réactivité constante du service.
			</p>
		</Card.Root>
	</div>
</div>
