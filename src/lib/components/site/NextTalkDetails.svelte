<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatRelativeTalkDay, readDistinctTalkLocation, splitLastWord } from '#lib/talks/public/format.js';
	import { formatTalkTime } from '#lib/talks/schedule.js';
	import type { PublicTalkCard } from '#lib/talks/types.js';

	type Props = { talk: PublicTalkCard; today: string };

	let { talk, today }: Props = $props();
	let speaker = $derived(talk.palestrante);
	let location = $derived(readDistinctTalkLocation(talk.local));
	let title = $derived(splitLastWord(talk.titulo ?? ''));
</script>

<p class="flex flex-wrap items-center gap-3 font-display text-hero-time font-extrabold text-primary-ink">
	<span class="rounded-xl bg-accent px-4 text-on-accent">{formatRelativeTalkDay(talk.data, today)}</span>
	às {formatTalkTime(talk.horario)}
</p>
<h1 id="titulo-inicio" class="mt-4 font-display text-hero font-extrabold tracking-tight text-balance text-ink-strong">
	{title.lead}<span class="underline decoration-accent decoration-8 underline-offset-12">{title.lastWord}</span>
</h1>
{#if speaker}
	<div class="mt-6 flex items-center gap-4">
		{#if speaker.temFoto}
			<img
				src={resolve('/palestras/[id=integer]/foto', { id: String(talk.id) })}
				alt=""
				width="68"
				height="68"
				class="size-16 shrink-0 rounded-full border-4 border-surface object-cover" />
		{/if}
		<p>
			<span class="block text-xl font-bold text-ink-strong">{speaker.nome}</span>
			{#if talk.observacoes}<span class="block text-ink-muted">{talk.observacoes}</span>{/if}
		</p>
	</div>
{/if}
{#if location}
	<p class="mt-4 text-ink-muted"><span class="font-bold text-ink-strong">Local:</span> {location}</p>
{/if}
{#if talk.reuniaoCom.length > 0}
	<p class="mt-3 max-w-prose text-ink-muted">
		<span class="font-bold text-ink-strong">A reunião inclui:</span>
		{talk.reuniaoCom.join(', ')}.
	</p>
{/if}
<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
	<a
		href="#como-chegar"
		class="inline-flex h-14 items-center rounded-full bg-primary px-7 text-lg font-bold text-on-primary hover:bg-primary-700">
		Como chegar
	</a>
	<a
		href="#palestras"
		class="inline-flex items-center gap-2 text-lg font-bold text-primary-ink underline-offset-4 hover:underline">
		Ver as próximas palestras
		<svg aria-hidden="true" viewBox="0 0 46 22" class="h-5 w-10 fill-none stroke-current" stroke-width="2.4">
			<path d="M2 14c10-8 22-10 38-4" stroke-linecap="round" />
			<path d="M33 4l8 6-9 4" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</a>
</div>
