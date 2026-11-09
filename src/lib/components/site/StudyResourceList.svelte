<script lang="ts">
	import { resolve } from '$app/paths';

	import type { StudyResource } from '#lib/site/study-materials/types.js';

	type Props = { resources: readonly StudyResource[]; numbered: boolean };

	let { resources, numbered }: Props = $props();

	const POSITION_DIGITS = 2;
	const formatPosition = (index: number) => String(index + 1).padStart(POSITION_DIGITS, '0');
	const linkClass =
		'group flex min-h-14 items-baseline gap-4 rounded-2xl px-4 py-3 text-ink-strong hover:bg-card tablet:px-5';
</script>

{#snippet details(resource: StudyResource, index: number)}
	{#if numbered}
		<span aria-hidden="true" class="font-display font-extrabold text-primary-ink tabular-nums">
			{formatPosition(index)}
		</span>
	{/if}
	<span class="flex flex-1 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
		<span class="font-bold underline-offset-4 group-hover:underline">{resource.rotulo}</span>
		<span class="text-sm text-ink-muted">
			{#if resource.kind === 'download'}
				PDF · {resource.tamanho}
			{:else if resource.kind === 'link'}
				{resource.origem}
			{:else}
				Disponível em nossa Biblioteca
			{/if}
		</span>
	</span>
{/snippet}

<svelte:element this={numbered ? 'ol' : 'ul'} class="grid gap-1 rounded-3xl bg-tint-sky p-2 tablet:p-3">
	{#each resources as resource, index (resource)}
		<li>
			{#if resource.kind === 'download'}
				<a href={resource.href} download rel="external" class={linkClass}>{@render details(resource, index)}</a>
			{:else if resource.kind === 'link'}
				<a href={resource.href} rel="external" class={linkClass}>{@render details(resource, index)}</a>
			{:else}
				<a href={resolve('/acervo')} class={linkClass}>{@render details(resource, index)}</a>
			{/if}
		</li>
	{/each}
</svelte:element>
