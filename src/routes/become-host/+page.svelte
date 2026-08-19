<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Building2, ShieldCheck, Lock, Sparkles, ArrowRight } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Hero Section -->
	<div class="space-y-4 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1 text-xs">
			<Sparkles class="h-3.5 w-3.5" />
			Propriétaires de Bastides, Lofts & Domaines
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
			Rentabilisez votre logement pour des événements d'exception
		</h1>
		<p class="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
			Rejoignez Evenue. Bénéficiez d'une protection complète jusqu'à 10 000 € de dégradations
			matérielles Wakam et du séquestre bancaire Stripe Connect sur chaque réservation.
		</p>

		<div class="flex justify-center gap-4 pt-4">
			<Button
				href="/listings/new"
				variant="default"
				class="gap-2 bg-purple-900 px-6 py-3 text-sm font-bold text-white hover:bg-purple-800"
			>
				Publier mon logement gratuitement <ArrowRight class="h-4 w-4" />
			</Button>
		</div>
	</div>

	<!-- Key Advantages -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<Card.Root class="space-y-3 border-purple-200 bg-purple-50/40 p-6">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-900 text-white">
				<ShieldCheck class="h-6 w-6" />
			</div>
			<h3 class="text-base font-bold text-slate-950">Assurance Wakam 10 000 €</h3>
			<p class="text-xs leading-relaxed text-slate-600">
				Chaque événement est automatiquement assuré contre les dégradations matérielles et la
				responsabilité civile événementielle jusqu'à 1 000 000 €.
			</p>
		</Card.Root>

		<Card.Root class="space-y-3 border-purple-200 bg-purple-50/40 p-6">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-900 text-white">
				<Lock class="h-6 w-6" />
			</div>
			<h3 class="text-base font-bold text-slate-950">Séquestre Stripe Connect</h3>
			<p class="text-xs leading-relaxed text-slate-600">
				Les fonds de vos réservations sont verrouillés en toute sécurité sur un compte de
				cantonnement et transférés directement sur votre compte bancaire.
			</p>
		</Card.Root>

		<Card.Root class="space-y-3 border-purple-200 bg-purple-50/40 p-6">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-900 text-white">
				<Building2 class="h-6 w-6" />
			</div>
			<h3 class="text-base font-bold text-slate-950">Contrôle des Disponibilités</h3>
			<p class="text-xs leading-relaxed text-slate-600">
				Définissez précisément les plages de dates auxquelles votre lieu est disponible et
				synchronisez votre calendrier avec iCal.
			</p>
		</Card.Root>
	</div>
</div>
