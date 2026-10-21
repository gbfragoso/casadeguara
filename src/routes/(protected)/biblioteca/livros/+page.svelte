<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	type TextFilter = { name: string; label: string; placeholder: string; maxlength: number; inputmode?: 'numeric' };

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { colecoes, isAdmin } = $derived(data);
	let errors = $derived(form?.errors ?? {});
	const getValue = (field: string) => {
		const value = form?.values;
		if (!value) return '';
		const candidate = Reflect.get(value, field);
		return typeof candidate === 'string' ? candidate : '';
	};
	let collectionValue = $derived(getValue('colecao') || getValue('serie'));
	let hasDeleteFailure = $derived(Boolean(form?.message && form.outcome !== 'deleted'));
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Livros', href: resolve('biblioteca/livros') },
	];
	const leadingFilters: TextFilter[] = [
		{ name: 'tombo', label: 'Tombo', placeholder: 'Digite o tombo do livro', maxlength: 8, inputmode: 'numeric' },
		{ name: 'titulo', label: 'Título', placeholder: 'Digite o título do livro', maxlength: 80 },
		{ name: 'autor', label: 'Autor', placeholder: 'Digite o nome do autor', maxlength: 60 },
		{ name: 'editora', label: 'Editora', placeholder: 'Digite o nome da editora', maxlength: 60 },
	];
	const keywordFilter: TextFilter = {
		name: 'keyword',
		label: 'Palavra-chave',
		placeholder: 'Digite uma palavra-chave',
		maxlength: 30,
	};
	const bookPath = (id: number, section: 'autores' | 'exemplares' | 'keywords') =>
		resolve(`/(protected)/biblioteca/livros/[id=integer]/${section}`, { id: `${id}` });
</script>

{#snippet textFilter(filter: TextFilter)}
	<Field id={filter.name} label={filter.label} errors={errors[filter.name]}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name={filter.name}
				id={filter.name}
				inputmode={filter.inputmode}
				maxlength={filter.maxlength}
				value={getValue(filter.name)}
				placeholder={filter.placeholder}
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
{/snippet}

<PageHeader {breadcrumb} icon="fa-solid fa-book">Consulta de livros</PageHeader>

<Card element="form" action="?/pesquisar" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="grid gap-4 tablet:grid-cols-3">
		{#each leadingFilters as filter (filter.name)}
			{@render textFilter(filter)}
		{/each}
		<Field id="colecao" label="Coleção" errors={errors.colecao}>
			{#snippet control({ describedBy, invalid })}
				<Select
					name="colecao"
					id="colecao"
					value={collectionValue}
					aria-describedby={describedBy}
					aria-invalid={invalid}>
					<option value="" selected={collectionValue === ''}>Todas as coleções</option>
					{#each colecoes as colecao (colecao.idserie)}
						<option value={colecao.idserie} selected={collectionValue === `${colecao.idserie}`}
							>{colecao.nome}</option>
					{/each}
				</Select>
			{/snippet}
		</Field>
		{@render textFilter(keywordFilter)}
	</div>

	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('biblioteca/livros/novo')} tone="warning" bold class="tablet:min-w-40">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
</Card>

{#if form?.outcome === 'deleted'}
	<Notification kind="success">{form.message ?? 'Livro excluído com sucesso.'}</Notification>
{:else if hasDeleteFailure}
	<Notification kind="danger">{form?.message}</Notification>
{/if}

{#if form?.livros !== undefined}
	{#if form.livros.length === 0}
		<Card class="mt-6"><p role="status">Nenhum livro encontrado.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable caption="Resultados da consulta de livros" tableId="printable-content">
				{#snippet head()}
					<tr>
						<th>Tombo</th>
						<th>Título</th>
						<th>Palavra-chave</th>
						<th>Referência</th>
						<th class="print:hidden">Ações</th>
					</tr>
				{/snippet}
				{#each form.livros as livro, index (`${livro.idlivro}-${livro.keyword ?? ''}-${livro.referencia ?? ''}`)}
					{@const confirmationId = `delete-book-${livro.idlivro}-${index}`}
					<tr>
						<td class="tabular-nums">{livro.tombo}</td>
						<td class="font-medium text-ink-strong">{livro.titulo}</td>
						<td>{livro.keyword ?? '—'}</td>
						<td>{livro.referencia ?? '—'}</td>
						<td class="print:hidden">
							<div class="flex gap-1">
								<IconAction
									icon="fa-regular fa-pen-to-square"
									aria-label={`Editar livro ${livro.titulo}`}
									title="Editar"
									target="_blank"
									href={resolve('/(protected)/biblioteca/livros/[id=integer]', {
										id: `${livro.idlivro}`,
									})} />
								<IconAction
									icon="fa-solid fa-user-pen"
									aria-label={`Autores do livro ${livro.titulo}`}
									title="Autores"
									target="_blank"
									href={bookPath(livro.idlivro, 'autores')} />
								<IconAction
									icon="fa-solid fa-book"
									aria-label={`Exemplares do livro ${livro.titulo}`}
									title="Exemplares"
									target="_blank"
									href={bookPath(livro.idlivro, 'exemplares')} />
								<IconAction
									icon="fa-solid fa-key"
									aria-label={`Palavras-chave do livro ${livro.titulo}`}
									title="Palavras-chave"
									target="_blank"
									href={bookPath(livro.idlivro, 'keywords')} />
								{#if isAdmin}
									<IconAction
										icon="fa-regular fa-trash-can"
										tone="danger"
										popovertarget={confirmationId}
										aria-label={`Excluir livro ${livro.titulo}`}
										title="Excluir" />
									<div
										id={confirmationId}
										popover="auto"
										role="dialog"
										aria-labelledby={`${confirmationId}-title`}
										class="m-auto w-[calc(100%-2rem)] max-w-lg flex-col gap-4 rounded-xl bg-surface p-6 text-left text-ink shadow-raised backdrop:bg-overlay/60 open:flex">
										<SectionHeading
											element="p"
											id={`${confirmationId}-title`}
											icon="fa-solid fa-trash-can"
											iconTone="danger">Excluir livro</SectionHeading>
										<p>
											Para finalizar a exclusão dos livros é necessário antes excluir os
											exemplares. Confirma a exclusão de “{livro.titulo}”?
										</p>
										<div
											class="mt-2 flex flex-col-reverse gap-3 tablet:flex-row tablet:justify-end">
											<Button
												type="button"
												popovertarget={confirmationId}
												popovertargetaction="hide">Cancelar</Button>
											<form action="?/excluir" method="POST">
												<input type="hidden" name="idlivro" value={livro.idlivro} />
												<Button
													tone="danger"
													type="submit"
													aria-label={`Confirmar exclusão do livro ${livro.titulo}`}
													>Excluir</Button>
											</form>
										</div>
									</div>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
