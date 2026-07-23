<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import {
		MessageSquare,
		Send,
		User,
		ArrowLeft,
		CheckCheck,
		Clock,
		ShieldCheck
	} from '@lucide/svelte';

	let { data } = $props();

	const user = $derived(data.user);
	let conversations = $state<any[]>([]);
	let activePartner = $state<any>(null);
	let messages = $state<any[]>([]);
	let bookingId = $state<string | undefined>(undefined);
	let newMessage = $state('');
	let sending = $state(false);
	let sendError = $state('');

	let pollInterval: any;

	$effect(() => {
		conversations = data.conversations || [];
		activePartner = data.activePartner || null;
		messages = data.activeMessages || [];
		bookingId = data.bookingId;
	});

	async function loadMessages(partnerId: string) {
		try {
			const searchParams = new URLSearchParams({ otherUserId: partnerId });
			if (bookingId) searchParams.set('bookingId', bookingId);
			const res = await fetch(`/api/messages?${searchParams}`);
			const resData = await res.json();
			if (res.ok && resData.success) {
				messages = resData.messages;
				conversations = conversations.map((conversation) =>
					conversation.partner.id === partnerId
						? { ...conversation, unreadCount: 0 }
						: conversation
				);
			}
		} catch (e) {
			// Silent error handling on poll
		}
	}

	async function selectPartner(partner: any) {
		activePartner = partner;
		await loadMessages(partner.id);
	}

	async function handleSendMessage(e: Event) {
		e.preventDefault();
		if (!newMessage.trim() || !activePartner || sending) return;

		sending = true;
		const contentToSend = newMessage.trim();
		newMessage = '';
		sendError = '';

		try {
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					receiverId: activePartner.id,
					content: contentToSend,
					bookingId
				})
			});

			const resData = await res.json();
			if (res.ok && resData.success) {
				messages = [...messages, resData.message];
			} else {
				newMessage = contentToSend;
				sendError = resData.error || "L'envoi du message a échoué.";
			}
		} catch (e) {
			newMessage = contentToSend;
			sendError = "L'envoi du message a échoué. Vérifiez votre connexion puis réessayez.";
		} finally {
			sending = false;
		}
	}

	onMount(() => {
		pollInterval = setInterval(() => {
			if (activePartner) {
				loadMessages(activePartner.id);
			}
		}, 3000);
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
				Messagerie
			</h1>
			<p class="text-xs text-slate-500">
				Échangez en direct avec vos hôtes et invités pour l'organisation de vos événements.
			</p>
		</div>
		<Button href="/dashboard" variant="outline" size="sm" class="gap-1">
			<ArrowLeft class="h-4 w-4" />
			Retour au Dashboard
		</Button>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Left: Conversations List -->
		<Card class="space-y-3 p-4 md:col-span-1">
			<h2 class="text-sm font-bold text-slate-900">Conversations</h2>

			{#if conversations.length === 0 && !activePartner}
				<div class="py-12 text-center text-xs text-slate-500">
					Aucune conversation active pour le moment.
				</div>
			{:else}
				<div class="space-y-1">
					{#each conversations as c (c.partner.id)}
						<button
							type="button"
							onclick={() => selectPartner(c.partner)}
							class={`w-full rounded-xl p-3 text-left transition-all ${
								activePartner?.id === c.partner.id
									? 'bg-slate-50 border border-slate-200'
									: 'hover:bg-slate-50 border border-transparent'
							}`}
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2.5">
									<div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 font-bold text-white text-xs">
										{c.partner.firstName[0]}
									</div>
									<div>
										<p class="text-xs font-bold text-slate-900">{c.partner.firstName} {c.partner.lastName}</p>
										<p class="line-clamp-1 text-[11px] text-slate-500">{c.lastMessage.content}</p>
									</div>
								</div>

								{#if c.unreadCount > 0}
									<Badge variant="purple" class="h-5 min-w-5 px-1.5 text-[10px]">
										{c.unreadCount}
									</Badge>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</Card>

		<!-- Right: Active Chat Window -->
		<Card class="flex h-[600px] flex-col p-0 md:col-span-2 overflow-hidden border-slate-200">
			{#if activePartner}
				<!-- Partner Header -->
				<div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 font-bold text-white text-sm">
							{activePartner.firstName[0]}
						</div>
						<div>
							<h3 class="text-sm font-bold text-slate-900">
								{activePartner.firstName} {activePartner.lastName}
							</h3>
							<div class="flex items-center gap-2">
								<Badge variant={activePartner.role === 'HOST' ? 'purple' : 'secondary'} class="text-[10px]">
									{activePartner.role === 'HOST' ? 'Hôte' : 'Invité'}
								</Badge>
								<span class="flex items-center gap-1 text-[10px] text-emerald-600">
									<ShieldCheck class="h-3 w-3" /> Evenue Verified
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Messages Scrollable Body -->
				<div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
					{#if messages.length === 0}
						<div class="flex h-full flex-col items-center justify-center text-center text-xs text-slate-400">
							<MessageSquare class="h-8 w-8 text-slate-300 mb-2" />
							Démarrez la conversation en envoyant votre premier message !
						</div>
					{:else}
						{#each messages as msg (msg.id)}
							<div class={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
								<div
									class={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
										msg.senderId === user.id
											? 'bg-slate-950 text-white rounded-br-none'
											: 'bg-white text-slate-900 border border-slate-200 shadow-xs rounded-bl-none'
									}`}
								>
									<p class="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
									<div class="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-70">
										<span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
										{#if msg.senderId === user.id}
											<CheckCheck class="h-3 w-3" />
										{/if}
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Message Input Footer -->
				<form onsubmit={handleSendMessage} class="border-t border-slate-100 bg-white p-3 gap-2 flex items-center">
					<Textarea
						bind:value={newMessage}
						placeholder="Écrivez votre message..."
						rows={1}
						class="min-h-1 resize-none text-xs"
						onkeydown={(e: KeyboardEvent) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSendMessage(e);
							}
						}}
					/>
					<Button
						type="submit"
						disabled={sending || !newMessage.trim()}
						size="icon"
						class="h-10 w-10 rounded-full"
					>
						<Send />
					</Button>
				</form>
				{#if sendError}
					<p class="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700" role="alert">
						{sendError}
					</p>
				{/if}
			{:else}
				<div class="flex h-full flex-col items-center justify-center text-center text-xs text-slate-400">
					<MessageSquare class="h-10 w-10 text-slate-300 mb-2" />
					Sélectionnez une conversation dans la liste pour afficher les échanges.
				</div>
			{/if}
		</Card>
	</div>
</div>
