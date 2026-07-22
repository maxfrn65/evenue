<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type Variant = 'default' | 'secondary' | 'outline' | 'emerald' | 'purple' | 'amber';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: Variant;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className = '', children, ...rest }: Props = $props();

	const variantStyles: Record<Variant, string> = {
		default: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
		secondary: 'bg-slate-800 text-slate-300 border-slate-700',
		outline: 'border-white/20 text-slate-200 bg-transparent',
		emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
		amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
	};
</script>

<div
	class={cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
		variantStyles[variant],
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</div>
