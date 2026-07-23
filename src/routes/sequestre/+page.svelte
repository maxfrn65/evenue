<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Lock, ShieldCheck, CreditCard, ArrowRight, CheckCircle2 } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1 text-xs">
			<Lock class="h-4 w-4" />
			Stripe Connect Escrow Engine
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Le Séquestre Financier Stripe Connect
		</h1>
		<p class="text-xs text-slate-500 max-w-2xl mx-auto">
			Garantie de paiement pour les hôtes et sécurité totale pour les convives grâce au cantonnement automatique des fonds.
		</p>
	</div>

	<!-- Process Diagram Card -->
	<Card.Root class="border-indigo-200 bg-indigo-50/30 p-8 space-y-6">
		<h2 class="text-lg font-bold text-slate-950 flex items-center gap-2">
			<Lock class="h-5 w-5 text-indigo-600" />
			Fonctionnement du Séquestre en 3 Étapes
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="bg-white p-5 rounded-xl border border-indigo-100 space-y-2">
				<span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Étape 1</span>
				<h3 class="font-bold text-slate-950 text-sm">Paiement & Cantonnement</h3>
				<p class="text-xs text-slate-600 leading-relaxed">
					Lors de la réservation, le montant total est débité et immédiatement séquestré sur un compte de cantonnement Stripe bancairement isolé.
				</p>
			</div>

			<div class="bg-white p-5 rounded-xl border border-indigo-100 space-y-2">
				<span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Étape 2</span>
				<h3 class="font-bold text-slate-950 text-sm">Déroulement de l'Événement</h3>
				<p class="text-xs text-slate-600 leading-relaxed">
					Pendant toute la durée de la location, aucun fonds n'est transféré à l'hôte. La couverture Wakam assure la protection du logement.
				</p>
			</div>

			<div class="bg-white p-5 rounded-xl border border-indigo-100 space-y-2">
				<span class="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Étape 3</span>
				<h3 class="font-bold text-slate-950 text-sm">Libération Post-7 Jours</h3>
				<p class="text-xs text-slate-600 leading-relaxed">
					À l'issue de la fenêtre de 7 jours post-événement sans sinistre déclaré, Stripe libère automatiquement la ventilation du paiement vers l'hôte.
				</p>
			</div>
		</div>
	</Card.Root>

	<div class="space-y-4 text-xs text-slate-700 leading-relaxed">
		<h3 class="font-bold text-slate-950 text-sm">Pourquoi le séquestre est-il indispensable pour les lieux événementiels ?</h3>
		<p>
			La réservation de lieux privés pour des soirées ou réceptions implique des montants financiers et des risques matériels plus élevés qu'une location classique. Le séquestre automatisé Evenue protège l'hôte contre l'insolvabilité tout en garantissant au convive que son argent ne sera versé qu'une fois la prestation effectivement réalisée.
		</p>
	</div>
</div>
