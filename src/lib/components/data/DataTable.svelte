<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		caption?: string;
		tableId?: string;
		class?: ClassValue;
		head: Snippet;
		foot?: Snippet;
		children: Snippet;
	};

	let { caption, tableId, class: className, head, foot, children, ...rest }: Props = $props();
</script>

<div {...rest} class={['overflow-x-auto', className]}>
	<table
		id={tableId}
		class="min-w-full text-base [&_tbody_tr]:border-t [&_tbody_tr]:border-divider [&_tbody_tr]:transition-colors [&_tbody_tr]:motion-reduce:transition-none [&_tbody_tr:hover]:bg-surface-hover [&_tbody_tr:nth-child(even)]:bg-surface-muted [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_th]:px-4 [&_th]:py-3 [&_th]:text-sm [&_th]:font-bold [&_th]:whitespace-nowrap [:where(&_th)]:text-left">
		{#if caption}<caption class="sr-only">{caption}</caption>{/if}
		<thead>{@render head()}</thead>
		<tbody>{@render children()}</tbody>
		{#if foot}<tfoot>{@render foot()}</tfoot>{/if}
	</table>
</div>
