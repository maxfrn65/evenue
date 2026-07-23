<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		Search,
		ShieldCheck,
		CreditCard,
		Calendar,
		MessageSquare,
		CheckCircle2,
		AlertTriangle,
		Building2,
		Lock,
		Sparkles,
		HelpCircle,
		ArrowRight,
		UserCheck,
		FileText
	} from '@lucide/svelte';

	let activeTab = $state<'GUEST' | 'HOST'>('GUEST');

	const guestSteps = [
		{
			number: '01',
			title: 'Recherche Géolocalisée & Filtrée par Date',
			description: 'Explorez des lieux uniques d\'exception (villas, bastides, lofts) filtrés instantanément selon la ville et vos dates d\'événement.',
			icon: Search
		},
		{
			number: '02',
			title: 'Réservation Sécurisée & Séquestre Stripe',
			description: 'Réservez en toute sérénité. Vos fonds sont placés sous séquestre bancaire sécurisé Stripe Connect et ne sont versés à l\'hôte qu\'après l\'événement.',
			icon: CreditCard
		},
		{
			number: '03',
			title: 'Assurance Wakam Embarquée & Attestation PDF',
			description: 'Chaque réservation inclut automatiquement la protection Wakam (jusqu\'à 10 000 € de couverture dégradations). Téléchargez votre attestation PDF certifiée.',
			icon: ShieldCheck
		},
		{
			number: '04',
			title: 'Échange Direct avec l\'Hôte',
			description: 'Communiquez facilement via la messagerie instantanée Evenue pour organiser les modalités d\'entrée et d\'état des lieux.',
			icon: MessageSquare
		}
	];

	const hostSteps = [
		{
			number: '01',
			title: 'Publication d\'Annonce & Plages de Disponibilité',
			description: 'Publiez votre logement en quelques clics. Définissez vos tarifs, votre capacité d\'accueil et vos plages de dates de disponibilité précises.',
			icon: Building2
		},
		{
			number: '02',
			title: 'Vérification d\'Identité KYC Stripe Connect',
			description: 'Bénéficiez d\'une sécurité maximale grâce à la vérification KYC Stripe Connect Express pour recevoir vos paiements directement sur votre compte bancaire.',
			icon: UserCheck
		},
		{
			number: '03',
			title: 'Protection Wakam 10 000 € Incluses',
			description: 'Votre bien est couvert automatiquement contre les dégradations matérielles et la responsabilité civile événementielle jusqu\'à 1 000 000 €.',
			icon: ShieldCheck
		},
		{
			number: '04',
			title: 'Gestion des Sinistres sous 7 Jours',
			description: 'À la fin de l\'événement, vous disposez d\'une fenêtre de 7 jours pour constater un éventuel sinistre et geler le séquestre Stripe le temps de l\'instruction.',
			icon: AlertTriangle
		}
	];

	const faqs = [
		{
			question: 'Comment fonctionne l\'assurance Wakam embarquée ?',
			answer: 'L\'assurance Wakam est automatiquement incluse dans chaque réservation effectuée sur Evenue. Elle couvre les dommages matériels au bâtiment et au mobilier jusqu\'à 10 000 €, ainsi que la responsabilité civile événementielle jusqu\'à 1 000 000 €, sans franchise requise pour l\'hôte.'
		},
		{
			question: 'Quand l\'hôte reçoit-il le paiement de sa location ?',
			answer: 'Les fonds versés par le convive sont placés sous séquestre sécurisé Stripe Connect dès la réservation. Ils sont automatiquement libérés vers le compte bancaire de l\'hôte 7 jours après la fin de l\'événement, à condition qu\'aucun sinistre n\'ait été déclaré.'
		},
		{
			question: 'Que se passe-t-il si un sinistre survient pendant un événement ?',
			answer: 'L\'hôte propriétaire dispose d\'une fenêtre de 7 jours post-événement pour déclarer un sinistre via son tableau de bord Evenue. Cette déclaration géle immédiatement les fonds sous séquestre Stripe. Le locataire a la possibilité de contester la déclaration avec ses propres pièces justificatives (état des lieux, photos) avant transmission à Wakam.'
		},
		{
			question: 'Les annonces sont-elles synchronisées pour éviter les doubles réservations ?',
			answer: 'Oui, Evenue supporte la synchronisation bidirectionnelle iCal. Si vous utilisez Airbnb ou d\'autres plateformes, vos calendriers restent parfaitement synchronisés en temps réel.'
		}
	];
</script>

<div class="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Hero Section -->
	<div class="space-y-4 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1 text-xs">
			<Sparkles class="h-3.5 w-3.5" />
			Plateforme Privée de Location d'Événements
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Comment fonctionne Evenue ?
		</h1>
		<p class="mx-auto max-w-2xl text-sm text-slate-600 leading-relaxed">
			Découvrez la simplicité et la sécurité d'Evenue. Que vous organisiez une réception ou mettiez votre lieu à disposition, nous sécurisons chaque étape avec le séquestre Stripe et la garantie Wakam.
		</p>
	</div>

	<!-- Toggle Tabs (Convive vs Hôte) -->
	<div class="flex justify-center">
		<div class="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1.5">
			<button
				type="button"
				class={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-bold transition-all ${
					activeTab === 'GUEST'
						? 'bg-white text-slate-950 shadow-sm'
						: 'text-slate-600 hover:text-slate-950'
				}`}
				onclick={() => (activeTab = 'GUEST')}
			>
				<Search class="h-4 w-4 text-purple-700" />
				Je suis un Convive / Organisateur
			</button>
			<button
				type="button"
				class={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-bold transition-all ${
					activeTab === 'HOST'
						? 'bg-purple-900 text-white shadow-sm'
						: 'text-slate-600 hover:text-slate-950'
				}`}
				onclick={() => (activeTab = 'HOST')}
			>
				<Building2 class="h-4 w-4 text-purple-300" />
				Je suis un Hôte Propriétaire
			</button>
		</div>
	</div>

	<!-- Step by Step Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#if activeTab === 'GUEST'}
			{#each guestSteps as step (step.number)}
				<Card.Root class="space-y-4 border-slate-200 p-6 transition-all hover:border-purple-300 hover:shadow-md">
					<div class="flex items-center justify-between">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
							<step.icon class="h-6 w-6" />
						</div>
						<span class="text-2xl font-black text-slate-200">{step.number}</span>
					</div>
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-slate-950">{step.title}</h3>
						<p class="text-xs leading-relaxed text-slate-600">{step.description}</p>
					</div>
				</Card.Root>
			{/each}
		{:else}
			{#each hostSteps as step (step.number)}
				<Card.Root class="space-y-4 border-purple-200 bg-purple-50/30 p-6 transition-all hover:border-purple-400 hover:shadow-md">
					<div class="flex items-center justify-between">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-900 text-white">
							<step.icon class="h-6 w-6" />
						</div>
						<span class="text-2xl font-black text-purple-300">{step.number}</span>
					</div>
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-slate-950">{step.title}</h3>
						<p class="text-xs leading-relaxed text-slate-600">{step.description}</p>
					</div>
				</Card.Root>
			{/each}
		{/if}
	</div>

	<!-- Trust Features Callout -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<Card.Root class="border-emerald-200 bg-emerald-50/50 p-6 space-y-3">
			<div class="flex items-center gap-2 font-bold text-emerald-900 text-sm">
				<ShieldCheck class="h-5 w-5 text-emerald-600" />
				Assurance Wakam 10 000 €
			</div>
			<p class="text-xs text-emerald-950 leading-relaxed">
				Chaque réservation bénéficie automatiquement d'une protection couvrant jusqu'à 10 000 € de dégradations matérielles et 1 000 000 € de responsabilité civile.
			</p>
			<Button href="/cgv-assurance" variant="outline" size="sm" class="gap-1 border-emerald-300 text-emerald-900 bg-white hover:bg-emerald-100">
				En savoir plus <ArrowRight class="h-3.5 w-3.5" />
			</Button>
		</Card.Root>

		<Card.Root class="border-indigo-200 bg-indigo-50/50 p-6 space-y-3">
			<div class="flex items-center gap-2 font-bold text-indigo-900 text-sm">
				<Lock class="h-5 w-5 text-indigo-600" />
				Séquestre Stripe Connect
			</div>
			<p class="text-xs text-indigo-950 leading-relaxed">
				Les fonds de la réservation sont conservés en toute sécurité sous séquestre bancaire et libérés automatiquement vers l'hôte 7 jours après la fin de l'événement.
			</p>
			<Button href="/sequestre" variant="outline" size="sm" class="gap-1 border-indigo-300 text-indigo-900 bg-white hover:bg-indigo-100">
				Découvrir le séquestre <ArrowRight class="h-3.5 w-3.5" />
			</Button>
		</Card.Root>

		<Card.Root class="border-purple-200 bg-purple-50/50 p-6 space-y-3">
			<div class="flex items-center gap-2 font-bold text-purple-900 text-sm">
				<Building2 class="h-5 w-5 text-purple-600" />
				Devenez Hôte Propriétaire
			</div>
			<p class="text-xs text-purple-950 leading-relaxed">
				Monétisez vos bastides, lofts ou domaines pour des événements privés en toute tranquillité d'esprit grâce à notre écosystème 100% sécurisé.
			</p>
			<Button href="/become-host" variant="default" size="sm" class="gap-1 bg-purple-900 text-white hover:bg-purple-800">
				Publier une annonce <ArrowRight class="h-3.5 w-3.5" />
			</Button>
		</Card.Root>
	</div>

	<!-- FAQ Accordion Section -->
	<div class="space-y-6 pt-6">
		<div class="space-y-2 text-center">
			<h2 class="flex items-center justify-center gap-2 text-2xl font-bold text-slate-950">
				<HelpCircle class="h-5 w-5 text-purple-700" />
				Foire Aux Questions (FAQ)
			</h2>
			<p class="text-xs text-slate-500">Toutes les réponses à vos questions sur le fonctionnement d'Evenue.</p>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each faqs as faq}
				<Card.Root class="border-slate-200 p-5 space-y-2">
					<h4 class="font-bold text-slate-950 text-sm flex items-start gap-2">
						<CheckCircle2 class="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
						{faq.question}
					</h4>
					<p class="text-xs text-slate-600 leading-relaxed pl-6">
						{faq.answer}
					</p>
				</Card.Root>
			{/each}
		</div>
	</div>
</div>
