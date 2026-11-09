<script lang="ts">
	import { resolve } from '$app/paths';
	import recantoLogo560 from '#lib/site/images/recanto-logo-560.webp';
	import recantoLogo1120 from '#lib/site/images/recanto-logo-1120.webp';
	import recantoLogoPng from '#lib/site/images/recanto-logo-1120.png';
	import { RECANTO_LOGO_ALT } from '#lib/site/recanto.js';

	import RecantoBackdrop from './RecantoBackdrop.svelte';
	import RecantoHelp from './RecantoHelp.svelte';
	import RecantoStages from './RecantoStages.svelte';
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
			<RecantoStages />
			<RecantoHelp />
			<a
				href={resolve('/(site)/departamentos/[departamento=departamento]', { departamento: 'recanto' })}
				class="mt-8 inline-block text-lg font-bold text-primary-ink underline underline-offset-4">
				Saiba mais <span class="sr-only">sobre o Recanto de Potira</span>
			</a>
		</div>
	</div>
	<SectionWave shape="trough" fill="fill-ground" edge="bottom" />
</section>
