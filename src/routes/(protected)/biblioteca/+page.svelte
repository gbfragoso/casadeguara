<script lang="ts">
	import { resolve } from '$app/paths';
	import Indicator from '#lib/components/data/Indicator.svelte';
	import Box from '#lib/components/layout/Box.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { formatMonthYear } from '#lib/utils/date.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { avisos, emprestimos, devolucoes } = $derived(data);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Página Inicial', href: resolve('biblioteca') },
	];
	dayjs.extend(utc);
</script>

<PageHeader {breadcrumb}>Balanço de {formatMonthYear(new Date())}</PageHeader>

<div data-testid="indicadores" class="grid gap-4 tablet:grid-cols-3">
	<Indicator label="Empréstimos" highlight>
		{#snippet value()}{emprestimos[0].counter}{/snippet}
	</Indicator>
	<Indicator label="Devoluções">
		{#snippet value()}{devolucoes[0].counter}{/snippet}
	</Indicator>
	<Indicator label="Renovações">
		{#snippet value()}{emprestimos[0].renovacoes || 0}{/snippet}
	</Indicator>
</div>

<section class="mt-10 flex flex-col gap-4">
	<SectionHeading element="p">Mural de avisos</SectionHeading>
	{#if avisos.length === 0}
		<p class="text-ink-muted">Nenhum aviso no mural.</p>
	{:else}
		<Box class="tablet:p-6">
			{#each avisos as aviso (aviso.idaviso)}
				<article class="flex flex-col gap-1 border-t border-divider py-4 first:border-t-0 first:pt-0 last:pb-0">
					<p>
						<strong class="font-medium text-primary-ink">{aviso.username}</strong>
						<small class="text-sm text-ink-muted"
							>{dayjs.utc(aviso.dataCadastro).format('DD/MM/YYYY')}</small>
					</p>
					<p>{aviso.texto}</p>
				</article>
			{/each}
		</Box>
	{/if}
</section>
