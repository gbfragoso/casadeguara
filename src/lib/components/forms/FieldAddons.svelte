<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		class?: ClassValue;
		children: Snippet;
	};

	let { class: className, children, ...rest }: Props = $props();
</script>

<div
	{...rest}
	class={[
		'flex flex-col gap-2 tablet:flex-row tablet:gap-0 tablet:*:not-first:rounded-l-none tablet:*:not-last:rounded-r-none',
		className,
	]}>
	{@render children()}
</div>
