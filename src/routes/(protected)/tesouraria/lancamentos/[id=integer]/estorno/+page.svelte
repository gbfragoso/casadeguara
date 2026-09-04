<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { moeda } from '$lib/utils/currency';
	import { formatCivilDate } from '$lib/utils/date';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data?: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let reason = $derived(form?.values?.motivo ?? '');
	let errors = $derived(form?.errors ?? {});
	let lancamento = $derived(data?.lancamento);
	const reasonErrors = $derived(errors.motivo ?? []);
	const focusError = (node: HTMLElement) => {
		queueMicrotask(() => node.focus());
	};
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/tesouraria')}>Tesouraria</a></li>
			<li><a href={resolve('/tesouraria/lancamentos')}>Lançamentos</a></li>
			<li class="is-active"><a href={resolve('/tesouraria/lancamentos')} aria-current="page">Estorno</a></li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Confirmar estorno</h1>
</div>

{#if lancamento}
	<div class="card">
		<div class="card-content">
			<p class="mb-3"><strong>Tipo:</strong> {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}</p>
			<p class="mb-3"><strong>Contraparte:</strong> {lancamento.contraparte?.nome ?? '—'}</p>
			<p class="mb-3"><strong>Descrição:</strong> {lancamento.descricao}</p>
			<p class="mb-3"><strong>Valor:</strong> {moeda(Number(lancamento.valor))}</p>
			<p class="mb-3"><strong>Data:</strong> {formatCivilDate(lancamento.dataLancamento)}</p>
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						try {
							await update();
						} finally {
							loading = false;
						}
					};
				}}>
				<label class="label" for="motivo">Motivo do estorno</label>
				<textarea
					class="textarea"
					id="motivo"
					name="motivo"
					maxlength="200"
					required
					bind:value={reason}
					aria-invalid={reasonErrors.length > 0}
					aria-describedby={reasonErrors.length ? 'motivo-errors' : undefined}
					aria-errormessage={reasonErrors.length ? 'motivo-errors' : undefined}>
				</textarea>
				{#if reasonErrors.length}
					<p id="motivo-errors" class="help is-danger" role="alert" tabindex="-1" use:focusError>
						{reasonErrors.join(' ')}
					</p>
				{/if}
				{#if form?.message}
					{#if form?.status === 200}
						<p class="help is-success" role="alert">
							{form.message}
						</p>
					{:else}
						<p class="help is-danger" role="alert">
							{form.message}
						</p>
					{/if}
				{/if}
				<button class="button is-danger mt-3" type="submit" aria-busy={loading}>Confirmar estorno</button>
			</form>
		</div>
	</div>
{:else}
	<p class="notification is-danger" role="alert">Lançamento não encontrado.</p>
{/if}
