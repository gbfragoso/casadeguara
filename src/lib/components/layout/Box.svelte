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
		'rounded-lg border border-divider bg-surface p-4 text-ink shadow-card print:border-0 print:p-0',
		className,
	]}>
	{@render children()}
</div>
