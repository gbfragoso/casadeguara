<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer({ reset: false });
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Autores', href: resolve('biblioteca/autores') },
	];
</script>

<PageHeader {breadcrumb}>Consulta de autores</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome do autor" errors={form?.errors?.nome}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				value={form?.values?.nome ?? ''}
				placeholder="Digite o nome do autor"
				maxlength={60}
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('biblioteca/autores/novo')} tone="default" bold class="tablet:min-w-40">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
</Card>

{#if form?.autores !== undefined}
	{#if form.autores.length === 0}
		<Card class="mt-6"><p>Nenhum autor encontrado.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable>
				{#snippet head()}
					<tr>
						<th>Nome</th>
						<th class="print:hidden">Ações</th>
					</tr>
				{/snippet}
				{#each form.autores as autor (autor.idautor)}
					<tr>
						<td>{autor.nome}</td>
						<td class="print:hidden">
							<IconAction
								icon="fa-regular fa-pen-to-square"
								aria-label={`Editar autor ${autor.nome}`}
								href={resolve('/(protected)/biblioteca/autores/[id=integer]', {
									id: `${autor.idautor}`,
								})} />
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
