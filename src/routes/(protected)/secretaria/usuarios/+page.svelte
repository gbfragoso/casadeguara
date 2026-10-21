<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';
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
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Usuários', href: resolve('secretaria/usuarios') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-user-plus">Consulta de usuários</PageHeader>

<Card element="form" action="/secretaria/usuarios" method="GET">
	<Field id="nome" label="Nome do usuário">
		{#snippet control()}
			<TextInput type="text" name="nome" id="nome" placeholder="Digite o nome do usuário" />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" class="font-bold tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('secretaria/usuarios/novo')} tone="warning" class="font-bold tablet:min-w-40">
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
		{#await usuarios}
			<tr>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
			</tr>
		{:then item}
			{#each item as usuario (usuario.id)}
				<tr>
					<td>{usuario.name}</td>
					<td class="print:hidden">
						<IconAction
							icon="fa-regular fa-pen-to-square"
							aria-label="editar"
							href={resolve('/(protected)/secretaria/usuarios/[id=alphanumeric]', { id: usuario.id })} />
					</td>
				</tr>
			{/each}
		{/await}
	</DataTable>
</Card>
