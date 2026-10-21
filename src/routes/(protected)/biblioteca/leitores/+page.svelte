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
	const formEnhancer = createFormEnhancer();
	let leitores = $derived(form?.leitores);
	let searchName = $derived(form?.values?.nome ?? '');
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Leitores', href: resolve('biblioteca/leitores') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-book-open-reader">Consulta de leitores</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome do leitor" errors={form?.errors?.nome}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				bind:value={searchName}
				placeholder="Digite o nome do leitor"
				autocomplete="name"
				maxlength={60}
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('biblioteca/leitores/novo')} tone="warning" bold class="tablet:min-w-40">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
</Card>

{#if leitores !== undefined}
	{#if leitores.length === 0}
		<Card class="mt-6"><p>Nenhum leitor encontrado.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable>
				{#snippet head()}
					<tr>
						<th>Nome</th>
						<th>Trabalhador</th>
						<th>Status</th>
						<th class="print:hidden">Ações</th>
					</tr>
				{/snippet}
				{#each leitores as leitor (leitor.idleitor)}
					<tr>
						<td>{leitor.nome}</td>
						<td>{leitor.trab ? 'Sim' : 'Não'}</td>
						<td>{leitor.status ? 'Ativo' : 'Inativo'}</td>
						<td class="print:hidden">
							<IconAction
								icon="fa-regular fa-pen-to-square"
								aria-label={`Editar leitor ${leitor.nome}`}
								href={resolve('/(protected)/biblioteca/leitores/[id=integer]', {
									id: `${leitor.idleitor}`,
								})} />
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
