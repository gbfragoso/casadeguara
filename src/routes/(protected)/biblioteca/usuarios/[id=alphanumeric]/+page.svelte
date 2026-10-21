<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { usuario } = $derived(data);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Usuários', href: resolve('biblioteca/usuarios') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-user-plus">Cadastro de usuários</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="username" label="Usuário">
		{#snippet control()}
			<TextInput name="username" id="username" value={usuario.username} />
		{/snippet}
	</Field>
	<Field id="password" label="Senha">
		{#snippet control()}
			<TextInput type="password" name="password" id="password" />
		{/snippet}
	</Field>
	<Field id="name" label="Nome">
		{#snippet control()}
			<TextInput name="name" id="name" value={usuario.name} />
		{/snippet}
	</Field>
	<Field id="roles" label="Setor">
		{#snippet control()}
			<Select name="roles" id="roles" value={usuario.roles}>
				<option value="biblioteca">Biblioteca</option>
				<option value="biblioteca:admin">Biblioteca - Coordenação</option>
			</Select>
		{/snippet}
	</Field>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Atualizar</Button>
	</div>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Usuário atualizado com sucesso!</Notification>
{/if}
{#if form?.status === 400 && form?.message}
	<Notification kind="danger">{form.message}</Notification>
{/if}
