<script lang="ts">
	import { INSTITUTION_INSTAGRAM_URL } from '#lib/brand/institution.js';
	import MonthTalkList from '#lib/components/site/MonthTalkList.svelte';
	import SitePageIntro from '#lib/components/site/SitePageIntro.svelte';

	import type { PageServerData } from './$types';

	type Props = { data: PageServerData };

	let { data }: Props = $props();
</script>

<SitePageIntro
	title={`Palestras de ${data.mes}`}
	lead="Palestras públicas e gratuitas. Chegue alguns minutos antes; todos são bem-vindos." />

{#snippet instagramNotice(heading: string, lead: string)}
	<div class="rounded-3xl bg-tint-sky p-8 text-lg text-ink-strong">
		<p class="font-display text-2xl font-bold text-balance">{heading}</p>
		<p class="mt-2">
			{lead}
			<a href={INSTITUTION_INSTAGRAM_URL} rel="external" class="font-bold text-primary-ink underline">Instagram</a
			>.
		</p>
	</div>
{/snippet}

<div class="mx-auto max-w-7xl px-4 pt-12 pb-24 tablet:px-8 tablet:pt-16 tablet:pb-32">
	{#if data.programacaoIndisponivel}
		{@render instagramNotice('Não conseguimos carregar a programação agora.', 'Veja no')}
	{:else if data.palestras.length === 0}
		{@render instagramNotice(
			`A programação de ${data.mes} será divulgada em breve.`,
			'Acompanhe as próximas palestras pelo',
		)}
	{:else}
		<MonthTalkList talks={data.palestras} today={data.hoje} />
	{/if}
</div>
