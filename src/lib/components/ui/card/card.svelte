<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className = '', children, ...rest }: Props = $props();
</script>

<div
	class={cn(
		'glass-card rounded-2xl overflow-hidden border border-white/10 text-slate-100 shadow-xl transition-all duration-300',
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</div>
