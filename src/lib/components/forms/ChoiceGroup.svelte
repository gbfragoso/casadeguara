<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		class?: ClassValue;
		children: Snippet;
	};

	let { class: className, children, ...rest }: Props = $props();
</script>

<div {...rest} class={['flex flex-wrap gap-x-5', className]}>
	{@render children()}
</div>
