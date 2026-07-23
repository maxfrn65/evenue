<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { UserCheck, ShieldCheck, Lock, ArrowRight, CheckCircle2 } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1 text-xs">
			<UserCheck class="h-4 w-4" />
			Identity & Compliance Engine
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Vérification d'Identité KYC Stripe Connect
		</h1>
		<p class="text-xs text-slate-500 max-w-2xl mx-auto">
			Know Your Customer (KYC) : la norme européenne de sécurité bancaire pour certifier l'identité de chaque hôte propriétaire.
		</p>
	</div>

	<Card.Root class="border-purple-200 bg-purple-50/30 p-8 space-y-6">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-900 text-white">
				<ShieldCheck class="h-6 w-6" />
			</div>
			<div>
				<h2 class="text-lg font-bold text-slate-950">Pourquoi la vérification KYC est-elle obligatoire ?</h2>
				<p class="text-xs text-slate-600">Conformité à la directive européenne DSP2 et réglementation anti-blanchiment</p>
			</div>
		</div>

		<div class="space-y-4 text-xs text-slate-700 leading-relaxed">
			<p>
				Avant de pouvoir recevoir les revenus de location de vos logements sur votre compte bancaire, Stripe Connect Express effectue une vérification d'identité rapide et entièrement sécurisée.
			</p>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
				<div class="bg-white p-4 rounded-xl border border-purple-200 space-y-1.5">
					<h4 class="font-bold text-purple-950 text-xs flex items-center gap-1.5">
						<CheckCircle2 class="h-4 w-4 text-purple-700" />
						Documents acceptés
					</h4>
					<p class="text-slate-600">Carte nationale d'identité, passeport ou titre de séjour valide.</p>
				</div>

				<div class="bg-white p-4 rounded-xl border border-purple-200 space-y-1.5">
					<h4 class="font-bold text-purple-950 text-xs flex items-center gap-1.5">
						<CheckCircle2 class="h-4 w-4 text-purple-700" />
						Coordonnées bancaires
					</h4>
					<p class="text-slate-600">IBAN au nom du propriétaire certifié pour les virements SEPA.</p>
				</div>
			</div>
		</div>
	</Card.Root>
</div>
