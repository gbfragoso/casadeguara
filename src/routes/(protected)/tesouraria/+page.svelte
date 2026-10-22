<script lang="ts">
	import { resolve } from '$app/paths';
	import MonthlyLancamentos from '#lib/components/charts/MonthlyLancamentos.svelte';
	import Indicator from '#lib/components/data/Indicator.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { moeda } from '#lib/utils/currency.js';
	import { formatMonthYear } from '#lib/utils/date.js';

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

	const calculateBalance = (received: string | number, expenses: string | number) =>
		Number(received) - Number(expenses);

	const balanceTone = (balance: number) => {
		if (balance < 0) return 'danger';
		return balance > 0 ? 'success' : 'default';
	};
</script>

<PageHeader {breadcrumb}>Balanço de {formatMonthYear(new Date())}</PageHeader>

<div data-testid="indicadores" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,11.5rem),1fr))] gap-4">
	{#await entradaMesAtual}
		<Indicator label="Valor recebido" highlight loading />
		<Indicator label="Despesas" loading />
		<Indicator label="Saldo" loading />
		<Indicator label="Total de doações" loading />
		<Indicator label="Valor médio" loading />
	{:then entrada}
		{#await saidaMesAtual then saida}
			{@const balance = calculateBalance(entrada[0].value, saida[0].value)}
			<Indicator label="Valor recebido" highlight>
				{#snippet value()}{moeda(Number(entrada[0].value))}{/snippet}
			</Indicator>
			<Indicator label="Despesas" valueTone="danger">
				{#snippet value()}{moeda(Number(saida[0].value))}{/snippet}
			</Indicator>
			<Indicator label="Saldo" valueTone={balanceTone(balance)}>
				{#snippet value()}{moeda(balance)}{/snippet}
			</Indicator>
			<Indicator label="Total de doações">
				{#snippet value()}{entrada[0].count}{/snippet}
			</Indicator>
			<Indicator label="Valor médio">
				{#snippet value()}{moeda(Number(entrada[0].median))}{/snippet}
			</Indicator>
		{/await}
	{/await}
</div>

<MonthlyLancamentos totals={lancamentosMensais} />
