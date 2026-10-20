<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLSelectAttributes } from 'svelte/elements';
	import { CONTROL_CLASSES } from '#lib/components/forms/control-classes.js';

	type Props = Omit<HTMLSelectAttributes, 'class' | 'children'> & {
		class?: ClassValue;
		children: Snippet;
	};

	let { value = $bindable(), multiple = false, class: className, children, ...rest }: Props = $props();
</script>

<div class={['relative', className]}>
	{#if multiple}
		<select {...rest} multiple bind:value class={[CONTROL_CLASSES, 'h-28 py-2']}>
			{@render children()}
		</select>
	{:else}
		<select {...rest} bind:value class={[CONTROL_CLASSES, 'appearance-none pr-10']}>
			{@render children()}
		</select>
		<i
			class="fa-solid fa-chevron-down fa-fw pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-muted"
			aria-hidden="true"></i>
	{/if}
</div>
