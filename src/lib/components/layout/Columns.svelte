<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		mobile?: boolean;
		class?: ClassValue;
		children: Snippet;
	};

	let { mobile = false, class: className, children, ...rest }: Props = $props();
</script>

<div {...rest} class={['flex gap-4 tablet:gap-5', mobile ? 'flex-row' : 'flex-col tablet:flex-row', className]}>
	{@render children()}
</div>
