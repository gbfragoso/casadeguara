<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
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
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let errorMessages = $derived(form?.errors?.texto ?? []);
	let submittedText = $derived(form?.values?.texto ?? '');
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Avisos', href: resolve('biblioteca/avisos') },
	];
</script>

<PageHeader {breadcrumb}>Avisos</PageHeader>

<Card element="form" method="POST" {@attach formEnhancer.submitWithLoading}>
	<Field id="texto" label="Texto do aviso" errors={errorMessages}>
		{#snippet control({ describedBy, invalid })}
			<TextArea
				name="texto"
				id="texto"
				placeholder="Digite a mensagem"
				required
				maxlength={NOTICE_TEXT_MAX_LENGTH}
				class="min-h-32 resize-none"
				aria-invalid={invalid}
				aria-describedby={describedBy}
				bind:value={submittedText} />
		{/snippet}
	</Field>
	<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="mt-6 tablet:min-w-40">
		<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
	</Button>
</Card>

{#if form?.status === 201}
	<Notification kind="success">Aviso criado com sucesso!</Notification>
{/if}

<Card class="mt-6 overflow-hidden" padded={false}>
	<DataTable>
		{#snippet head()}
			<tr>
				<th>Texto</th>
				<th class="print:hidden">Ações</th>
			</tr>
		{/snippet}
		{#if data.avisos.length === 0}
			<tr><td colspan="2">Nenhum aviso cadastrado.</td></tr>
		{:else}
			{#each data.avisos as aviso (aviso.idaviso)}
				<tr>
					<td>{aviso.texto}</td>
					<td class="print:hidden">
						<IconAction
							icon="fa-regular fa-pen-to-square"
							aria-label={`Editar aviso ${aviso.idaviso}`}
							href={resolve('/(protected)/biblioteca/avisos/[id=integer]', {
								id: `${aviso.idaviso}`,
							})} />
					</td>
				</tr>
			{/each}
		{/if}
	</DataTable>
</Card>
