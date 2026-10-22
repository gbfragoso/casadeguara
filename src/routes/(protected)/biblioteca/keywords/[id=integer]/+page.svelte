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
	let keyword = $derived(data.keyword);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Palavras-chave', href: resolve('biblioteca/keywords') },
	];
</script>

<PageHeader {breadcrumb}>Atualizar palavra-chave</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="chave" label="Palavra-chave" errors={form?.errors?.chave}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="chave"
				id="chave"
				value={form?.values?.chave ?? keyword.chave}
				placeholder="Digite a palavra-chave"
				maxlength={30}
				required
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="mt-6">Atualizar</Button>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Palavra-chave atualizada com sucesso!</Notification>
{/if}
