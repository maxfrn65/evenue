<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type Variant = 'default' | 'gradient' | 'outline' | 'ghost' | 'secondary' | 'emerald';
	type Size = 'sm' | 'default' | 'lg' | 'icon';

	interface Props {
		variant?: Variant;
		size?: Size;
		class?: string;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		href,
		type = 'button',
		disabled = false,
		onclick,
		children,
		...rest
	}: Props = $props();

	const variantStyles: Record<Variant, string> = {
		default: 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/20 border border-purple-500/30',
		gradient: 'gradient-button',
		outline: 'border border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white',
		ghost: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white',
		secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
		emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 border border-emerald-500/30'
	};

	const sizeStyles: Record<Size, string> = {
		sm: 'h-8 px-3 text-xs rounded-lg',
		default: 'h-10 px-4 py-2 text-sm rounded-xl',
		lg: 'h-12 px-6 text-base rounded-xl',
		icon: 'h-10 w-10 p-0 rounded-xl flex items-center justify-center'
	};

	const combinedClasses = $derived(
		cn(
			'inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
			variantStyles[variant],
			sizeStyles[size],
			className
		)
	);
</script>

{#if href}
	<a {href} class={combinedClasses} {onclick} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</a>
{:else}
	<button {type} {disabled} class={combinedClasses} {onclick} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
