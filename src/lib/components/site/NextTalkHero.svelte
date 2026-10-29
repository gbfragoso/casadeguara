<script lang="ts">
	import { INSTITUTION_INSTAGRAM_URL } from '#lib/brand/institution.js';
	import acolhida640 from '#lib/site/images/acolhida-640.webp';
	import acolhida960 from '#lib/site/images/acolhida-960.webp';
	import acolhida960Jpeg from '#lib/site/images/acolhida-960.jpg';
	import acolhida1280 from '#lib/site/images/acolhida-1280.webp';
	import acolhida1365 from '#lib/site/images/acolhida-1365.webp';
	import type { PublicTalkCard } from '#lib/talks/types.js';

	import NextTalkDetails from './NextTalkDetails.svelte';
	import SectionWave from './SectionWave.svelte';

	type Props = { talk: PublicTalkCard | null; today: string };

	let { talk, today }: Props = $props();

	const heroSources = `${acolhida640} 640w, ${acolhida960} 960w, ${acolhida1280} 1280w, ${acolhida1365} 1365w`;
</script>

<section id="inicio" aria-labelledby="titulo-inicio" class="relative overflow-hidden bg-sky desktop:min-h-208">
	<div
		class="relative aspect-4/3 tablet:aspect-video desktop:absolute desktop:inset-y-0 desktop:right-0 desktop:aspect-auto desktop:w-[62%]">
		<picture>
			<source type="image/webp" srcset={heroSources} sizes="(min-width: 64rem) 62vw, 100vw" />
			<img
				src={acolhida960Jpeg}
				width="1365"
				height="768"
				fetchpriority="high"
				alt="Jesus e Batuíra, mentor da Casa, de braços abertos diante da fachada azul do Grupo Espírita Casa de Guará."
				class="size-full animate-hero-settle object-cover object-[30%_30%] motion-reduce:animate-none" />
		</picture>
		<div
			aria-hidden="true"
			class="absolute inset-0 bg-linear-to-t from-sky to-transparent to-35% desktop:bg-linear-to-r desktop:from-sky desktop:via-sky/80 desktop:via-10% desktop:to-transparent desktop:to-35%">
		</div>
	</div>
	<div class="relative mx-auto max-w-7xl px-4 pb-24 tablet:px-8 tablet:pb-32 desktop:pt-38 desktop:pb-40">
		<div class="max-w-2xl animate-hero-rise motion-reduce:animate-none desktop:max-w-[44%]">
			{#if talk}
				<NextTalkDetails {talk} {today} />
			{:else}
				<h1 id="titulo-inicio" class="font-display text-display font-extrabold text-balance text-ink-strong">
					A programação será divulgada em breve.
				</h1>
				<p class="mt-4 text-lg text-ink-muted">
					Acompanhe as próximas palestras pelo
					<a href={INSTITUTION_INSTAGRAM_URL} rel="external" class="font-bold text-primary-ink underline"
						>Instagram</a
					>.
				</p>
			{/if}
		</div>
	</div>
	<SectionWave shape="hero" fill="fill-ground" edge="bottom" />
</section>
