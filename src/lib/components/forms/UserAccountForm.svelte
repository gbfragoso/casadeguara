<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Progress from '#lib/components/feedback/Progress.svelte';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Radio from '#lib/components/forms/Radio.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { SYSTEM_MODULES, type SystemModulePath } from '#lib/navigation/system-modules.js';
	import { ACCESS_LEVELS, accessFieldName, type UserAccess } from '#lib/users/access.js';
	import validator from 'validator';

	type AccountValues = { username: string; name: string; access: UserAccess };
	type AccountField = 'username' | 'name' | 'password' | 'access' | 'superuser';
	type Props = {
		form:
			| { status?: number; values?: AccountValues; errors?: Partial<Record<AccountField, string[]>> }
			| null
			| undefined;
		user?: AccountValues;
	};

	const CREATED_STATUS = 201;
	const UPDATED_STATUS = 200;
	const USERNAME_MAX_LENGTH = 30;
	const NAME_MAX_LENGTH = 255;
	const PASSWORD_MIN_LENGTH = 6;
	const PASSWORD_STRENGTH_MAX = 50;
	const ACCESS_ERRORS_ID = 'access-errors';
	const SUPERUSER_HELP_ID = 'superuser-help';
	const SUPERUSER_ERRORS_ID = 'superuser-errors';

	let { form, user }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let password = $state('');
	let isEditing = $derived(user !== undefined);
	let values = $derived(form?.values ?? user);
	let errors = $derived(form?.errors ?? {});
	let accessErrors = $derived(errors.access ?? []);
	let superuserErrors = $derived(errors.superuser ?? []);
	let showsPasswordStrength = $derived(!isEditing || password !== '');
	let passwordHelp = $derived(isEditing ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.');
	let successStatus = $derived(isEditing ? UPDATED_STATUS : CREATED_STATUS);
	let successMessage = $derived(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
	let superuserDescription = $derived(
		[SUPERUSER_HELP_ID, superuserErrors.length > 0 && SUPERUSER_ERRORS_ID].filter(Boolean).join(' '),
	);

	const levelOf = (module: SystemModulePath) => values?.access.modules[module] ?? 'none';
</script>

{#snippet messages(id: string, items: readonly string[])}
	<ErrorMessage element="div" {id}>
		<div>
			{#each items as message (message)}
				<p>{message}</p>
			{/each}
		</div>
	</ErrorMessage>
{/snippet}

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="username" label="Usuário" help="Use o e-mail de acesso, com até 30 caracteres." errors={errors.username}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="email"
				name="username"
				id="username"
				value={values?.username}
				maxlength={USERNAME_MAX_LENGTH}
				autocomplete="off"
				required
				aria-invalid={invalid}
				aria-describedby={describedBy} />
		{/snippet}
	</Field>
	<Field id="name" label="Nome" errors={errors.name}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				name="name"
				id="name"
				value={values?.name}
				maxlength={NAME_MAX_LENGTH}
				autocomplete="off"
				required
				aria-invalid={invalid}
				aria-describedby={describedBy} />
		{/snippet}
	</Field>
	<Field id="password" label={isEditing ? 'Nova senha' : 'Senha'} help={passwordHelp} errors={errors.password}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="password"
				name="password"
				id="password"
				bind:value={password}
				minlength={PASSWORD_MIN_LENGTH}
				autocomplete="new-password"
				required={!isEditing}
				aria-invalid={invalid}
				aria-describedby={describedBy} />
			{#if showsPasswordStrength}
				<span class="flex flex-col gap-1.5 text-xs text-ink-muted">
					Força da senha
					<Progress
						aria-label="Força da senha"
						value={validator.isStrongPassword(password, { returnScore: true })}
						max={PASSWORD_STRENGTH_MAX} />
				</span>
			{/if}
		{/snippet}
	</Field>

	<div class="flex flex-col gap-4 border-t border-divider pt-5">
		{#each SYSTEM_MODULES as module (module.path)}
			<fieldset
				class="flex min-w-0 flex-col gap-1"
				aria-describedby={accessErrors.length > 0 ? ACCESS_ERRORS_ID : undefined}>
				<legend class="mb-1 text-sm font-medium text-ink-strong">{module.label}</legend>
				<ChoiceGroup>
					{#each ACCESS_LEVELS as level (level.value)}
						<Radio
							id={`${accessFieldName(module.path)}-${level.value}`}
							name={accessFieldName(module.path)}
							value={level.value}
							checked={levelOf(module.path) === level.value}>{level.label}</Radio>
					{/each}
				</ChoiceGroup>
			</fieldset>
		{/each}
		{#if accessErrors.length > 0}
			{@render messages(ACCESS_ERRORS_ID, accessErrors)}
		{/if}
	</div>

	<div class="flex flex-col gap-1.5 border-t border-divider pt-5">
		<div>
			<Checkbox
				id="superuser"
				name="superuser"
				checked={values?.access.superuser ?? false}
				aria-invalid={superuserErrors.length > 0 ? 'true' : undefined}
				aria-describedby={superuserDescription}>Superusuário</Checkbox>
		</div>
		<p id={SUPERUSER_HELP_ID} class="text-sm text-ink-muted">
			Libera apenas a gestão de usuários, sem acesso aos módulos.
		</p>
		{#if superuserErrors.length > 0}
			{@render messages(SUPERUSER_ERRORS_ID, superuserErrors)}
		{/if}
	</div>

	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>
			{isEditing ? 'Atualizar' : 'Cadastrar'}
		</Button>
	</div>
</Card>

{#if form?.status === successStatus}
	<Notification kind="success">{successMessage}</Notification>
{/if}
{#if form?.errors}
	<Notification kind="danger">Não foi possível salvar o usuário. Revise os campos indicados.</Notification>
{/if}
