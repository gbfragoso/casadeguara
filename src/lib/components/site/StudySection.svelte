<script lang="ts">
	import type { StudySection } from '#lib/site/study-materials/types.js';

	import StudyResourceList from './StudyResourceList.svelte';
	import Self from './StudySection.svelte';

	type Props = { section: StudySection; level?: 2 | 3 };

	let { section, level = 2 }: Props = $props();
	let cover = $derived(section.capa);
	let isBookCover = $derived(cover !== null && cover.largura <= cover.altura);
	const headingId = $props.id();
</script>

<section aria-labelledby={section.titulo ? headingId : undefined}>
	{#if section.titulo}
		<svelte:element
			this={`h${level}`}
			id={headingId}
			class={[
				'font-display font-extrabold text-balance text-ink-strong',
				level === 2 ? 'text-3xl tablet:text-4xl' : 'text-2xl',
			]}>
			{section.titulo}
		</svelte:element>
	{/if}

	<div class={['text-lg', isBookCover && 'tablet:grid tablet:grid-cols-[minmax(0,65ch)_auto] tablet:gap-12']}>
		{#if cover}
			<div class={['mt-6 tablet:row-start-1', isBookCover ? 'w-fit tablet:col-start-2' : 'w-full max-w-3xl']}>
				<div class="rounded-3xl bg-white p-3">
					<img
						src={cover.src}
						srcset={cover.srcset}
						sizes={isBookCover ? '18rem' : '(min-width: 48rem) 46rem, calc(100vw - 4rem)'}
						width={cover.largura}
						height={cover.altura}
						loading="lazy"
						decoding="async"
						alt={cover.alt}
						class={['h-auto', isBookCover ? 'max-h-72 w-auto' : 'w-full']} />
				</div>
			</div>
		{/if}
		{#if section.paragrafos.length > 0}
			<div class="max-w-prose tablet:col-start-1 tablet:row-start-1">
				{#each section.paragrafos as paragraph (paragraph)}
					<p class="mt-5 first:mt-6">{paragraph}</p>
				{/each}
			</div>
		{/if}
	</div>

	{#if section.recursos.length > 0}
		<div class="mt-8 max-w-3xl">
			<StudyResourceList resources={section.recursos} numbered={section.numerada} />
		</div>
	{/if}

	{#each section.subsecoes as subsection (subsection)}
		<div class="mt-12">
			<Self section={subsection} level={3} />
		</div>
	{/each}
</section>
