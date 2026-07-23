<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';

	let { data, children } = $props();
</script>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
>
	Aller au contenu principal
</a>
<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
	<Header user={data.user} unreadMessageCount={data.unreadMessageCount} />
	<main id="main" tabindex="-1" class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
