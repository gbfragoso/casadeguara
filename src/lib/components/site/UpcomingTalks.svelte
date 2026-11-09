<script lang="ts">
	import type { PublicTalkCard as Talk } from '#lib/talks/types.js';

	import PublicTalkCard from './PublicTalkCard.svelte';

	type Props = { talks: readonly Talk[]; today: string; heroAnnouncesEmpty: boolean };

	const GRID_BY_TALK_COUNT = ['max-w-md', 'tablet:grid-cols-2', 'tablet:grid-cols-3'] as const;

	let { talks, today, heroAnnouncesEmpty }: Props = $props();
	let gridColumns = $derived(GRID_BY_TALK_COUNT[Math.min(talks.length, GRID_BY_TALK_COUNT.length) - 1]);
</script>

<section id="palestras" aria-labelledby="titulo-palestras" class="bg-ground py-16 tablet:py-24">
	<div class="mx-auto max-w-7xl px-4 tablet:px-8">
		<h2 id="titulo-palestras" class="font-display text-display font-extrabold text-ink-strong">
			As próximas palestras
		</h2>
		<p class="mt-4 max-w-xl text-lg text-ink-muted">
			Palestras públicas e gratuitas. Chegue alguns minutos antes; todos são bem-vindos.
		</p>
		{#if talks.length === 0}
			{#if !heroAnnouncesEmpty}
				<p class="mt-10 rounded-3xl bg-tint-sky p-8 text-lg text-ink-strong">
					As próximas datas serão divulgadas em breve.
				</p>
			{/if}
		{:else}
			<ul class={['mt-12 grid gap-6', gridColumns]}>
				{#each talks as talk, index (talk.id)}
					<PublicTalkCard {talk} {today} position={index} />
				{/each}
			</ul>
		{/if}
	</div>
</section>
