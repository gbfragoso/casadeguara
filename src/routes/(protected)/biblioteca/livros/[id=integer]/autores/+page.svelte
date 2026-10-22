<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import AsyncTableRows from '#lib/components/data/AsyncTableRows.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
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
	let { autores, autoresLivro, livros, isAdmin } = $derived(data);
	let breadcrumb = $derived([
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Livros', href: resolve('biblioteca/livros') },
		{ label: 'Autores', href: resolve('/(protected)/biblioteca/livros/[id=integer]/autores', { id: params.id }) },
	]);
</script>

<PageHeader {breadcrumb}>Consulta de autores</PageHeader>

<Card
	element="form"
	action="?/adicionar"
	method="POST"
	class="flex flex-col gap-5"
	{@attach formEnhancer.submitWithLoading}>
	<Columns>
		{#await livros then livro}
			{#if livro.length === 0}
				<p role="alert" class="text-danger-ink">Livro não encontrado. Ele pode ter sido excluído.</p>
			{:else}
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
			{/if}
		{/await}
	</Columns>
	<Field id="autor" label="Nome do autor">
		{#snippet control()}
			<Select name="autor" id="autor" required>
				<option></option>
				{#await autores then item}
					{#each item as autor (autor.idautor)}
						<option value={autor.idautor}>{autor.nome}</option>
					{/each}
				{:catch}
					<option value="" disabled>Não foi possível carregar os autores</option>
				{/await}
			</Select>
		{/snippet}
	</Field>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Adicionar</Button>
	</div>
</Card>

<Card class="mt-6 overflow-hidden" padded={false}>
	<DataTable>
		{#snippet head()}
			<tr>
				<th>Nome</th>
				<th class="print:hidden">Ações</th>
			</tr>
		{/snippet}
		<AsyncTableRows
			rows={autoresLivro}
			columns={2}
			emptyMessage="Nenhum autor associado a este livro."
			errorMessage="Não foi possível carregar os autores do livro.">
			{#snippet row(autor)}
				<tr>
					<td>{autor.nome}</td>
					<td class="print:hidden">
						{#if isAdmin}
							<form action={`?/excluir&autor=${autor.idautor}`} method="POST" {@attach enhanceForm}>
								<IconAction
									type="submit"
									tone="danger"
									icon="fa-regular fa-trash-can"
									title="Remover"
									aria-label={`Remover autor ${autor.nome} do livro`} />
							</form>
						{/if}
					</td>
				</tr>
			{/snippet}
		</AsyncTableRows>
	</DataTable>
</Card>
