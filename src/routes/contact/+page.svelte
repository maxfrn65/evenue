<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Mail, Phone, MapPin, Send, CheckCircle2 } from '@lucide/svelte';

	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let sent = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email || !message) return;
		sent = true;
	}
</script>

<div class="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="space-y-3 text-center">
		<Badge variant="purple" class="gap-1.5 px-3 py-1 text-xs">
			<Mail class="h-4 w-4" />
			Support & Assistance Client
		</Badge>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
			Contactez l'Équipe Evenue
		</h1>
		<p class="text-xs text-slate-500 max-w-xl mx-auto">
			Une question sur une réservation, la garantie Wakam ou la mise en ligne de votre bien ? Nos conseillers vous répondent sous 24h.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<!-- Contact Info Cards -->
		<div class="space-y-4 md:col-span-1">
			<Card.Root class="border-slate-200 p-4 space-y-2">
				<div class="flex items-center gap-2 text-purple-900 font-bold text-xs">
					<Mail class="h-4 w-4 text-purple-700" />
					Par Email
				</div>
				<p class="text-xs text-slate-600 font-semibold">support@evenue.fr</p>
			</Card.Root>

			<Card.Root class="border-slate-200 p-4 space-y-2">
				<div class="flex items-center gap-2 text-purple-900 font-bold text-xs">
					<Phone class="h-4 w-4 text-purple-700" />
					Par Téléphone
				</div>
				<p class="text-xs text-slate-600 font-semibold">+33 (0)1 89 40 12 34</p>
			</Card.Root>

			<Card.Root class="border-slate-200 p-4 space-y-2">
				<div class="flex items-center gap-2 text-purple-900 font-bold text-xs">
					<MapPin class="h-4 w-4 text-purple-700" />
					Bureaux Evenue
				</div>
				<p class="text-xs text-slate-600 leading-relaxed">
					142 Rue de Rivoli<br>75001 Paris, France
				</p>
			</Card.Root>
		</div>

		<!-- Contact Form -->
		<Card.Root class="border-slate-200 p-6 md:col-span-2 space-y-6">
			{#if sent}
				<div class="text-center py-8 space-y-3">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
						<CheckCircle2 class="h-6 w-6" />
					</div>
					<h3 class="text-lg font-bold text-slate-950">Message Envoyé avec Succès !</h3>
					<p class="text-xs text-slate-600">Notre équipe support prend en charge votre demande et vous répondra à l'adresse <strong>{email}</strong> dans les meilleurs délais.</p>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-1.5">
						<Label for="contact-email">Votre Adresse Email</Label>
						<InputGroup.Root>
							<InputGroup.Input id="contact-email" type="email" bind:value={email} placeholder="nom@domaine.fr" required />
						</InputGroup.Root>
					</div>

					<div class="space-y-1.5">
						<Label for="contact-subject">Sujet de votre demande</Label>
						<InputGroup.Root>
							<InputGroup.Input id="contact-subject" type="text" bind:value={subject} placeholder="Question sur ma réservation, l'assurance Wakam..." required />
						</InputGroup.Root>
					</div>

					<div class="space-y-1.5">
						<Label for="contact-message">Votre Message</Label>
						<Textarea id="contact-message" bind:value={message} rows={4} placeholder="Détaillez votre demande ici..." required />
					</div>

					<Button type="submit" variant="default" class="w-full gap-2 bg-purple-900 text-white hover:bg-purple-800 font-bold">
						<Send class="h-4 w-4" />
						Envoyer mon message
					</Button>
				</form>
			{/if}
		</Card.Root>
	</div>
</div>
