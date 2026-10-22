<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Section from '#lib/components/layout/Section.svelte';
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
	let breadcrumb = $derived([
		{ label: 'Módulos', href: resolve('sistemas') },
		{ label: 'Meu cadastro', href: resolve('/(protected)/usuario/[id=alphanumeric]', { id: usuario.id }) },
	]);
</script>

<main>
	<Section class="mx-auto max-w-2xl">
		<PageHeader {breadcrumb}>Meu cadastro</PageHeader>

		<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
			<Field id="name" label="Nome">
				{#snippet control()}
					<TextInput
						name="name"
						id="name"
						value={usuario.name}
						maxlength={255}
						autocomplete="name"
						required />
				{/snippet}
			</Field>
			<Field id="password" label="Nova senha" help="Mínimo de 6 caracteres.">
				{#snippet control({ describedBy })}
					<TextInput
						type="password"
						name="password"
						id="password"
						minlength={6}
						autocomplete="new-password"
						required
						aria-describedby={describedBy} />
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
	</Section>
</main>
