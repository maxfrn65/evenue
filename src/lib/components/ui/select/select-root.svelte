<script lang="ts">
	import { Select } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'single';
		name?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		children?: Snippet;
	}

	let { type = 'single', name, value = $bindable(''), onValueChange, children }: Props = $props();
</script>

<Select.Root type="single" {name} bind:value {onValueChange}>
	{#if children}
		{@render children()}
	{/if}
</Select.Root>
