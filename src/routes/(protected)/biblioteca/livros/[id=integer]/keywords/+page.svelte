<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer, enhanceForm } from '#lib/forms/enhancer.svelte.js';
	import type { PageProps, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		params: PageProps['params'];
	}

	let { data, params }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { keywords, keywordsLivro, livros, isAdmin } = $derived(data);
	let breadcrumb = $derived([
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Livros', href: resolve('biblioteca/livros') },
		{
			label: 'Palavras-Chave',
			href: resolve('/(protected)/biblioteca/livros/[id=integer]/keywords', { id: params.id }),
		},
	]);
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-key">Consulta de palavras-chave</PageHeader>

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
	<Field id="keyword" label="Palavra-chave">
		{#snippet control()}
			<Select name="keyword" id="keyword" required>
				<option></option>
				{#await keywords then item}
					{#each item as keyword (keyword.idkeyword)}
						<option value={keyword.idkeyword}>{keyword.chave}</option>
					{/each}
				{/await}
			</Select>
		{/snippet}
	</Field>
	<Field id="referencia" label="Referência">
		{#snippet control()}
			<TextInput
				type="text"
				name="referencia"
				id="referencia"
				placeholder="Digite o local do livro onde encontramos esse tema"
				required />
		{/snippet}
	</Field>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} class="font-bold">Adicionar</Button>
	</div>
</Card>

<Card class="mt-6 overflow-hidden" padded={false}>
	<DataTable>
		{#snippet head()}
			<tr>
				<th>Palavra-chave</th>
				<th>Referência</th>
				<th class="print:hidden">Ações</th>
			</tr>
		{/snippet}
		{#await keywordsLivro}
			<tr>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
			</tr>
		{:then item}
			{#each item as keyword (keyword.idkeyword)}
				<tr>
					<td>{keyword.chave}</td>
					<td>{keyword.referencia}</td>
					<td class="print:hidden">
						{#if isAdmin}
							<form action={`?/excluir&keyword=${keyword.idkeyword}`} method="POST" {@attach enhanceForm}>
								<IconAction
									type="submit"
									tone="danger"
									icon="fa-regular fa-trash-can"
									aria-label="trash" />
							</form>
						{/if}
					</td>
				</tr>
			{/each}
		{/await}
	</DataTable>
</Card>
