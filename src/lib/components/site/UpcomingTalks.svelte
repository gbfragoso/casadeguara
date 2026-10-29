<script lang="ts">
	import { formatTalkDateBadge } from '#lib/talks/public/format.js';
	import { formatTalkTime } from '#lib/talks/schedule.js';
	import type { PublicTalkCard } from '#lib/talks/types.js';

	type Props = { talks: readonly PublicTalkCard[] };

	const CARD_TONES = [
		'bg-primary text-on-primary',
		'bg-tint-sky text-ink-strong',
		'bg-tint-gold text-ink-strong',
	] as const;

	let { talks }: Props = $props();
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
			<p class="mt-10 rounded-3xl bg-tint-sky p-8 text-lg text-ink-strong">
				As próximas datas serão divulgadas em breve.
			</p>
		{:else}
			<ul class="mt-12 grid gap-6 tablet:grid-cols-3">
				{#each talks as talk, index (talk.id)}
					{@const badge = formatTalkDateBadge(talk.data)}
					<li class={['rounded-3xl p-7', CARD_TONES[index % CARD_TONES.length]]}>
						<p class="flex items-baseline gap-3">
							<span class="font-display text-numeral font-extrabold">{badge.dia}</span>
							<span class="leading-tight font-bold">
								{badge.diaSemana} · {badge.mes}<br />{formatTalkTime(talk.horario)}
							</span>
						</p>
						<h3 class="mt-6 font-display text-2xl font-bold text-balance text-inherit">{talk.titulo}</h3>
						{#if talk.palestrante}<p class="mt-2">Com {talk.palestrante.nome}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
