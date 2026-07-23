<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';

	let { data, children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
	<Header user={data.user} unreadMessageCount={data.unreadMessageCount} />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
