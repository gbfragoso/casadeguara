<script lang="ts">
	import { resolve } from '$app/paths';
	import MonthlyLancamentos from '#lib/components/charts/MonthlyLancamentos.svelte';
	import Indicator from '#lib/components/data/Indicator.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { moeda } from '#lib/utils/currency.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';

	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();

	let { entradaMesAtual, saidaMesAtual, lancamentosMensais } = $derived(data);
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Página Inicial', href: resolve('tesouraria') },
	];
	dayjs.extend(utc);

	const calculateBalance = (received: string | number, expenses: string | number) =>
		Number(received) - Number(expenses);
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-house">
	Balanço do mês {dayjs.utc(new Date()).format('MM/YYYY')}
</PageHeader>

<div data-testid="indicadores" class="mb-8 grid gap-4 tablet:grid-cols-3 desktop:grid-cols-5">
	{#await entradaMesAtual}
		<Indicator label="Doações" icon="fa-solid fa-calculator" loading />
		<Indicator label="Valor médio" icon="fa-solid fa-wave-square" loading />
		<Indicator label="Valor recebido" icon="fa-solid fa-hand-holding-dollar" highlight loading />
		<Indicator label="Despesas" icon="fa-solid fa-money-bill-transfer" loading />
		<Indicator label="Saldo" icon="fa-solid fa-sack-dollar" loading />
	{:then entrada}
		{#await saidaMesAtual then saida}
			{@const balance = calculateBalance(entrada[0].value, saida[0].value)}
			<Indicator label="Total de doações" icon="fa-solid fa-calculator">
				{#snippet value()}{entrada[0].count}{/snippet}
			</Indicator>
			<Indicator label="Valor médio" icon="fa-solid fa-wave-square">
				{#snippet value()}{moeda(Number(entrada[0].median))}{/snippet}
			</Indicator>
			<Indicator label="Valor recebido" icon="fa-solid fa-hand-holding-dollar" highlight>
				{#snippet value()}{moeda(Number(entrada[0].value))}{/snippet}
			</Indicator>
			<Indicator label="Despesas" icon="fa-solid fa-money-bill-transfer" valueTone="danger">
				{#snippet value()}{moeda(Number(saida[0].value))}{/snippet}
			</Indicator>
			<Indicator label="Saldo" icon="fa-solid fa-sack-dollar" valueTone={balance >= 1 ? 'success' : 'danger'}>
				{#snippet value()}{moeda(balance)}{/snippet}
			</Indicator>
		{/await}
	{/await}
</div>

<MonthlyLancamentos totals={lancamentosMensais} />
