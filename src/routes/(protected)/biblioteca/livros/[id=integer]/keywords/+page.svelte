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
	import { KEYWORD_REFERENCE_MAX_LENGTH } from '#lib/validation/keyword.js';
	import type { ActionData, PageProps, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form?: ActionData;
		params: PageProps['params'];
	}

	let { data, form, params }: Props = $props();
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

<PageHeader {breadcrumb}>Consulta de palavras-chave</PageHeader>

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
	<Field id="keyword" label="Palavra-chave">
		{#snippet control()}
			<Select name="keyword" id="keyword" required>
				<option></option>
				{#await keywords then item}
					{#each item as keyword (keyword.idkeyword)}
						<option value={keyword.idkeyword}>{keyword.chave}</option>
					{/each}
				{:catch}
					<option value="" disabled>Não foi possível carregar as palavras-chave</option>
				{/await}
			</Select>
		{/snippet}
	</Field>
	<Field id="referencia" label="Referência" errors={form?.errors?.referencia}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="referencia"
				id="referencia"
				aria-describedby={describedBy}
				aria-invalid={invalid}
				placeholder="Digite o local do livro onde encontramos esse tema"
				maxlength={KEYWORD_REFERENCE_MAX_LENGTH}
				required />
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
				<th>Palavra-chave</th>
				<th>Referência</th>
				<th class="print:hidden">Ações</th>
			</tr>
		{/snippet}
		<AsyncTableRows
			rows={keywordsLivro}
			columns={3}
			emptyMessage="Nenhuma palavra-chave associada a este livro."
			errorMessage="Não foi possível carregar as palavras-chave do livro.">
			{#snippet row(keyword)}
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
									title="Remover"
									aria-label={`Remover palavra-chave ${keyword.chave} do livro`} />
							</form>
						{/if}
					</td>
				</tr>
			{/snippet}
		</AsyncTableRows>
	</DataTable>
</Card>
