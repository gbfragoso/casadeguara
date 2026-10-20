<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import AccessCard from '#lib/components/layout/AccessCard.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData } from './$types';

	type Props = { form: ActionData };

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let emailErrors = $derived(form?.invalidEmail ? ['E-mail inválido'] : []);
	let passwordErrors = $derived(form?.invalidPassword ? ['Senha inválida'] : []);
	let generalErrors = $derived(
		[form?.failedLogin ? 'Email ou senha inválidos' : undefined, form?.message].filter(
			(message) => message !== undefined,
		),
	);
</script>

<AccessCard>
	<div class="mb-6 flex justify-center">
		<img src="/logo.png" alt="Avatar" class="h-auto w-2/5" />
	</div>
	<form method="POST" class="flex flex-col gap-4" {@attach formEnhancer.submitWithLoading}>
		<Field id="email" label="Email" errors={emailErrors}>
			{#snippet control({ describedBy, invalid })}
				<TextInput type="email" name="email" id="email" aria-describedby={describedBy} aria-invalid={invalid} />
			{/snippet}
		</Field>
		<Field id="password" label="Senha" errors={passwordErrors}>
			{#snippet control({ describedBy, invalid })}
				<TextInput
					type="password"
					name="password"
					id="password"
					aria-describedby={describedBy}
					aria-invalid={invalid} />
			{/snippet}
		</Field>
		<div class="pt-2">
			<Button tone="primary" fullwidth loading={formEnhancer.loading} class="font-bold">Entrar</Button>
		</div>
		{#each generalErrors as message (message)}
			<p class="flex items-center gap-1.5 text-sm text-danger-ink">
				<i class="fa-solid fa-circle-exclamation fa-fw" aria-hidden="true"></i>{message}
			</p>
		{/each}
	</form>
</AccessCard>
