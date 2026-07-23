<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ShieldCheck, CheckCircle2, FileText, Lock, ArrowRight } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="emerald" class="gap-1.5 px-3 py-1 text-xs">
			<ShieldCheck class="h-4 w-4" />
			Wakam InsurTech — Police Certifiée
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Conditions Générales d'Assurance Wakam
		</h1>
		<p class="text-xs text-slate-500 max-w-2xl mx-auto">
			Toutes les réservations effectuées sur Evenue bénéficient automatiquement de la couverture assurance événementielle souscrite auprès de Wakam SA.
		</p>
	</div>

	<!-- Main Guarantees Table/Cards -->
	<Card.Root class="border-emerald-200 bg-emerald-50/30 p-6 space-y-6">
		<div class="flex items-center gap-3 border-b border-emerald-200 pb-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
				<ShieldCheck class="h-6 w-6" />
			</div>
			<div>
				<h2 class="text-lg font-bold text-slate-950">Garanties Incluse de Plein Droit</h2>
				<p class="text-xs text-slate-600">Police N° WAK-EVENEUE-2026 — Applicable sur l'ensemble du territoire français</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
				<p class="text-xs font-bold text-slate-500 uppercase">Dommages Matériels</p>
				<p class="text-2xl font-black text-emerald-800">10 000 €</p>
				<p class="text-xs text-slate-600 leading-relaxed">
					Couverture des dégâts au bâtiment, sols, vitres, mobilier et équipement de sonorisation.
				</p>
			</div>

			<div class="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
				<p class="text-xs font-bold text-slate-500 uppercase">Responsabilité Civile</p>
				<p class="text-2xl font-black text-indigo-800">1 000 000 €</p>
				<p class="text-xs text-slate-600 leading-relaxed">
					Protection contre les dommages corporels ou matériels causés aux tiers pendant la location.
				</p>
			</div>

			<div class="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
				<p class="text-xs font-bold text-slate-500 uppercase">Franchise Hôte</p>
				<p class="text-2xl font-black text-slate-950">0 €</p>
				<p class="text-xs text-slate-600 leading-relaxed">
					Aucune franchise n'est réclamée à l'hôte lors du déclenchement et de l'instruction d'un sinistre.
				</p>
			</div>
		</div>
	</Card.Root>

	<!-- Terms breakdown -->
	<div class="space-y-6 text-sm text-slate-700 leading-relaxed">
		<div class="space-y-2">
			<h3 class="font-bold text-slate-950 text-base flex items-center gap-2">
				<CheckCircle2 class="h-4 w-4 text-emerald-600" />
				1. Procédure de Déclaration de Sinistre (Window 7 Jours)
			</h3>
			<p class="text-xs text-slate-600">
				En cas de dégradation constatée à l'issue d'un événement, le propriétaire (Hôte) dispose d'un délai strict de **7 jours après la date de fin de réservation** pour enregistrer sa déclaration depuis son tableau de bord Evenue. La déclaration entraîne l'arrêt immédiat de la libération automatique du séquestre Stripe Connect.
			</p>
		</div>

		<div class="space-y-2">
			<h3 class="font-bold text-slate-950 text-base flex items-center gap-2">
				<CheckCircle2 class="h-4 w-4 text-emerald-600" />
				2. Droit de Contestation du Locataire
			</h3>
			<p class="text-xs text-slate-600">
				Le locataire (Convive) est immédiatement notifié lors de l'ouverture d'un dossier. Il dispose du droit de contester les déclarations indues en transmettant ses pièces justificatives (états des lieux d'entrée et de sortie, photos horodatées).
			</p>
		</div>

		<div class="space-y-2">
			<h3 class="font-bold text-slate-950 text-base flex items-center gap-2">
				<CheckCircle2 class="h-4 w-4 text-emerald-600" />
				3. Attestation et Preuve de Couverture
			</h3>
			<p class="text-xs text-slate-600">
				Pour chaque réservation confirmée, une attestation d'assurance certifiée comportant un numéro de police unique est générée automatiquement et téléchargeable au format PDF/HTML depuis l'espace utilisateur.
			</p>
		</div>
	</div>

	<!-- CTA -->
	<div class="flex justify-center pt-4">
		<Button href="/comment-ca-marche" variant="default" class="gap-2 bg-slate-950 text-white hover:bg-slate-800">
			Comprendre le fonctionnement d'Evenue <ArrowRight class="h-4 w-4" />
		</Button>
	</div>
</div>
