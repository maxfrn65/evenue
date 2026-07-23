<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { ShieldCheck, Lock, PartyPopper } from 'lucide-svelte';
</script>

<footer class="bg-slate-950 border-t border-slate-800 pt-16 pb-12 text-slate-400 text-sm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
			<!-- Brand col -->
			<div class="space-y-4 md:col-span-1">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
						<PartyPopper class="w-4 h-4 text-white" />
					</div>
					<span class="text-lg font-bold text-white tracking-tight">Evenue</span>
				</div>
				<p class="text-xs text-slate-400 leading-relaxed">
					La première plateforme de location de logements dédiée aux événements privés avec assurance dégradations Wakam embarquée nativement.
				</p>
				<div class="flex items-center gap-3 text-xs text-slate-400">
					<span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5 text-emerald-400" /> Wakam InsurTech</span>
					<span class="flex items-center gap-1"><Lock class="w-3.5 h-3.5 text-indigo-400" /> Stripe Escrow</span>
				</div>
			</div>

			<!-- Navigation -->
			<div>
				<h4 class="text-white font-semibold mb-4 text-sm">Plateforme</h4>
				<ul class="space-y-2.5 text-xs">
					<li><a href="/listings" class="hover:text-white transition-colors">Catalogue de lieux</a></li>
					<li><a href="/become-host" class="hover:text-white transition-colors">Publier un logement</a></li>
					<li><a href="/comment-ca-marche" class="hover:text-white transition-colors">Comment ça marche</a></li>
				</ul>
			</div>

			<!-- Assurance & Confiance -->
			<div>
				<h4 class="text-white font-semibold mb-4 text-sm">Tiers de Confiance</h4>
				<ul class="space-y-2.5 text-xs">
					<li><a href="/kyc-stripe" class="hover:text-white transition-colors">Vérification d'identité (KYC)</a></li>
					<li><a href="/sequestre" class="hover:text-white transition-colors">Séquestre des fonds Stripe</a></li>
					<li><a href="/cgv-assurance" class="hover:text-white transition-colors">CGV Police Wakam</a></li>
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h4 class="text-white font-semibold mb-4 text-sm">Mentions & Conformité</h4>
				<ul class="space-y-2.5 text-xs">
					<li><a href="/mentions-legales" class="hover:text-white transition-colors">Mentions légales</a></li>
					<li><a href="/confidentialite" class="hover:text-white transition-colors">Politique RGPD</a></li>
					<li><a href="/securite" class="hover:text-white transition-colors">OWASP & Security by Design</a></li>
				</ul>
			</div>
		</div>

		<!-- Bottom copyright -->
		<div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
			<p>© 2026 Evenue Inc. Tous droits réservés. Plateforme développée conformément aux normes RNCP39583.</p>
			<p class="text-slate-500">Hébergement Souverain Scaleway UE (Datacenter France)</p>
		</div>
	</div>
</footer>
