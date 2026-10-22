<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Tags from '#lib/components/feedback/Tags.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		form: ActionData;
		data: PageServerData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer({ reset: false });
	let { colecoes } = $derived(data);
	const breadcrumb = [
		{ label: 'Acervo', href: resolve('acervo') },
		{ label: 'Livros', href: resolve('acervo') },
	];
	const titleFields = [
		{ id: 'titulo', label: 'Título', placeholder: 'Digite o título do livro', maxlength: 80 },
		{ id: 'autor', label: 'Autor', placeholder: 'Digite o nome do autor', maxlength: 60 },
	];
</script>

<PageHeader {breadcrumb}>Consulta de livros</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="grid gap-4 tablet:grid-cols-6">
		{#each titleFields as field (field.id)}
			<Field id={field.id} label={field.label} class="tablet:col-span-3">
				{#snippet control()}
					<TextInput
						type="text"
						name={field.id}
						id={field.id}
						placeholder={field.placeholder}
						maxlength={field.maxlength} />
				{/snippet}
			</Field>
		{/each}
		<Field id="editora" label="Editora" class="tablet:col-span-2">
			{#snippet control()}
				<TextInput
					type="text"
					name="editora"
					id="editora"
					placeholder="Digite o nome da editora"
					maxlength={60} />
			{/snippet}
		</Field>
		<Field id="serie" label="Coleção" class="tablet:col-span-2">
			{#snippet control()}
				<Select name="serie" id="serie">
					<option value="">Todas as coleções</option>
					{#await colecoes then item}
						{#each item as serie (serie.idserie)}
							<option value={serie.idserie}>{serie.nome}</option>
						{/each}
					{:catch}
						<option value="" disabled>Não foi possível carregar as coleções</option>
					{/await}
				</Select>
			{/snippet}
		</Field>
		<Field id="keyword" label="Palavra-chave" class="tablet:col-span-2">
			{#snippet control()}
				<TextInput
					type="text"
					name="keyword"
					id="keyword"
					placeholder="Digite uma palavra-chave"
					maxlength={30} />
			{/snippet}
		</Field>
	</div>
	<div class="mt-6">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
	</div>
</Card>

{#if form?.livros?.length === 0}
	<Card class="mt-6"><p role="status">Nenhum livro encontrado. Tente buscar por outro termo.</p></Card>
{:else if form?.livros}
	<Card class="mt-6 overflow-hidden" padded={false}>
		<DataTable>
			{#snippet head()}
				<tr>
					<th>Título</th>
					<th>Disponíveis</th>
				</tr>
			{/snippet}
			{#each form.livros as livro (livro.idlivro)}
				<tr>
					<td>
						<p class="font-medium text-ink-strong">{livro.titulo}</p>
						<Tags class="mt-1">
							{#each livro.autores as autor (autor)}
								<Tag kind="primary">{autor}</Tag>
							{/each}
						</Tags>
					</td>
					<td>{livro.disponiveis}</td>
				</tr>
			{/each}
		</DataTable>
	</Card>
{/if}
