<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import type { Tone } from '#lib/components/feedback/tone.js';
	import Field from '#lib/components/forms/Field.svelte';
	import FieldAddons from '#lib/components/forms/FieldAddons.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer, enhanceForm } from '#lib/forms/enhancer.svelte.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageProps, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
		params: PageProps['params'];
	}

	const STATUS_TONES: Partial<Record<string, Tone>> = { Disponível: 'success', Arquivado: 'warning' };

	let { data, form, params }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { exemplares, livros, isAdmin } = $derived(data);
	let breadcrumb = $derived([
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Livros', href: resolve('biblioteca/livros') },
		{
			label: 'Exemplares',
			href: resolve('/(protected)/biblioteca/livros/[id=integer]/exemplares', { id: params.id }),
		},
	]);
	dayjs.extend(utc);
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-book">Consulta de exemplares</PageHeader>

<Card
	element="form"
	action="?/adicionar"
	method="POST"
	class="flex flex-col gap-5"
	{@attach formEnhancer.submitWithLoading}>
	<Columns>
		{#await livros then livro}
			<Column size={2}>
				<Field id="tombo" label="Tombo">
					{#snippet control()}
						<TextInput type="number" name="tombo" id="tombo" value={livro[0].tombo} disabled />
					{/snippet}
				</Field>
			</Column>
			<Column>
				<Field id="titulo" label="Título">
					{#snippet control()}
						<TextInput type="text" name="titulo" id="titulo" value={livro[0].titulo} disabled />
					{/snippet}
				</Field>
			</Column>
		{/await}
	</Columns>
	<Field id="numero" label="Número do exemplar">
		{#snippet control()}
			<FieldAddons>
				<TextInput type="number" name="numero" id="numero" step="1" class="grow" />
				<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Adicionar</Button>
			</FieldAddons>
		{/snippet}
	</Field>
	{#if form?.status === 201}
		<p class="text-sm text-success-ink">Exemplar adicionado com sucesso!</p>
	{:else if form?.status === 200}
		<p class="text-sm text-success-ink">Exemplar excluído com sucesso!</p>
	{/if}
</Card>

<Card class="mt-6 overflow-hidden" padded={false}>
	<DataTable>
		{#snippet head()}
			<tr>
				<th>Ex</th>
				<th>Data cadastro</th>
				<th>Status</th>
				{#if isAdmin}
					<th class="print:hidden">Ações</th>
				{/if}
			</tr>
		{/snippet}
		{#await exemplares}
			<tr>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
				{#if isAdmin}
					<td><SkeletonLines /></td>
				{/if}
			</tr>
		{:then item}
			{#each item as exemplar (exemplar.idexemplar)}
				<tr>
					<td class="tabular-nums">{exemplar.numero}</td>
					<td class="tabular-nums">{dayjs.utc(exemplar.dataCadastro).format('DD/MM/YYYY')}</td>
					<td><Tag kind={STATUS_TONES[exemplar.status ?? ''] ?? 'danger'}>{exemplar.status}</Tag></td>
					<td class="print:hidden">
						{#if isAdmin && exemplar.status !== 'Emprestado'}
							<div class="flex gap-1">
								{#if exemplar.status !== 'Disponível'}
									<form
										action={`?/disponivel&exemplar=${exemplar.idexemplar}`}
										method="POST"
										{@attach enhanceForm}>
										<IconAction
											type="submit"
											icon="fa-solid fa-box-open"
											title="Disponibilizar"
											aria-label="Disponibilizar" />
									</form>
								{/if}
								{#if exemplar.status !== 'Arquivado'}
									<form
										action={`?/arquivar&exemplar=${exemplar.idexemplar}`}
										method="POST"
										{@attach enhanceForm}>
										<IconAction
											type="submit"
											icon="fa-solid fa-box-archive"
											title="Arquivar"
											aria-label="Arquivar" />
									</form>
								{/if}
								<form
									action={`?/excluir&exemplar=${exemplar.idexemplar}`}
									method="POST"
									{@attach enhanceForm}>
									<IconAction
										type="submit"
										tone="danger"
										icon="fa-regular fa-trash-can"
										title="Excluir"
										aria-label="trash" />
								</form>
							</div>
						{/if}
					</td>
				</tr>
			{/each}
		{/await}
	</DataTable>
</Card>
