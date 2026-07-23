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
		default: 'bg-slate-100 text-slate-900 border-slate-200',
		secondary: 'bg-slate-200 text-slate-800 border-slate-300',
		outline: 'border-slate-300 text-slate-800 bg-white',
		emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		purple: 'bg-slate-900 text-white border-slate-900',
		amber: 'bg-amber-50 text-amber-800 border-amber-200'
	};
</script>

<div
	class={cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
		variantStyles[variant],
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</div>
