<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		class?: ClassValue;
		children: Snippet;
	};

	let { class: className, children, ...rest }: Props = $props();
</script>

<div {...rest} class={['flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:items-end', className]}>
	{@render children()}
</div>
