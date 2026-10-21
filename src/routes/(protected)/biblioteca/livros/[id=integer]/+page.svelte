<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { livro, editoras, colecoes } = $derived(data);
	const fieldErrors = (field: string) => (form?.field === field && form.message ? [form.message] : []);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Livros', href: resolve('biblioteca/livros') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-book">Atualizar livro</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="tombo" label="Tombo">
		{#snippet control()}
			<TextInput
				type="number"
				name="tombo"
				id="tombo"
				value={livro.tombo}
				placeholder="Digite o tombo do livro"
				required />
		{/snippet}
	</Field>
	<Field id="titulo" label="Título" errors={fieldErrors('titulo')}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="titulo"
				id="titulo"
				value={livro.titulo}
				placeholder="Digite o título do livro"
				required
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<Field id="editora" label="Editora" errors={fieldErrors('editora')}>
		{#snippet control({ describedBy, invalid })}
			<Select
				name="editora"
				id="editora"
				value={livro.editora}
				required
				aria-describedby={describedBy}
				aria-invalid={invalid}>
				<option></option>
				{#each editoras as editora (editora.ideditora)}
					<option value={editora.ideditora}>{editora.nome}</option>
				{/each}
			</Select>
		{/snippet}
	</Field>
	<Columns>
		<Column size="half">
			<Field id="colecao" label="Coleção">
				{#snippet control()}
					<Select name="colecao" id="colecao" value={livro.serie}>
						<option></option>
						{#each colecoes as colecao (colecao.idserie)}
							<option value={colecao.idserie}>{colecao.nome}</option>
						{/each}
					</Select>
				{/snippet}
			</Field>
		</Column>
		<Column>
			<Field id="ordem" label="Ordem na coleção">
				{#snippet control()}
					<TextInput
						type="number"
						name="ordem"
						id="ordem"
						value={livro.ordem}
						placeholder="Ordem na coleção" />
				{/snippet}
			</Field>
		</Column>
	</Columns>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="mt-1">Atualizar</Button>
	</div>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Livro atualizado com sucesso!</Notification>
{/if}
