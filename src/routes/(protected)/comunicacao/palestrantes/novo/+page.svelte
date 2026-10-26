<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { SPEAKER_NAME_MAX_LENGTH } from '#lib/validation/comunicacao/palestrantes.js';
	import type { ActionData } from './$types';

	type Props = { form: ActionData };

	let { form }: Props = $props();

	const formEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestrantes', href: resolve('comunicacao/palestrantes') },
	];
</script>

<PageHeader {breadcrumb}>Novo palestrante</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome" errors={form?.errors?.nome}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				value={form?.values?.nome ?? ''}
				maxlength={SPEAKER_NAME_MAX_LENGTH}
				autocomplete="off"
				required
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Cadastrar</Button>
	</div>
</Card>
