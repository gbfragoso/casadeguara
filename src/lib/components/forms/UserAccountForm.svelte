<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Progress from '#lib/components/feedback/Progress.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Select from '#lib/components/forms/Select.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import validator from 'validator';

	type UserAccount = { username: string; name: string; roles: string };
	type RoleOption = { value: string; label: string };
	type Props = {
		form: { status?: number; message?: string } | null | undefined;
		roleOptions: readonly RoleOption[];
		user?: UserAccount;
	};

	const CREATED_STATUS = 201;
	const UPDATED_STATUS = 200;
	const BAD_REQUEST_STATUS = 400;

	let { form, roleOptions, user }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let password = $state('');
	let successStatus = $derived(user ? UPDATED_STATUS : CREATED_STATUS);
	let successMessage = $derived(user ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
</script>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="username" label="Usuário" help="Use o e-mail de acesso, com até 30 caracteres.">
		{#snippet control({ describedBy })}
			<TextInput
				type="email"
				name="username"
				id="username"
				value={user?.username}
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
			{#if !user}
				<span class="flex flex-col gap-1.5 text-xs text-ink-muted">
					Força da senha
					<Progress value={validator.isStrongPassword(password, { returnScore: true })} max="50" />
				</span>
			{/if}
		{/snippet}
	</Field>
	<Field id="name" label="Nome">
		{#snippet control()}
			<TextInput name="name" id="name" value={user?.name} maxlength={255} autocomplete="off" required />
		{/snippet}
	</Field>
	<Field id="roles" label="Setor">
		{#snippet control()}
			<Select name="roles" id="roles" value={user?.roles}>
				{#each roleOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</Select>
		{/snippet}
	</Field>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>
			{user ? 'Atualizar' : 'Cadastrar'}
		</Button>
	</div>
</Card>

{#if form?.status === successStatus}
	<Notification kind="success">{successMessage}</Notification>
{/if}
{#if form?.status === BAD_REQUEST_STATUS && form?.message}
	<Notification kind="danger">{form.message}</Notification>
{/if}
