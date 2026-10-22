<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		class?: ClassValue;
		children: Snippet;
	};

	let { class: className, children, ...rest }: Props = $props();
</script>

<section {...rest} class={['px-4 py-6 tablet:px-6 desktop:px-10 desktop:py-8 print:p-0', className]}>
	{@render children()}
</section>
