<script lang="ts">
	import encontro from '#lib/site/images/recanto-encontro.webp';
	import familias from '#lib/site/images/recanto-familias.webp';
	import gestantes from '#lib/site/images/recanto-gestantes.webp';
	import sede from '#lib/site/images/recanto-sede.webp';

	const SLIDE_SECONDS = 6;
	const FIRST_SLIDE_HEAD_START_SECONDS = 2;
	const slides = [gestantes, sede, encontro, familias];
</script>

<div aria-hidden="true" class="absolute inset-0 overflow-hidden">
	{#each slides as slide, index (slide)}
		<img
			src={slide}
			alt=""
			width="1000"
			height="500"
			loading="lazy"
			decoding="async"
			style:animation-delay={`${index * SLIDE_SECONDS - FIRST_SLIDE_HEAD_START_SECONDS}s`}
			class={[
				'absolute inset-0 size-full animate-recanto-fade object-cover motion-reduce:animate-none',
				index === 0 ? 'motion-reduce:opacity-100' : 'motion-reduce:opacity-0',
			]} />
	{/each}
	<div class="absolute inset-0 bg-linear-to-b from-warm-band via-warm-band/65 via-15% to-warm-band/65"></div>
</div>
