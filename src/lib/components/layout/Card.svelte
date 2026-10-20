<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes, HTMLFormAttributes } from 'svelte/elements';

	type CardStyle = { padded?: boolean; class?: ClassValue; children: Snippet };
	type Props = CardStyle &
		(
			| (Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & { element?: 'div' | 'section' })
			| (Omit<HTMLFormAttributes, 'class' | 'children'> & { element: 'form' })
		);

	let { element = 'div', padded = true, class: className, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={element}
	{...rest}
	class={[
		'rounded-lg border border-divider bg-surface shadow-card print:border-0 print:p-0',
		padded && 'p-5 tablet:p-6',
		className,
	]}>
	{@render children()}
</svelte:element>
