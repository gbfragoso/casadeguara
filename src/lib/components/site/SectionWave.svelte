<script lang="ts">
	type WaveShape = 'hero' | 'crest' | 'trough';

	type Props = { shape: WaveShape; fill: string; edge: 'top' | 'bottom' };

	const SHAPES: Record<WaveShape, string> = {
		hero: 'M0 110C260 80 520 92 780 112S1200 132 1440 96V150H0z',
		crest: 'M0 0H1440V40C1180 100 900 90 700 60S260 20 0 70z',
		trough: 'M0 100H1440V50C1200 10 980 30 760 60S300 90 0 40z',
	};

	let { shape, fill, edge }: Props = $props();
</script>

<svg
	aria-hidden="true"
	focusable="false"
	viewBox={shape === 'hero' ? '0 0 1440 150' : '0 0 1440 100'}
	preserveAspectRatio="none"
	class={[
		'pointer-events-none absolute inset-x-0 h-12 w-full tablet:h-20 desktop:h-24',
		edge === 'top' ? '-top-px' : '-bottom-px',
		fill,
	]}>
	{#if shape === 'hero'}
		<path class="fill-sky-wave" d="M0 70C220 20 460 30 700 70S1180 120 1440 50V150H0z" />
	{/if}
	<path d={SHAPES[shape]} />
</svg>
