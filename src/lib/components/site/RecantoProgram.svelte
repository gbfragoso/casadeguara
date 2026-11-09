<script lang="ts">
	import RecantoHelp from './RecantoHelp.svelte';
	import RecantoStages from './RecantoStages.svelte';
	import SectionWave from './SectionWave.svelte';
</script>

<section
	aria-labelledby="titulo-acompanhamento"
	class="relative mt-24 bg-warm-band pt-24 pb-28 tablet:mt-32 tablet:pt-36 tablet:pb-36">
	<SectionWave shape="crest" fill="fill-ground" edge="top" />
	<div class="mx-auto max-w-7xl px-4 tablet:px-8">
		<h2 id="titulo-acompanhamento" class="font-display text-display font-extrabold text-balance text-ink-strong">
			Como acompanhamos as gestantes
		</h2>
		<div class="mt-12 rounded-3xl bg-card p-5 text-ink tablet:p-10">
			<RecantoStages />
			<RecantoHelp />
		</div>
	</div>
	<SectionWave shape="trough" fill="fill-ground" edge="bottom" />
</section>
