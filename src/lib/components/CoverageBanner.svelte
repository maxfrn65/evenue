<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { ShieldCheck, Sparkles, CheckCircle2, XCircle } from 'lucide-svelte';

	let { compact = false }: { compact?: boolean } = $props();

	const coveredItems = [
		'Bris de glace & dégradations de mobilier',
		'Dommages matériels lors d\'événements privés (jusqu\'à 10 000 €)',
		'Sinistres accidentels des convives',
		'Assurance incluse automatiquement sans franchise ni démarche pour l\'hôte'
	];

	const nonCoveredItems = [
		'Vol d\'objets personnels préexistants ou bijoux non déclarés',
		'Actes de vandalisme intentionnels avérés',
		'Dépassement du nombre maximal d\'invités autorisé'
	];
</script>

<Card class="p-6 md:p-8 rounded-xl border-slate-200 shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
		<div class="flex items-center gap-3">
			<div class="p-3 bg-slate-900 rounded-xl text-white">
				<ShieldCheck class="w-6 h-6" />
			</div>
			<div>
				<h3 class="text-lg font-bold text-slate-950 flex items-center gap-2">
					Assurance Événementielle Embarquée Wakam
					<Badge variant="emerald">
						Native & Sans Frais
					</Badge>
				</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					Chaque réservation inclut une police d'assurance automatique émise par Wakam AssurTech.
				</p>
			</div>
		</div>
		<div class="hidden sm:flex items-center gap-2">
			<Badge variant="purple" class="gap-1 px-3 py-1 text-xs">
				<Sparkles class="w-3.5 h-3.5 text-amber-400" />
				<span>0 € de surcoût masqué</span>
			</Badge>
		</div>
	</div>

	<!-- Details grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Covered -->
		<div class="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5">
			<h4 class="text-emerald-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				Ce qui est couvert par la police Wakam
			</h4>
			<ul class="space-y-2 text-xs text-slate-700">
				{#each coveredItems as item (item)}
					<li class="flex items-start gap-2">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Non Covered -->
		<div class="bg-rose-50/50 border border-rose-200 rounded-xl p-5">
			<h4 class="text-rose-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
				<XCircle class="w-4 h-4 text-rose-600" />
				Ce qui n'est pas couvert (Transparence CGV)
			</h4>
			<ul class="space-y-2 text-xs text-slate-700">
				{#each nonCoveredItems as item (item)}
					<li class="flex items-start gap-2">
						<span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</Card>
