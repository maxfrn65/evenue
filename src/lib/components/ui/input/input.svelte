<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLInputAttributes {
		class?: string;
		value?: string | number;
	}

	let { class: className = '', value = $bindable(), ...rest }: Props = $props();
</script>

<input
	bind:value
	class={cn(
		'flex h-10 w-full rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 text-xs md:text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
		className
	)}
	{...rest}
/>
