<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
	<Header />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
