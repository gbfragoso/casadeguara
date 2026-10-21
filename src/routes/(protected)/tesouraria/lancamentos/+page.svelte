<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Radio from '#lib/components/forms/Radio.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { moeda } from '#lib/utils/currency.js';
	import { formatCivilDate } from '#lib/utils/date.js';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data?: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let selectedType = $derived((form?.values?.tipo ?? data?.values?.tipo ?? 'todos') as 'todos' | 'entrada' | 'saida');
	let values = $derived(form?.values ?? data?.values ?? {});
	let page = $derived(form?.page ?? data?.page);
	let errors = $derived(form?.errors ?? {});
	let hasEntryFilters = $derived(selectedType === 'entrada');

	const formEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Lançamentos', href: resolve('tesouraria/lancamentos') },
	];
	const textFields = [
		{ id: 'contraparte', label: 'Contraparte' },
		{ id: 'descricao', label: 'Descrição' },
	];
	const dateFields = [
		{ id: 'dataRegistro', label: 'Registrado em' },
		{ id: 'dataInicio', label: 'Data inicial' },
		{ id: 'dataFim', label: 'Data final' },
	];
	const depositOptions = [
		{ value: '', label: 'Todos' },
		{ value: 'true', label: 'Sim' },
		{ value: 'false', label: 'Não' },
	];
	const fieldValue = (field: string) => values[field] ?? '';
	const fieldErrors = (field: string) => errors[field] ?? [];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-wallet">Lançamentos</PageHeader>

<Card
	element="form"
	action="?/pesquisar"
	method="POST"
	class="flex flex-col gap-5"
	{@attach formEnhancer.submitWithLoading}>
	<Columns>
		{#each textFields as field (field.id)}
			<Column>
				<Field id={field.id} label={field.label} errors={fieldErrors(field.id)}>
					{#snippet control({ describedBy })}
						<TextInput
							id={field.id}
							name={field.id}
							maxlength={200}
							value={fieldValue(field.id)}
							aria-invalid={fieldErrors(field.id).length > 0}
							aria-describedby={describedBy} />
					{/snippet}
				</Field>
			</Column>
		{/each}
	</Columns>
	<Columns>
		{#each dateFields as field (field.id)}
			<Column>
				<Field id={field.id} label={field.label}>
					{#snippet control()}
						<TextInput type="date" id={field.id} name={field.id} value={fieldValue(field.id)} />
					{/snippet}
				</Field>
			</Column>
		{/each}
	</Columns>
	<Columns>
		<Column>
			<Field id="tipo" label="Tipo de lançamento">
				{#snippet control()}
					<Select id="tipo" name="tipo" bind:value={selectedType}>
						<option value="todos">Todos</option>
						<option value="entrada">Entrada</option>
						<option value="saida">Despesa</option>
					</Select>
				{/snippet}
			</Field>
		</Column>
		{#if hasEntryFilters}
			<Column>
				<fieldset class="flex flex-col gap-1.5">
					<legend class="mb-1.5 text-sm font-medium text-ink-strong">Depósito confirmado?</legend>
					<ChoiceGroup>
						{#each depositOptions as option (option.value)}
							<Radio
								name="depositado"
								value={option.value}
								checked={fieldValue('depositado') === option.value}>{option.label}</Radio>
						{/each}
					</ChoiceGroup>
				</fieldset>
			</Column>
			<Column>
				<Field id="trabalhadores" label="Tipo de contribuinte">
					{#snippet control()}
						<Checkbox
							name="trabalhadores"
							id="trabalhadores"
							value="true"
							checked={fieldValue('trabalhadores') === 'true'}>Somente trabalhadores</Checkbox>
					{/snippet}
				</Field>
			</Column>
		{/if}
	</Columns>
	<ButtonGroup>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} class="font-bold tablet:min-w-50">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('tesouraria/lancamentos/novo')} tone="warning" class="font-bold tablet:min-w-50">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo lançamento
		</Button>
	</ButtonGroup>
</Card>

{#if form?.message}
	<InlineNotification kind="info" element="p" role="status" class="mt-6">{form.message}</InlineNotification>
{/if}
{#if page}
	<Columns class="mt-6">
		<Column><strong>Total de entradas:</strong> {moeda(Number(page.totais.entradas))}</Column>
		<Column><strong>Total de saídas:</strong> {moeda(Number(page.totais.saidas))}</Column>
	</Columns>
	{#if page.items.length === 0}
		<Card class="mt-6"><p role="status">Nenhum lançamento encontrado.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable caption="Lançamentos ativos">
				{#snippet head()}
					<tr>
						<th>ID</th>
						<th>Contraparte</th>
						<th>Descrição</th>
						<th>Tipo</th>
						<th>Valor</th>
						<th>Data</th>
						<th class="text-right print:hidden">Ações</th>
					</tr>
				{/snippet}
				{#each page.items as item (item.id)}
					<tr>
						<td>{item.id}</td>
						<td>{item.contraparte?.nome ?? '—'}</td>
						<td>{item.descricao}</td>
						<td>
							{#if item.tipo === 'entrada'}
								<Tag kind="success">Entrada</Tag>
							{:else}
								<Tag kind="danger">Despesa</Tag>
							{/if}
						</td>
						<td class="whitespace-nowrap">{moeda(Number(item.valor))}</td>
						<td>{formatCivilDate(item.dataLancamento)}</td>
						<td class="print:hidden">
							<div class="flex justify-end gap-1">
								{#if item.tipo === 'entrada' && item.reciboUuid}
									<IconAction
										icon="fa-regular fa-file-lines"
										title="Recibo"
										aria-label="Recibo"
										target="_blank"
										href={resolve('/recibo/[uuid=uuid]', { uuid: item.reciboUuid })} />
								{/if}
								<IconAction
									icon="fa-regular fa-trash-can"
									tone="danger"
									title="Estorno"
									aria-label="Estornar"
									href={resolve('/(protected)/tesouraria/lancamentos/[id=integer]/estorno', {
										id: `${item.id}`,
									})} />
							</div>
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
