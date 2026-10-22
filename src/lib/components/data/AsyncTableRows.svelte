<script lang="ts" generics="Row">
	import type { Snippet } from 'svelte';
	import LoadError from '#lib/components/feedback/LoadError.svelte';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';

	type Props = {
		rows: Promise<readonly Row[]> | readonly Row[];
		columns: number;
		emptyMessage: string;
		errorMessage: string;
		row: Snippet<[Row]>;
	};

	let { rows, columns, emptyMessage, errorMessage, row }: Props = $props();
</script>

{#await rows}
	<tr>
		{#each { length: columns }, index}
			<td>
				{#if index === 0}<span class="sr-only">Carregando…</span>{/if}
				<SkeletonLines />
			</td>
		{/each}
	</tr>
{:then items}
	{#each items as item (item)}
		{@render row(item)}
	{:else}
		<tr>
			<td colspan={columns} class="text-ink-muted">{emptyMessage}</td>
		</tr>
	{/each}
{:catch}
	<tr>
		<td colspan={columns}><LoadError message={errorMessage} /></td>
	</tr>
{/await}
