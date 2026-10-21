<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Progress from '#lib/components/feedback/Progress.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import validator from 'validator';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let password = $state('');
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Usuários', href: resolve('secretaria/usuarios') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-user-plus">Cadastro de usuários</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="username" label="Usuário">
		{#snippet control()}
			<TextInput name="username" id="username" />
		{/snippet}
	</Field>
	<Field id="password" label="Senha">
		{#snippet control()}
			<TextInput type="password" name="password" id="password" bind:value={password} />
			<span class="flex flex-col gap-1.5 text-xs text-ink-muted">
				Força da senha
				<Progress value={validator.isStrongPassword(password, { returnScore: true })} max="50" />
			</span>
		{/snippet}
	</Field>
	<Field id="name" label="Nome">
		{#snippet control()}
			<TextInput name="name" id="name" />
		{/snippet}
	</Field>
	<Field id="roles" label="Setor">
		{#snippet control()}
			<Select name="roles" id="roles">
				<option value="secretaria">Secretaria</option>
				<option value="secretaria:admin">Secretaria - Coordenação</option>
				<option value="tesouraria">Tesouraria</option>
				<option value="tesouraria:admin">Tesouraria - Coordenação</option>
			</Select>
		{/snippet}
	</Field>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Cadastrar</Button>
	</div>
</Card>

{#if form?.status === 201}
	<Notification kind="success">Usuário cadastrado com sucesso!</Notification>
{/if}
{#if form?.status === 400 && form?.message}
	<Notification kind="danger">{form.message}</Notification>
{/if}
