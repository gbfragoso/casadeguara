<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import AsyncTableRows from '#lib/components/data/AsyncTableRows.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { usuarios } = $derived(data);
	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Usuários', href: resolve('comunicacao/usuarios') },
	];
</script>

<PageHeader {breadcrumb}>Consulta de usuários</PageHeader>

<Card element="form" action="/comunicacao/usuarios" method="GET">
	<Field id="nome" label="Nome do usuário">
		{#snippet control()}
			<TextInput type="text" name="nome" id="nome" placeholder="Digite o nome do usuário" />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('comunicacao/usuarios/novo')} tone="default" bold class="tablet:min-w-40">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
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
			rows={usuarios}
			columns={2}
			emptyMessage="Nenhum usuário encontrado."
			errorMessage="Não foi possível carregar os usuários.">
			{#snippet row(usuario)}
				<tr>
					<td>{usuario.name}</td>
					<td class="print:hidden">
						<IconAction
							icon="fa-regular fa-pen-to-square"
							aria-label={`Editar usuário ${usuario.name}`}
							href={resolve('/(protected)/comunicacao/usuarios/[id=alphanumeric]', { id: usuario.id })} />
					</td>
				</tr>
			{/snippet}
		</AsyncTableRows>
	</DataTable>
</Card>
