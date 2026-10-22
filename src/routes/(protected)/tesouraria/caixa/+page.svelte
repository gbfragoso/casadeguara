<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { moeda } from '#lib/utils/currency.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form?: ActionData;
	}

	const DEPOSIT_FORM_ID = 'confirmar-deposito';

	let { data, form }: Props = $props();
	let failureMessage = $derived(form?.message ?? form?.errors?.entradas?.join(' '));
	const formEnhancer = createFormEnhancer();
	let { entradas } = $derived(data);
	let total = $derived(entradas.reduce((sum, entrada) => sum + Number(entrada.valor), 0));
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Caixa', href: resolve('tesouraria/caixa') },
	];

	dayjs.extend(utc);
</script>

<PageHeader {breadcrumb}>Caixa</PageHeader>

{#if entradas.length === 0}
	<Card><p role="status">Nenhuma entrada aguardando depósito.</p></Card>
{:else}
	<Card class="overflow-hidden" padded={false}>
		<DataTable>
			{#snippet head()}
				<tr>
					<th class="print:hidden"><span class="sr-only">Incluir no depósito</span></th>
					<th>N° Recibo</th>
					<th>Contribuinte</th>
					<th class="text-right">Valor</th>
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
							aria-label={`Incluir recibo nº ${resultado.identrada} no depósito`}
							checked />
					</td>
					<td>{resultado.identrada}</td>
					<td>{resultado.contribuinte}</td>
					<td class="text-right whitespace-nowrap">{moeda(Number(resultado.valor))}</td>
					<td>{resultado.descricao.toUpperCase()}</td>
					<td>{dayjs.utc(resultado.dataEntrada).format('DD/MM/YYYY')}</td>
				</tr>
			{/each}
			{#snippet foot()}
				<tr class="border-t border-divider bg-warning-soft font-bold">
					<th class="print:hidden"></th>
					<th>Total</th>
					<th></th>
					<th class="text-right">{moeda(total)}</th>
					<th></th>
					<th></th>
				</tr>
			{/snippet}
		</DataTable>
	</Card>

	<form id={DEPOSIT_FORM_ID} class="mt-6" method="POST" {@attach formEnhancer.submitWithLoading}>
		<Button type="submit" tone="success" loading={formEnhancer.loading} bold class="tablet:min-w-50">
			<i class="fa-solid fa-check fa-fw" aria-hidden="true"></i>Confirmar depósito
		</Button>
	</form>
{/if}

{#if form?.status === 201}
	<Notification kind="success">{form.message}</Notification>
{:else if failureMessage}
	<Notification kind="danger">{failureMessage}</Notification>
{/if}
