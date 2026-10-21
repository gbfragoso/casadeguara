<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextArea from '#lib/components/forms/TextArea.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { moeda } from '#lib/utils/currency.js';
	import { formatCivilDate } from '#lib/utils/date.js';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data?: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let reason = $derived(form?.values?.motivo ?? '');
	let errors = $derived(form?.errors ?? {});
	let lancamento = $derived(data?.lancamento);
	const reasonErrors = $derived(errors.motivo ?? []);
	const focusError = (node: HTMLElement) => node.focus();
	const breadcrumb = [
		{ label: 'Tesouraria', href: resolve('tesouraria') },
		{ label: 'Lançamentos', href: resolve('tesouraria/lancamentos') },
		{ label: 'Estorno', href: resolve('tesouraria/lancamentos') },
	];
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-wallet">Confirmar estorno</PageHeader>

{#if lancamento}
	<Card class="flex flex-col gap-3">
		<p><strong>Tipo:</strong> {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}</p>
		<p><strong>Contraparte:</strong> {lancamento.contraparte?.nome ?? '—'}</p>
		<p><strong>Descrição:</strong> {lancamento.descricao}</p>
		<p><strong>Valor:</strong> {moeda(Number(lancamento.valor))}</p>
		<p><strong>Data:</strong> {formatCivilDate(lancamento.dataLancamento)}</p>
		<form method="POST" class="mt-3 flex flex-col gap-4" {@attach formEnhancer.submitWithLoading}>
			<Field id="motivo" label="Motivo do estorno">
				{#snippet control()}
					<TextArea
						id="motivo"
						name="motivo"
						maxlength={200}
						required
						bind:value={reason}
						aria-invalid={reasonErrors.length > 0}
						aria-describedby={reasonErrors.length ? 'motivo-errors' : undefined}
						aria-errormessage={reasonErrors.length ? 'motivo-errors' : undefined} />
					{#if reasonErrors.length}
						<ErrorMessage id="motivo-errors" role="alert" tabindex={-1} {@attach focusError}
							>{reasonErrors.join(' ')}</ErrorMessage>
					{/if}
				{/snippet}
			</Field>
			{#if form?.message}
				<p class={['text-sm', form?.status === 200 ? 'text-success-ink' : 'text-danger-ink']} role="alert">
					{form.message}
				</p>
			{/if}
			<div>
				<Button type="submit" tone="danger" loading={formEnhancer.loading} class="font-bold"
					>Confirmar estorno</Button>
			</div>
		</form>
	</Card>
{:else}
	<InlineNotification kind="danger" element="p" role="alert">Lançamento não encontrado.</InlineNotification>
{/if}
