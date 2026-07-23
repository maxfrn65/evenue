<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { ShieldCheck, Sparkles, CheckCircle2, XCircle } from '@lucide/svelte';

	let { compact = false }: { compact?: boolean } = $props();

	const coveredItems = [
		'Bris de glace & dégradations de mobilier',
		"Dommages matériels lors d'événements privés (jusqu'à 10 000 €)",
		'Sinistres accidentels des convives',
		"Assurance incluse automatiquement sans franchise ni démarche pour l'hôte"
	];

	const nonCoveredItems = [
		"Vol d'objets personnels préexistants ou bijoux non déclarés",
		'Actes de vandalisme intentionnels avérés',
		"Dépassement du nombre maximal d'invités autorisé"
	];
</script>

<Card class="rounded-xl border-slate-200 p-6 md:p-8">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
		<div class="flex items-center gap-3">
			<div class="rounded-xl bg-slate-900 p-3 text-white">
				<ShieldCheck class="h-6 w-6" />
			</div>
			<div>
				<h3 class="flex items-center gap-2 text-lg font-bold text-slate-950">
					Assurance Événementielle Embarquée Wakam
					<Badge variant="emerald">Native et sans frais</Badge>
				</h3>
				<p class="mt-0.5 text-xs text-slate-500">
					Chaque réservation inclut une police d'assurance automatique émise par Wakam AssurTech.
				</p>
			</div>
		</div>
	</div>

	<!-- Details grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Covered -->
		<div class="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
			<h4
				class="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-800 uppercase"
			>
				<CheckCircle2 class="h-4 w-4 text-emerald-600" />
				Ce qui est couvert par la police Wakam
			</h4>
			<ul class="space-y-2 text-xs text-slate-700">
				{#each coveredItems as item (item)}
					<li class="flex items-start gap-2">
						<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Non Covered -->
		<div class="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
			<h4
				class="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-rose-800 uppercase"
			>
				<XCircle class="h-4 w-4 text-rose-600" />
				Ce qui n'est pas couvert (Transparence CGV)
			</h4>
			<ul class="space-y-2 text-xs text-slate-700">
				{#each nonCoveredItems as item (item)}
					<li class="flex items-start gap-2">
						<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500"></span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</Card>
