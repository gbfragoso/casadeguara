<script lang="ts">
	import { resolve } from '$app/paths';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data?: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let type = $derived((form?.values?.tipo ?? 'entrada') as 'entrada' | 'saida');
	let values = $derived(form?.values ?? {});
	let errors = $derived(form?.errors ?? {});
	let contrapartes = $derived(data?.contrapartes ?? []);
	let counterpartId = $derived(values.contraparteId ?? '');
	let depositado = $derived(values.depositado === 'true');

	const formEnhancer = createFormEnhancer();
	const value = (field: string) => values[field] ?? '';
	const fieldErrors = (field: string) => errors[field] ?? [];
	const ariaInvalid = (field: string) => (fieldErrors(field).length ? 'true' : undefined);
	const changeType = (event: Event) => {
		type = (event.currentTarget as HTMLSelectElement).value as 'entrada' | 'saida';
		counterpartId = '';
		depositado = false;
	};
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/tesouraria')}>Tesouraria</a></li>
			<li><a href={resolve('/tesouraria/lancamentos')}>Lançamentos</a></li>
			<li class="is-active"><a href={resolve('/tesouraria/lancamentos/novo')} aria-current="page">Novo</a></li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Novo lançamento</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="tipo">Tipo</label>
			<div class="select is-fullwidth">
				<select class="select" id="tipo" name="tipo" value={type} onchange={changeType}>
					<option value="entrada">Entrada</option><option value="saida">Saída</option>
				</select>
			</div>
		</div>
		<div class="field">
			<label class="label" for="contraparteId">
				{#if type === 'entrada'}
					Doador (obrigatório)
				{:else}
					Favorecido (opcional)
				{/if}
			</label>
			<div class="select is-fullwidth">
				<select
					class="select"
					id="contraparteId"
					name="contraparteId"
					bind:value={counterpartId}
					required={type === 'entrada'}
					aria-invalid={ariaInvalid('contraparteId')}
					aria-describedby={fieldErrors('contraparteId').length ? 'contraparteId-errors' : undefined}>
					<option value="">{type === 'entrada' ? 'Selecione um contribuinte' : 'Nenhum'}</option>
					{#each contrapartes as contraparte (contraparte.id)}<option value={contraparte.id}
							>{contraparte.nome}</option
						>{/each}
				</select>
			</div>
			{#if fieldErrors('contraparteId').length}<p id="contraparteId-errors" class="help is-danger">
					{fieldErrors('contraparteId').join(' ')}
				</p>{/if}
		</div>
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<input
				class="input"
				id="descricao"
				name="descricao"
				maxlength="200"
				required
				placeholder="Discriminação do valor"
				value={value('descricao')}
				aria-invalid={ariaInvalid('descricao')}
				aria-describedby={fieldErrors('descricao').length ? 'descricao-errors' : undefined} />
			{#if fieldErrors('descricao').length}<p id="descricao-errors" class="help is-danger">
					{fieldErrors('descricao').join(' ')}
				</p>{/if}
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="valor">Valor</label><input
					class="input"
					id="valor"
					name="valor"
					inputmode="decimal"
					required
					value={value('valor')}
					aria-invalid={ariaInvalid('valor')}
					aria-describedby={fieldErrors('valor').length
						? 'valor-errors'
						: undefined} />{#if fieldErrors('valor').length}<p id="valor-errors" class="help is-danger">
						{fieldErrors('valor').join(' ')}
					</p>{/if}
			</div>
			<div class="field column">
				<label class="label" for="dataLancamento"
					>Data do {#if type === 'entrada'}
						recebimento
					{:else}
						pagamento
					{/if}</label
				><input
					class="input"
					type="date"
					id="dataLancamento"
					name="dataLancamento"
					required
					value={value('dataLancamento')}
					aria-invalid={ariaInvalid('dataLancamento')}
					aria-describedby={fieldErrors('dataLancamento').length
						? 'dataLancamento-errors'
						: undefined} />{#if fieldErrors('dataLancamento').length}<p
						id="dataLancamento-errors"
						class="help is-danger">
						{fieldErrors('dataLancamento').join(' ')}
					</p>{/if}
			</div>
		</div>
		{#if type === 'entrada'}
			<div class="field">
				<label class="checkbox" for="depositado"
					><input id="depositado" type="checkbox" name="depositado" value="true" bind:checked={depositado} /> Depósito
					confirmado</label>
			</div>
		{/if}
		{#if errors.form?.length}<p class="help is-danger" role="alert">{errors.form.join(' ')}</p>{/if}
		<button
			class={['button is-primary has-text-weight-semibold is-fullwidth', { 'is-loading': formEnhancer.loading }]}
			type="submit"
			aria-busy={formEnhancer.loading}>Cadastrar</button>
	</div>
</form>
