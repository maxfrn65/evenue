<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLLabelAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: className = '', children, ...rest }: Props = $props();
</script>

<label
	class={cn(
		'block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</label>
