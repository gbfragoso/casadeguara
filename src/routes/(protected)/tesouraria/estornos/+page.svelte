<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Field from '#lib/components/forms/Field.svelte';
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
	let values = $derived(form?.values ?? data?.values ?? {});
	let page = $derived(form?.page ?? data?.page);
	let periodErrors = $derived([...fieldErrors('lancamentoFim'), ...fieldErrors('estornoFim')]);

	const formEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Estornos', href: resolve('tesouraria/estornos') },
	];
	const textFields = [
		{ id: 'contraparte', label: 'Contraparte' },
		{ id: 'descricao', label: 'Descrição' },
	];
	const dateFields = [
		{ id: 'lancamentoInicio', label: 'Lançamento desde' },
		{ id: 'lancamentoFim', label: 'Lançamento até' },
		{ id: 'estornoInicio', label: 'Estorno desde' },
		{ id: 'estornoFim', label: 'Estorno até' },
	];
	function value(field: string) {
		return values[field] ?? '';
	}
	function fieldErrors(field: string) {
		return form?.errors?.[field] ?? [];
	}
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-clock-rotate-left">Auditoria de estornos</PageHeader>

<Card
	element="form"
	action="?/pesquisar"
	method="POST"
	class="flex flex-col gap-5"
	{@attach formEnhancer.submitWithLoading}>
	<Columns>
		<Column>
			<Field id="tipo" label="Tipo de lançamento">
				{#snippet control()}
					<Select id="tipo" name="tipo" value={value('tipo')}>
						<option value="todos">Todos</option>
						<option value="entrada">Entrada</option>
						<option value="saida">Saída</option>
					</Select>
				{/snippet}
			</Field>
		</Column>
		{#each textFields as field (field.id)}
			<Column>
				<Field id={field.id} label={field.label}>
					{#snippet control()}
						<TextInput
							id={field.id}
							name={field.id}
							maxlength={200}
							value={value(field.id)}
							aria-invalid={fieldErrors(field.id).length > 0} />
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
						<TextInput type="date" id={field.id} name={field.id} value={value(field.id)} />
					{/snippet}
				</Field>
			</Column>
		{/each}
	</Columns>
	{#if periodErrors.length}
		<p class="flex gap-1.5 text-sm text-danger-ink" role="alert">
			<i class="fa-solid fa-circle-exclamation fa-fw mt-0.5" aria-hidden="true"></i>
			{periodErrors.join(' ')}
		</p>
	{/if}
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} class="font-bold tablet:min-w-50">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
	</div>
</Card>

{#if page}
	{#if page.items.length === 0}
		<Card class="mt-6"><p role="status">Nenhum estorno encontrado.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable caption="Estornos registrados">
				{#snippet head()}
					<tr>
						<th>Tipo</th>
						<th>Contraparte</th>
						<th>Descrição</th>
						<th>Valor</th>
						<th>Motivo</th>
						<th>Usuário</th>
						<th>Data do lançamento</th>
						<th>Data do estorno</th>
					</tr>
				{/snippet}
				{#each page.items as item (item.id)}
					<tr>
						<td>{item.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
						<td>{item.contraparte?.nome ?? '—'}</td>
						<td>{item.descricao}</td>
						<td class="whitespace-nowrap">{moeda(Number(item.valor))}</td>
						<td>{item.motivo}</td>
						<td>{item.usuario}</td>
						<td>{formatCivilDate(item.dataLancamento)}</td>
						<td>{formatCivilDate(item.dataEstorno)}</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
