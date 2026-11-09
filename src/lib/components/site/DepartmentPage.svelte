<script lang="ts">
	import type { DepartmentPageContent } from '#lib/site/department-pages/types.js';

	import DepartmentFacts from './DepartmentFacts.svelte';
	import PhotoGallery from './PhotoGallery.svelte';
	import RecantoProgram from './RecantoProgram.svelte';
	import SitePageCover from './SitePageCover.svelte';
	import SitePageIntro from './SitePageIntro.svelte';

	type Props = { content: DepartmentPageContent; lead: string | null; showsRecantoProgram: boolean };

	let { content, lead, showsRecantoProgram }: Props = $props();
	let hasText = $derived(content.paragrafos.length > 0 || content.topicos.length > 0);
</script>

<SitePageIntro title={content.titulo} lead={lead ?? undefined} />

<div class="relative mx-auto -mt-12 max-w-7xl px-4 tablet:-mt-20 tablet:px-8">
	<SitePageCover photo={content.capa} />

	<div
		class={['mt-12 grid gap-12 tablet:mt-16', hasText && 'desktop:grid-cols-[minmax(0,1fr)_24rem] desktop:gap-16']}>
		{#if hasText}
			<div class="max-w-prose text-lg">
				{#each content.paragrafos as paragraph (paragraph)}
					<p class="mt-5 first:mt-0">{paragraph}</p>
				{/each}
				{#each content.topicos as topic (topic.titulo)}
					<h2 class="mt-12 font-display text-3xl font-extrabold text-ink-strong">{topic.titulo}</h2>
					<ul class="mt-4 grid list-disc gap-2 ps-5 marker:text-primary-ink">
						{#each topic.itens as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				{/each}
			</div>
		{/if}
		<DepartmentFacts {content} wide={!hasText} />
	</div>
</div>

{#if showsRecantoProgram}
	<RecantoProgram />
{/if}

<div class="pb-24 tablet:pb-32">
	{#each content.galerias as gallery (gallery.titulo)}
		<PhotoGallery {gallery} />
	{/each}
	{#if content.citacao}
		<figure class="mx-auto max-w-3xl px-4 pt-20 text-center tablet:pt-28">
			<blockquote class="font-display text-3xl font-bold text-balance text-primary-ink tablet:text-4xl">
				<p>“{content.citacao.texto}”</p>
			</blockquote>
			<figcaption class="mt-4 text-ink-muted">{content.citacao.fonte}</figcaption>
		</figure>
	{/if}
</div>
