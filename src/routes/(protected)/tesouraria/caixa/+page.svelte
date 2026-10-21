<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { moeda } from '#lib/utils/currency.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';

	interface Props {
		data: PageServerData;
	}

	const DEPOSIT_FORM_ID = 'confirmar-deposito';

	let { data }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { entradas } = $derived(data);
	let total = $derived(entradas.reduce((sum, entrada) => sum + Number(entrada.valor), 0));
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Caixa', href: resolve('tesouraria/caixa') },
	];

	dayjs.extend(utc);
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-cash-register">Caixa</PageHeader>

<Card class="overflow-hidden" padded={false}>
	<DataTable>
		{#snippet head()}
			<tr>
				<th class="print:hidden"></th>
				<th>N° Recibo</th>
				<th>Contribuinte</th>
				<th>Valor</th>
				<th>Descrição</th>
				<th>Data</th>
			</tr>
		{/snippet}
		{#each entradas as resultado (resultado.identrada)}
			<tr>
				<td class="print:hidden">
					<input
						form={DEPOSIT_FORM_ID}
						name="entradas"
						value={resultado.identrada}
						type="checkbox"
						class="size-5"
						checked />
				</td>
				<td>{resultado.identrada}</td>
				<td>{resultado.contribuinte}</td>
				<td>{moeda(Number(resultado.valor))}</td>
				<td>{resultado.descricao.toUpperCase()}</td>
				<td>{dayjs.utc(resultado.dataEntrada).format('DD/MM/YYYY')}</td>
			</tr>
		{/each}
		{#snippet foot()}
			<tr class="border-t border-divider bg-warning-soft font-bold">
				<th class="print:hidden"></th>
				<th>Total</th>
				<th></th>
				<th>{moeda(total)}</th>
				<th></th>
				<th></th>
			</tr>
		{/snippet}
	</DataTable>
</Card>

<form id={DEPOSIT_FORM_ID} class="mt-6" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Button type="submit" tone="success" loading={formEnhancer.loading} class="font-bold tablet:min-w-50">
		<i class="fa-solid fa-check fa-fw" aria-hidden="true"></i>Confirmar depósito
	</Button>
</form>
