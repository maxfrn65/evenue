<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Lock, ShieldCheck } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1 text-xs">
			<Lock class="h-4 w-4" />
			Protection des Données & RGPD
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Politique de Confidentialité
		</h1>
		<p class="text-xs text-slate-500">
			En vigueur au 23 Juillet 2026 — Respect de votre vie privée et conformité au RGPD.
		</p>
	</div>

	<div class="space-y-6 text-xs text-slate-700 leading-relaxed">
		<Card.Root class="border-slate-200 p-6 space-y-3">
			<h3 class="font-bold text-slate-950 text-sm">1. Collecte et Traitement des Données</h3>
			<p>
				Evenue traite vos données personnelles (nom, prénom, adresse e-mail, historique de réservation, pièces justificatives KYC) exclusivement pour la gestion des réservations, la vérification d'identité et l'émission des polices d'assurance Wakam.
			</p>
		</Card.Root>

		<Card.Root class="border-slate-200 p-6 space-y-3">
			<h3 class="font-bold text-slate-950 text-sm">2. Vos Droits Informatique et Libertés</h3>
			<p>
				Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ce droit à tout moment via notre support.
			</p>
		</Card.Root>
	</div>
</div>
