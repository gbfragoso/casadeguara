<script lang="ts">
	import recantoLogo560 from '#lib/site/images/recanto-logo-560.webp';
	import recantoLogo1120 from '#lib/site/images/recanto-logo-1120.webp';
	import recantoLogoPng from '#lib/site/images/recanto-logo-1120.png';
	import { INSTITUTION_ADDRESS, INSTITUTION_PIX_KEY } from '#lib/brand/institution.js';
	import { RECANTO_LOGO_ALT, RECANTO_STAGES } from '#lib/site/recanto.js';

	import DrawnIcon from './DrawnIcon.svelte';
	import RecantoBackdrop from './RecantoBackdrop.svelte';
	import SectionWave from './SectionWave.svelte';
</script>

<section
	id="recanto"
	aria-labelledby="titulo-recanto"
	class="relative isolate bg-warm-band pt-24 pb-28 tablet:pt-36 tablet:pb-36">
	<RecantoBackdrop />
	<SectionWave shape="crest" fill="fill-primary" edge="top" />
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
		<div class="mt-12 rounded-3xl bg-card p-5 text-ink tablet:p-10">
			<ol class="grid gap-8 desktop:grid-cols-4">
				{#each RECANTO_STAGES as stage (stage.titulo)}
					<li
						class="relative grid grid-cols-[4.5rem_1fr] gap-x-4 before:absolute before:top-22 before:-bottom-4 before:left-9 before:w-0.5 before:bg-sky-wave last:before:hidden desktop:block desktop:before:top-9 desktop:before:-right-4 desktop:before:bottom-auto desktop:before:left-22 desktop:before:h-0.5 desktop:before:w-auto">
						<DrawnIcon name={stage.icone} tone={stage.tom} />
						<div class="desktop:mt-6">
							<h3 class="font-display text-2xl font-bold text-ink-strong">{stage.titulo}</h3>
							<p class="mt-1 font-bold text-primary-ink">{stage.etapa}</p>
							<p class="mt-3 text-lg">{stage.descricao}</p>
						</div>
					</li>
				{/each}
			</ol>
			<div class="mt-10 border-t border-sky pt-8 desktop:flex desktop:items-baseline desktop:gap-8">
				<h3 class="shrink-0 font-display text-2xl font-bold text-ink-strong">Como ajudar</h3>
				<ul class="mt-3 grid list-disc gap-2 ps-5 text-lg marker:text-primary-ink desktop:mt-0">
					<li>Doações de roupas podem ser feitas em nossa sede, na {INSTITUTION_ADDRESS}.</li>
					<li>
						Doações em dinheiro podem ser feitas na nossa tesouraria ou através da chave PIX:
						<span class="font-bold text-ink-strong select-all">{INSTITUTION_PIX_KEY}</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<SectionWave shape="trough" fill="fill-ground" edge="bottom" />
</section>
