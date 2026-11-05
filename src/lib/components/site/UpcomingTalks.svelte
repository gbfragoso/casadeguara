<script lang="ts">
	import {
		formatTalkDateBadge,
		readDistinctTalkLocation,
		readNearTalkDay,
		readTalkHeading,
	} from '#lib/talks/public/format.js';
	import { formatTalkTime } from '#lib/talks/schedule.js';
	import type { PublicTalkCard } from '#lib/talks/types.js';

	import SpeakerPhoto from './SpeakerPhoto.svelte';

	type Props = { talks: readonly PublicTalkCard[]; today: string; heroAnnouncesEmpty: boolean };

	const CARD_TONES = [
		'bg-primary text-on-primary',
		'bg-tint-sky text-ink-strong',
		'bg-tint-gold text-ink-strong',
	] as const;

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
					{@const badge = formatTalkDateBadge(talk.data)}
					{@const nearDay = readNearTalkDay(talk.data, today)}
					{@const time = formatTalkTime(talk.horario)}
					{@const location = readDistinctTalkLocation(talk.local)}
					<li class={['flex flex-col rounded-3xl p-7', CARD_TONES[index % CARD_TONES.length]]}>
						<p class="flex items-center gap-3">
							<span class="font-display text-numeral font-extrabold">{badge.dia}</span>
							<span class="leading-tight font-bold">
								{badge.diaSemana} · {badge.mes}<br />{nearDay ? `${nearDay} às ${time}` : time}
							</span>
						</p>
						<h3 class="mt-6 font-display text-2xl font-bold text-balance text-inherit">
							{readTalkHeading(talk.titulo)}
						</h3>
						{#if talk.observacoes}<p class="mt-2 font-medium">{talk.observacoes}</p>{/if}
						{#if location}
							<p class="mt-2 font-medium"><span class="font-bold">Local:</span> {location}</p>
						{/if}
						<div class="mt-auto flex min-h-18 items-center gap-3 pt-6 font-bold">
							{#if talk.palestrante}
								{#if talk.palestrante.temFoto}<SpeakerPhoto talkId={talk.id} variant="card" />{/if}
								<p>{talk.palestrante.nome}</p>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
