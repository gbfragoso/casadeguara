<script lang="ts">
	import { INSTITUTION_NAME } from '#lib/brand/institution.js';

	import SectionWave from './SectionWave.svelte';

	type Props = { title: string; lead?: string };

	let { title, lead }: Props = $props();
</script>

<svelte:head>
	<title>{title} · {INSTITUTION_NAME}</title>
</svelte:head>

<section aria-labelledby="titulo-pagina" class="relative bg-sky pt-32 pb-24 tablet:pt-40 tablet:pb-32 desktop:pt-44">
	<div class="mx-auto max-w-7xl px-4 tablet:px-8">
		<h1 id="titulo-pagina" class="font-display text-display font-extrabold text-balance text-ink-strong">
			{title}
		</h1>
		{#if lead}
			<p class="mt-4 max-w-2xl text-lg text-ink-muted">{lead}</p>
		{/if}
	</div>
	<SectionWave shape="hero" fill="fill-ground" edge="bottom" />
</section>
