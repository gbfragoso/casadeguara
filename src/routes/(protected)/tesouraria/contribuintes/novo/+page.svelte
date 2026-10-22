<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let workerChecked = $derived(form?.values?.trab === 'true');
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Contribuintes', href: resolve('tesouraria/contribuintes') },
	];
	const errorAttributes = (field: string) =>
		form?.errors?.[field]?.length ? { 'aria-describedby': `${field}-errors`, 'aria-invalid': 'true' as const } : {};
</script>

<PageHeader {breadcrumb}>Cadastrar novo contribuinte</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome">
		{#snippet control()}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				value={form?.values?.nome ?? ''}
				autocomplete="name"
				maxlength={60}
				required
				{...errorAttributes('nome')} />
		{/snippet}
	</Field>
	<Field id="telefone" label="WhatsApp (com DDD)">
		{#snippet control()}
			<TextInput
				type="text"
				name="telefone"
				id="telefone"
				value={form?.values?.telefone ?? ''}
				maxlength={15}
				inputmode="tel"
				autocomplete="tel-national"
				{...errorAttributes('telefone')} />
		{/snippet}
	</Field>
	<div>
		<input type="hidden" name="trab" value="false" />
		<Checkbox name="trab" id="trab" value="true" checked={workerChecked} {...errorAttributes('trab')}
			>Trabalhador</Checkbox>
	</div>
	{#if form?.errors}
		<InlineNotification kind="danger" aria-live="polite">
			<div>
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={`${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		</InlineNotification>
	{/if}
	<div>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold>Cadastrar</Button>
	</div>
</Card>

{#if form?.status === 201}
	<Notification kind="success">Contribuinte cadastrado com sucesso!</Notification>
{/if}
