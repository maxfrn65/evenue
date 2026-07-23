<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Lock, ShieldCheck, CheckCircle2, Server } from '@lucide/svelte';
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
		<p class="text-xs text-slate-500 max-w-2xl mx-auto">
			Infrastructure moderne construite selon les plus hauts standards de sécurité informatique.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Card.Root class="border-slate-200 p-6 space-y-3">
			<div class="flex items-center gap-2 font-bold text-slate-950 text-sm">
				<Lock class="h-5 w-5 text-emerald-600" />
				Chiffrement & Jetons Sécurisés
			</div>
			<p class="text-xs text-slate-600 leading-relaxed">
				Toutes les communications transitent via HTTPS/TLS 1.3 avec chiffrement AES-256. Les sessions utilisateur sont scellées par des cookies `HttpOnly` et `SameSite=Lax`.
			</p>
		</Card.Root>

		<Card.Root class="border-slate-200 p-6 space-y-3">
			<div class="flex items-center gap-2 font-bold text-slate-950 text-sm">
				<Server class="h-5 w-5 text-indigo-600" />
				Circuit Breaker & Haute Disponibilité
			</div>
			<p class="text-xs text-slate-600 leading-relaxed">
				Les integrations d'API tierces (Wakam, Stripe, Mapbox) sont protégées par un pattern Circuit Breaker pour garantir une réactivité constante du service.
			</p>
		</Card.Root>
	</div>
</div>
