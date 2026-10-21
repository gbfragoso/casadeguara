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
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Palavras-chave', href: resolve('biblioteca/keywords') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-key">Consulta de palavras-chave</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="chave" label="Palavra-chave" errors={form?.errors?.chave}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="chave"
				id="chave"
				value={form?.values?.chave ?? ''}
				placeholder="Digite a palavra-chave"
				maxlength={30}
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('biblioteca/keywords/novo')} tone="warning" bold class="tablet:min-w-40">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
</Card>

{#if form?.keywords !== undefined}
	{#if form.keywords.length === 0}
		<Card class="mt-6"><p>Nenhuma palavra-chave encontrada.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable>
				{#snippet head()}
					<tr>
						<th>Palavra-chave</th>
						<th class="print:hidden">Ações</th>
					</tr>
				{/snippet}
				{#each form.keywords as keyword (keyword.idkeyword)}
					<tr>
						<td>{keyword.chave}</td>
						<td class="print:hidden">
							<IconAction
								icon="fa-regular fa-pen-to-square"
								aria-label={`Editar palavra-chave ${keyword.chave}`}
								href={resolve('/(protected)/biblioteca/keywords/[id=integer]', {
									id: `${keyword.idkeyword}`,
								})} />
						</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
