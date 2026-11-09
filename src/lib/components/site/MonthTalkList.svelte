<script lang="ts">
	import {
		formatTalkDateBadge,
		readDistinctTalkLocation,
		readNearTalkDay,
		readTalkHeading,
	} from '#lib/talks/public/format.js';
	import { formatTalkTime } from '#lib/talks/schedule.js';
	import type { MonthTalk } from '#lib/talks/types.js';

	import SpeakerPhoto from './SpeakerPhoto.svelte';

	type Props = { talks: readonly MonthTalk[]; today: string };

	let { talks, today }: Props = $props();

	const formatSchedule = (talk: MonthTalk) => {
		const time = formatTalkTime(talk.horario);
		const nearDay = talk.realizada ? null : readNearTalkDay(talk.data, today);
		return nearDay ? `${nearDay} às ${time}` : time;
	};
</script>

<ul aria-label="Palestras do mês" class="divide-y divide-divider border-y border-divider">
	{#each talks as talk (talk.id)}
		{@const badge = formatTalkDateBadge(talk.data)}
		{@const location = readDistinctTalkLocation(talk.local)}
		<li class="grid grid-cols-[3.5rem_1fr] gap-x-4 py-6 tablet:grid-cols-[4.5rem_1fr_auto] tablet:items-center">
			<p class={['text-center leading-tight', talk.realizada ? 'text-ink-muted' : 'text-primary-ink']}>
				<span class="block font-display text-4xl font-extrabold">{badge.dia}</span>
				<span class="block text-sm font-bold">{badge.diaSemana}</span>
			</p>
			<div>
				<p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-ink-muted">
					{#if talk.realizada}<span class="rounded-xl bg-sky px-3 py-1 text-primary-ink">Realizada</span>{/if}
					{formatSchedule(talk)}
				</p>
				<h2 class="mt-2 font-display text-xl font-bold text-balance text-ink-strong">
					{readTalkHeading(talk.titulo)}
				</h2>
				{#if talk.observacoes}<p class="mt-1 text-ink">{talk.observacoes}</p>{/if}
				{#if location}<p class="mt-1 text-ink"><span class="font-bold">Local:</span> {location}</p>{/if}
			</div>
			{#if talk.palestrante}
				<div
					class="col-start-2 mt-3 flex items-center gap-3 font-bold text-ink tablet:col-start-3 tablet:mt-0 tablet:justify-end">
					{#if talk.palestrante.temFoto}<SpeakerPhoto talkId={talk.id} variant="card" />{/if}
					<p>{talk.palestrante.nome}</p>
				</div>
			{/if}
		</li>
	{/each}
</ul>
