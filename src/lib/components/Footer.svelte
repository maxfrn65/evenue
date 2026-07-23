<script lang="ts">
	import logoNobg from '$lib/assets/logotype_nobg.png';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { ShieldCheck, Lock } from '@lucide/svelte';
</script>

<footer class="pt-16 pb-12 text-sm border-t border-slate-200 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
			<!-- Brand col -->
			<div class="space-y-4 md:col-span-1">
				<div class="flex items-center gap-2.5">
					<img src={logoNobg} alt="Evenue" class="h-8 w-auto" />
				</div>
				<p class="text-xs leading-relaxed">
					La première plateforme de location de logements dédiée aux événements privés avec assurance dégradations Wakam embarquée nativement.
				</p>
				<div class="flex items-center gap-3 text-xs ">
					<span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5 text-emerald-400" /> Wakam InsurTech</span>
					<span class="flex items-center gap-1"><Lock class="w-3.5 h-3.5 text-indigo-400" /> Stripe Escrow</span>
				</div>
			</div>

			<!-- Navigation -->
			<div>
				<h4 class="font-semibold mb-4 text-sm">Plateforme</h4>
				<ul class="space-y-2.5 text-xs">
					<li><a href="/listings">Catalogue de lieux</a></li>
					<li><a href="/become-host">Publier un logement</a></li>
					<li><a href="/comment-ca-marche">Comment ça marche</a></li>
				</ul>
			</div>

			<!-- Assurance & Confiance -->
			<div>
				<h4 class="font-semibold mb-4 text-sm">Tiers de Confiance</h4>
				<ul class="space-y-2.5 text-xs">
					<li><a href="/kyc-stripe">Vérification d'identité (KYC)</a></li>
					<li><a href="/sequestre">Séquestre des fonds Stripe</a></li>
					<li><a href="/cgv-assurance">CGV Police Wakam</a></li>
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h4 class="font-semibold mb-4 text-sm">Mentions & Conformité</h4>
				<ul class="space-y-2.5 text-xs">
					<li><a href="/mentions-legales" class="hover:text-purple-900 transition-colors">Mentions légales & CGU</a></li>
					<li><a href="/confidentialite" class="hover:text-purple-900 transition-colors">Politique RGPD</a></li>
					<li><a href="/securite" class="hover:text-purple-900 transition-colors">OWASP & Security by Design</a></li>
					<li><a href="/contact" class="hover:text-purple-900 transition-colors font-semibold text-purple-800">Support & Contact</a></li>
				</ul>
			</div>
		</div>

		<!-- Bottom copyright -->
		<div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
			<p>© 2026 Evenue Inc. Tous droits réservés.</p>
		</div>
	</div>
</footer>
