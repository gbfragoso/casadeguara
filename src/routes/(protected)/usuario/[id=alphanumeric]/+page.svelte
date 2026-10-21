<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Section from '#lib/components/layout/Section.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { usuario } = $derived(data);
</script>

<main>
	<Section>
		<h1 class="mb-6 text-2xl font-bold text-primary-ink tablet:text-3xl">Meu cadastro</h1>

		<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
			<Field id="name" label="Nome">
				{#snippet control()}
					<TextInput name="name" id="name" value={usuario.name} />
				{/snippet}
			</Field>
			<Field id="password" label="Nova senha">
				{#snippet control()}
					<TextInput type="password" name="password" id="password" />
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
