<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FileText, ShieldCheck } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="outline" class="gap-1.5 px-3 py-1 text-xs">
			<FileText class="h-4 w-4" />
			Conformité Légale
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Mentions Légales & CGU
		</h1>
		<p class="text-xs text-slate-500">
			Dernière mise à jour : 23 Juillet 2026 — Plateforme Opérée par Evenue SAS.
		</p>
	</div>

	<div class="space-y-6 text-xs text-slate-700 leading-relaxed">
		<Card.Root class="border-slate-200 p-6 space-y-3">
			<h3 class="font-bold text-slate-950 text-sm">1. Éditeur de la Plateforme</h3>
			<p>
				Le site et la plateforme Evenue sont édités par la société <strong>Evenue SAS</strong>, société par actions simplifiée au capital social de 50 000 €, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 912 345 678.
			</p>
			<p>Siège social : 142 Rue de Rivoli, 75001 Paris, France. Directeur de la publication : Maxime Fourna.</p>
		</Card.Root>

		<Card.Root class="border-slate-200 p-6 space-y-3">
			<h3 class="font-bold text-slate-950 text-sm">2. Hébergement & Infrastructures</h3>
			<p>
				La plateforme est hébergée sur l'infrastructure cloud française <strong>Scaleway SAS</strong> (8 rue de la Ville l'Évêque, 75008 Paris). Les données de paiement sont directement opérées par Stripe Payments Europe Ltd (Dublin, Irlande).
			</p>
		</Card.Root>

		<Card.Root class="border-slate-200 p-6 space-y-3">
			<h3 class="font-bold text-slate-950 text-sm">3. Partenariat d'Assurance</h3>
			<p>
				Les polices d'assurance sont émises par <strong>Wakam SA</strong>, entreprise d'assurance régie par le Code des assurances français, immatriculée au RCS Paris sous le n° 562 028 812 et soumise au contrôle de l'ACPR (Autorité de Contrôle Prudentiel et de Résolution).
			</p>
		</Card.Root>
	</div>
</div>
