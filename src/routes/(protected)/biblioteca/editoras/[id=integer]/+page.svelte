<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
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
	let editora = $derived(data.editora);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Editoras', href: resolve('biblioteca/editoras') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-landmark-flag">Atualizar editora</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome" errors={form?.errors?.nome}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				value={form?.values?.nome ?? editora.nome}
				placeholder="Digite o nome da editora"
				maxlength={60}
				required
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<Button type="submit" tone="primary" loading={formEnhancer.loading} class="mt-6 font-bold">Atualizar</Button>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Editora atualizada com sucesso!</Notification>
{/if}
