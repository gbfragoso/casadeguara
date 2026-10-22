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
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Usuários', href: resolve('biblioteca/usuarios') },
	];
</script>

<PageHeader {breadcrumb}>Cadastro de usuários</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="username" label="Usuário" help="Use o e-mail de acesso, com até 30 caracteres.">
		{#snippet control({ describedBy })}
			<TextInput
				type="email"
				name="username"
				id="username"
				maxlength={30}
				autocomplete="off"
				required
				aria-describedby={describedBy} />
		{/snippet}
	</Field>
	<Field id="password" label="Senha" help="Mínimo de 6 caracteres.">
		{#snippet control({ describedBy })}
			<TextInput
				type="password"
				name="password"
				id="password"
				bind:value={password}
				minlength={6}
				autocomplete="new-password"
				required
				aria-describedby={describedBy} />
			<span class="flex flex-col gap-1.5 text-xs text-ink-muted">
				Força da senha
				<Progress value={validator.isStrongPassword(password, { returnScore: true })} max="50" />
			</span>
		{/snippet}
	</Field>
	<Field id="name" label="Nome">
		{#snippet control()}
			<TextInput name="name" id="name" maxlength={255} autocomplete="off" required />
		{/snippet}
	</Field>
	<Field id="roles" label="Setor">
		{#snippet control()}
			<Select name="roles" id="roles">
				<option value="biblioteca">Biblioteca</option>
				<option value="biblioteca:admin">Biblioteca - Coordenação</option>
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
