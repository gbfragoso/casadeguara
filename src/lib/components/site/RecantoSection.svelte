<script lang="ts">
	import recantoLogo560 from '#lib/site/images/recanto-logo-560.webp';
	import recantoLogo1120 from '#lib/site/images/recanto-logo-1120.webp';
	import recantoLogoPng from '#lib/site/images/recanto-logo-1120.png';
	import { RECANTO_HIGHLIGHTS, RECANTO_LOGO_ALT } from '#lib/site/recanto.js';

	import RecantoBackdrop from './RecantoBackdrop.svelte';
	import SectionWave from './SectionWave.svelte';
</script>

<section
	id="recanto"
	aria-labelledby="titulo-recanto"
	class="relative isolate bg-warm-band pt-12 pb-28 tablet:pt-16 tablet:pb-36">
	<RecantoBackdrop />
	<div class="relative mx-auto max-w-7xl px-4 tablet:px-8">
		<h2 id="titulo-recanto">
			<picture>
				<source type="image/webp" srcset={`${recantoLogo560} 560w, ${recantoLogo1120} 1120w`} sizes="48rem" />
				<img
					src={recantoLogoPng}
					width="1120"
					height="274"
					loading="lazy"
					alt={RECANTO_LOGO_ALT}
					class="mx-auto w-full max-w-3xl dark:brightness-0 dark:invert" />
			</picture>
		</h2>
		<ul class="mt-12 grid gap-5 tablet:grid-cols-2 desktop:grid-cols-4">
			{#each RECANTO_HIGHLIGHTS as highlight (highlight.titulo)}
				<li class="rounded-3xl bg-surface/90 p-7 text-ink">
					<i class={['fa-solid text-3xl text-primary-ink', highlight.icone]} aria-hidden="true"></i>
					<h3 class="mt-4 font-display text-2xl font-bold text-ink-strong">{highlight.titulo}</h3>
					<p class="mt-3 text-lg">{highlight.descricao}</p>
				</li>
			{/each}
		</ul>
	</div>
	<SectionWave shape="trough" fill="fill-ground" edge="bottom" />
</section>
