<script module lang="ts">
	const CARD_TONES = [
		'bg-primary text-on-primary',
		'bg-tint-sky text-ink-strong',
		'bg-tint-gold text-ink-strong',
	] as const;
</script>

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

	type Props = { talk: PublicTalkCard; today: string; position: number };

	let { talk, today, position }: Props = $props();
	let badge = $derived(formatTalkDateBadge(talk.data));
	let nearDay = $derived(readNearTalkDay(talk.data, today));
	let time = $derived(formatTalkTime(talk.horario));
	let location = $derived(readDistinctTalkLocation(talk.local));
</script>

<li class={['flex flex-col rounded-3xl p-7', CARD_TONES[position % CARD_TONES.length]]}>
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
