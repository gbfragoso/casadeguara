<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer({ reset: false });
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Aniversariantes', href: resolve('secretaria/aniversariantes') },
	];
	const months = [
		{ value: '01', label: 'Janeiro' },
		{ value: '02', label: 'Fevereiro' },
		{ value: '03', label: 'Março' },
		{ value: '04', label: 'Abril' },
		{ value: '05', label: 'Maio' },
		{ value: '06', label: 'Junho' },
		{ value: '07', label: 'Julho' },
		{ value: '08', label: 'Agosto' },
		{ value: '09', label: 'Setembro' },
		{ value: '10', label: 'Outubro' },
		{ value: '11', label: 'Novembro' },
		{ value: '12', label: 'Dezembro' },
	];
	dayjs.extend(utc);
	let selectedMonth = $derived(form?.mes ?? dayjs().format('MM'));
	let monthName = $derived(months.find((month) => month.value === form?.mes)?.label.toLocaleLowerCase('pt-BR') ?? '');
</script>

<PageHeader {breadcrumb} printTitle={false}>Lista de aniversariantes</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-3 tablet:flex-row" {@attach formEnhancer.submitWithLoading}>
	<Select name="mes" aria-label="Mês" class="grow">
		{#each months as month (month.value)}
			<option value={month.value} selected={month.value === selectedMonth}>{month.label}</option>
		{/each}
	</Select>
	<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-50">
		<i class="fa-regular fa-rectangle-list fa-fw" aria-hidden="true"></i>Gerar lista
	</Button>
</Card>

{#if form?.leitores?.length === 0}
	<Card class="mt-6"><p role="status">Nenhum aniversariante encontrado em {monthName}.</p></Card>
{:else if form?.leitores}
	<Card id="printable-content" class="notranslate mt-6 flex flex-col gap-2" translate="no">
		<h1 class="text-center text-lg font-bold text-primary-ink">GRUPO ESPÍRITA CASA DE GUARÁ</h1>
		<h2 class="text-center font-bold text-danger-ink uppercase">
			Aniversariantes do mês {monthName} / {dayjs.utc(new Date()).format('YYYY')}
		</h2>
		<DataTable class="-mx-5 mt-2 tablet:-mx-6 print:mx-0">
			{#snippet head()}
				<tr>
					<th>Nome</th>
					<th>Data</th>
				</tr>
			{/snippet}
			{#each form.leitores as leitor (leitor)}
				<tr>
					<td>
						{leitor.nome.toUpperCase()}
						{#if leitor.desencarnado}
							<span class="font-bold text-danger-ink">(IN MEMORIAM)</span>
						{/if}
					</td>
					<td>
						{#if leitor.aniversario}
							{dayjs.utc(leitor.aniversario).format('DD/MM')}
						{/if}
					</td>
				</tr>
			{/each}
		</DataTable>
		<p class="mt-4 text-center font-bold text-danger-ink print:fixed print:bottom-0 print:w-full">
			ATENÇÃO: Quaisquer omissões de nomes ou alterações de data favor avisar ao Ir. Carlson <br />
			(Tel (73) 98808-2447/Whatsapp) para as correções devidas
		</p>
	</Card>
{/if}
