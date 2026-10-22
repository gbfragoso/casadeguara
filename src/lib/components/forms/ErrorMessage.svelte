<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		element?: 'p' | 'div';
		class?: ClassValue;
		children: Snippet;
	};

	let { element = 'p', class: className, children, ...rest }: Props = $props();
</script>

<svelte:element this={element} {...rest} class={['flex gap-1.5 text-sm wrap-anywhere text-danger-ink', className]}>
	<i class="fa-solid fa-circle-exclamation fa-fw mt-0.5" aria-hidden="true"></i>{@render children()}
</svelte:element>
