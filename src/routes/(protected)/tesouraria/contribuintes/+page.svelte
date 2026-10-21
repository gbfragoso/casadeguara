<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
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
	let contribuintes = $derived(form?.contribuintes);
	let searchName = $derived(form?.values?.nome ?? '');
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Contribuintes', href: resolve('tesouraria/contribuintes') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-user">Contribuintes</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-4" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome do contribuinte" errors={form?.errors?.nome}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				bind:value={searchName}
				placeholder="Digite o nome do contribuinte"
				autocomplete="name"
				maxlength={60}
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-2">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-50">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('tesouraria/contribuintes/novo')} tone="warning" bold class="tablet:min-w-50">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
	{#if form?.errors}
		<InlineNotification kind="danger" aria-live="polite">
			<div>
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={field === 'nome' ? undefined : `${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		</InlineNotification>
	{/if}
</Card>

{#if contribuintes !== undefined}
	{#if contribuintes.length === 0}
		<Card class="mt-6"><p>Nenhum contribuinte encontrado.</p></Card>
	{:else}
		<Card class="mt-6 overflow-hidden" padded={false}>
			<DataTable>
				{#snippet head()}
					<tr>
						<th>Contribuinte</th>
						<th>Telefone</th>
						<th>Tipo</th>
					</tr>
				{/snippet}
				{#each contribuintes as contribuinte (contribuinte.idleitor)}
					<tr>
						<td>{contribuinte.nome}</td>
						<td>{contribuinte.telefone ?? 'Não informado.'}</td>
						<td>{contribuinte.trab ? 'Trabalhador' : 'Eventual'}</td>
					</tr>
				{/each}
			</DataTable>
		</Card>
	{/if}
{/if}
