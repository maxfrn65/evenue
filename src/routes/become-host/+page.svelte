<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Building2, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from '@lucide/svelte';

	let { data, form } = $props();
	const user = $derived(data.user);
</script>

<div class="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
	<div class="space-y-3 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1">
			<Sparkles class="h-4 w-4 text-amber-400" />
			Programme Hôte Evenue
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Devenez Hôte & Rentabilisez votre Lieu
		</h1>
		<p class="text-xs text-slate-600">
			Bénéficiez d'une protection Wakam jusqu'à 10 000 €, du séquestre de caution automatique et de versements sécurisés Stripe Connect.
		</p>
	</div>

	{#if form?.error}
		<div class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700">
			{form.error}
		</div>
	{/if}

	<Card class="space-y-6 border-purple-200 bg-purple-50/40 p-8">
		<div class="space-y-4 text-xs text-slate-700">
			<h3 class="text-sm font-bold text-slate-950">Avantages exclusifs Hôtes Evenue :</h3>
			<div class="flex items-start gap-3">
				<CheckCircle2 class="h-5 w-5 flex-shrink-0 text-purple-600" />
				<div>
					<strong class="font-bold text-slate-900">Assurance Dommages Wakam 100% Intégrée</strong>
					<p class="text-[11px] text-slate-500">Couverture jusqu'à 10 000 € pour chaque soirée ou réception réservée.</p>
				</div>
			</div>

			<div class="flex items-start gap-3">
				<ShieldCheck class="h-5 w-5 flex-shrink-0 text-purple-600" />
				<div>
					<strong class="font-bold text-slate-900">Caution Séquestrée Automatique</strong>
					<p class="text-[11px] text-slate-500">Empreinte bancaire bloquée par Stripe sans démarche de votre part.</p>
				</div>
			</div>

			<div class="flex items-start gap-3">
				<Building2 class="h-5 w-5 flex-shrink-0 text-purple-600" />
				<div>
					<strong class="font-bold text-slate-900">Gestion Simplifiée du Calendrier</strong>
					<p class="text-[11px] text-slate-500">Synchronisation iCal bidirectionnelle et contrôle des créneaux autorisés.</p>
				</div>
			</div>
		</div>

		<form method="POST" class="pt-4">
			<Button
				type="submit"
				variant="default"
				class="w-full gap-2 bg-purple-700 py-3.5 text-sm font-bold text-white hover:bg-purple-800"
			>
				Activer mon Compte Hôte & Publier une Annonce
				<ArrowRight class="h-4 w-4" />
			</Button>
		</form>
	</Card>
</div>
