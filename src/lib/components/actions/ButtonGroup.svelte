<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type ButtonGroupAlignment = 'start' | 'end' | 'between';
	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		align?: ButtonGroupAlignment;
		class?: ClassValue;
		children: Snippet;
	};

	const ALIGNMENTS: Record<ButtonGroupAlignment, string> = {
		start: 'tablet:justify-start',
		end: 'tablet:justify-end',
		between: 'tablet:justify-between',
	};

	let { align = 'start', class: className, children, ...rest }: Props = $props();
</script>

<div
	{...rest}
	class={['flex flex-col flex-wrap gap-3 tablet:flex-row tablet:items-center', ALIGNMENTS[align], className]}>
	{@render children()}
</div>
