<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextArea from '#lib/components/forms/TextArea.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { NOTICE_TEXT_MAX_LENGTH } from '#lib/validation/aviso.js';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let errorMessages = $derived(form?.errors?.texto ?? []);
	let submittedText = $derived(form?.values?.texto ?? data.aviso.texto);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Avisos', href: resolve('biblioteca/avisos') },
	];
</script>

<PageHeader {breadcrumb}>Atualizar aviso</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="texto" label="Texto do aviso" errors={errorMessages}>
		{#snippet control({ describedBy, invalid })}
			<TextArea
				name="texto"
				id="texto"
				placeholder="Digite o texto do aviso"
				required
				maxlength={NOTICE_TEXT_MAX_LENGTH}
				class="min-h-32 resize-none"
				aria-invalid={invalid}
				aria-describedby={describedBy}
				bind:value={submittedText} />
		{/snippet}
	</Field>
	<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="mt-6 tablet:min-w-40"
		>Atualizar</Button>
</Card>

{#if form?.status === 200}
	<Notification kind="success">Aviso atualizado com sucesso!</Notification>
{/if}
