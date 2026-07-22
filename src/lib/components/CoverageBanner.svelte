<script lang="ts">
	import { ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, XCircle } from 'lucide-svelte';

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

<div class="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden border border-purple-500/20">
	<!-- Background glow -->
	<div class="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

	<!-- Header -->
	<div class="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
		<div class="flex items-center gap-3">
			<div class="p-3 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30">
				<ShieldCheck class="w-7 h-7" />
			</div>
			<div>
				<h3 class="text-xl font-bold text-white flex items-center gap-2">
					Assurance Événementielle Embarquée Wakam
					<span class="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
						Native & Sans Frais
					</span>
				</h3>
				<p class="text-sm text-slate-400 mt-0.5">
					Chaque réservation inclut une police d'assurance automatique émise par Wakam AssurTech.
				</p>
			</div>
		</div>
		<div class="hidden sm:flex items-center gap-2 text-xs text-purple-300 bg-purple-900/40 px-3 py-1.5 rounded-lg border border-purple-500/30">
			<Sparkles class="w-4 h-4 text-amber-400" />
			<span>0 € de surcoût masqué</span>
		</div>
	</div>

	<!-- Details grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Covered -->
		<div class="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-5">
			<h4 class="text-emerald-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
				<CheckCircle2 class="w-4 h-4 text-emerald-400" />
				Ce qui est couvert par la police Wakam
			</h4>
			<ul class="space-y-2.5 text-sm text-slate-300">
				{#each coveredItems as item}
					<li class="flex items-start gap-2.5">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Non Covered -->
		<div class="bg-rose-950/20 border border-rose-500/20 rounded-xl p-5">
			<h4 class="text-rose-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
				<XCircle class="w-4 h-4 text-rose-400" />
				Ce qui n'est pas couvert (Transparence CGV)
			</h4>
			<ul class="space-y-2.5 text-sm text-slate-300">
				{#each nonCoveredItems as item}
					<li class="flex items-start gap-2.5">
						<span class="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
