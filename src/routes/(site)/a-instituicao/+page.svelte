<script lang="ts">
	import BoardMembers from '#lib/components/site/BoardMembers.svelte';
	import PhotoGallery from '#lib/components/site/PhotoGallery.svelte';
	import SitePageIntro from '#lib/components/site/SitePageIntro.svelte';
	import { HEADQUARTERS_FACADE, HEADQUARTERS_GALLERY, INSTITUTION_HISTORY } from '#lib/site/institution-history.js';

	const { origem, primeiraDiretoria, desfecho } = INSTITUTION_HISTORY;
</script>

<SitePageIntro title="A instituição" />

<div class="mx-auto max-w-7xl px-4 pt-12 tablet:px-8 tablet:pt-16">
	<div class="grid gap-12 desktop:grid-cols-[minmax(0,1fr)_28rem] desktop:gap-16">
		<article aria-labelledby="titulo-historia" class="max-w-prose text-lg">
			<h2 id="titulo-historia" class="font-display text-display font-extrabold text-balance text-ink-strong">
				Nossa história
			</h2>
			{#each origem as paragraph (paragraph)}
				<p class="mt-5 first-of-type:mt-8">{paragraph}</p>
			{/each}
			<section aria-labelledby="titulo-primeira-diretoria" class="mt-10 rounded-3xl bg-tint-sky p-7 tablet:p-8">
				<h3 id="titulo-primeira-diretoria" class="font-display text-2xl font-bold text-ink-strong">
					Primeira diretoria
				</h3>
				<p class="mt-3">{primeiraDiretoria.introducao}</p>
				<div class="mt-6">
					<BoardMembers members={primeiraDiretoria.membros} columns />
				</div>
			</section>
			<p class="mt-10">{desfecho}</p>
		</article>
		<figure class="relative self-start desktop:sticky desktop:top-8">
			<img
				src={HEADQUARTERS_FACADE.src}
				srcset={HEADQUARTERS_FACADE.srcset}
				sizes="(min-width: 64rem) 28rem, calc(100vw - 4rem)"
				width="1280"
				height="721"
				alt={HEADQUARTERS_FACADE.alt}
				class="aspect-4/3 w-full rounded-3xl bg-sky object-cover" />
			<figcaption
				class="absolute bottom-4 left-4 rounded-full bg-card px-4 py-2 text-sm font-bold text-ink-strong">
				Fachada da sede
			</figcaption>
		</figure>
	</div>
</div>

<div class="pb-24 tablet:pb-32">
	<PhotoGallery gallery={HEADQUARTERS_GALLERY} />
</div>
