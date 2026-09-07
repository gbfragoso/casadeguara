<script lang="ts">
	import { resolve } from '$app/paths';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import { moeda } from '$lib/utils/currency';
	import { formatCivilDate } from '$lib/utils/date';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data?: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let selectedType = $derived((form?.values?.tipo ?? data?.values?.tipo ?? 'todos') as 'todos' | 'entrada' | 'saida');
	let values = $derived(form?.values ?? data?.values ?? {});
	let page = $derived(form?.page ?? data?.page);
	let errors = $derived(form?.errors ?? {});
	let hasEntryFilters = $derived(selectedType === 'entrada');

	const formEnhancer = createFormEnhancer();
	const fieldValue = (field: string) => values[field] ?? '';
	const fieldErrors = (field: string) => errors[field] ?? [];
	const describeField = (field: string) => `${field}-errors`;
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/tesouraria')}>Tesouraria</a></li>
			<li class="is-active"><a href={resolve('/tesouraria/lancamentos')} aria-current="page">Lançamentos</a></li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Lançamentos</h1>
</div>

<form class="card" action="?/pesquisar" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="columns">
			<div class="field column">
				<label class="label" for="contraparte">Contraparte</label>
				<input
					class="input"
					id="contraparte"
					name="contraparte"
					maxlength="200"
					value={fieldValue('contraparte')}
					aria-invalid={fieldErrors('contraparte').length > 0}
					aria-describedby={fieldErrors('contraparte').length ? describeField('contraparte') : undefined} />
				{#if fieldErrors('contraparte').length}
					<p id="contraparte-errors" class="help is-danger">{fieldErrors('contraparte').join(' ')}</p>
				{/if}
			</div>
			<div class="field column">
				<label class="label" for="descricao">Descrição</label>
				<input
					class="input"
					id="descricao"
					name="descricao"
					maxlength="200"
					value={fieldValue('descricao')}
					aria-invalid={fieldErrors('descricao').length > 0}
					aria-describedby={fieldErrors('descricao').length ? describeField('descricao') : undefined} />
				{#if fieldErrors('descricao').length}
					<p id="descricao-errors" class="help is-danger">{fieldErrors('descricao').join(' ')}</p>
				{/if}
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="dataRegistro">Registrado em</label><input
					class="input"
					type="date"
					id="dataRegistro"
					name="dataRegistro"
					value={fieldValue('dataRegistro')} />
			</div>
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial</label><input
					class="input"
					type="date"
					id="dataInicio"
					name="dataInicio"
					value={fieldValue('dataInicio')} />
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data final</label><input
					class="input"
					type="date"
					id="dataFim"
					name="dataFim"
					value={fieldValue('dataFim')} />
			</div>
		</div>

		<div class="columns">
			<div class="field column">
				<label class="label" for="tipo">Tipo de lançamento</label>
				<div class="select is-fullwidth">
					<select id="tipo" name="tipo" bind:value={selectedType}>
						<option value="todos">Todos</option>
						<option value="entrada">Entrada</option>
						<option value="saida">Despesa</option>
					</select>
				</div>
			</div>
			{#if hasEntryFilters}
				<div class="control column">
					<label class="label" for="depositado">Depósito confirmado?</label>
					<label class="radio"
						><input type="radio" name="depositado" checked={fieldValue('depositado') === ''} value="" /> Todos</label>
					<label class="radio"
						><input
							type="radio"
							name="depositado"
							checked={fieldValue('depositado') === 'true'}
							value="true" /> Sim</label>
					<label class="radio"
						><input
							type="radio"
							name="depositado"
							checked={fieldValue('depositado') === 'false'}
							value="false" /> Não</label>
				</div>
				<div class="field column">
					<label class="label" for="trabalhadores">Tipo de contribuinte</label>
					<label class="checkbox">
						<input
							type="checkbox"
							name="trabalhadores"
							id="trabalhadores"
							value="true"
							checked={fieldValue('trabalhadores') === 'true'} /> Somente trabalhadores</label>
				</div>
			{/if}
		</div>

		<div class="columns">
			<div class="column is-3">
				<button
					class={[
						'button is-primary has-text-weight-semibold is-fullwidth',
						{ 'is-loading': formEnhancer.loading },
					]}
					type="submit"
					aria-busy={formEnhancer.loading}
					><i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar</button>
			</div>
			<div class="column is-3">
				<a
					class="button is-warning has-text-weight-semibold is-fullwidth"
					href={resolve('/tesouraria/lancamentos/novo')}
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo lançamento</a>
			</div>
		</div>
	</div>
</form>

{#if form?.message}<p class="notification is-info" role="status">{form.message}</p>{/if}
{#if page}
	<div class="columns">
		<div class="column"><strong>Total de entradas:</strong> {moeda(Number(page.totais.entradas))}</div>
		<div class="column"><strong>Total de saídas:</strong> {moeda(Number(page.totais.saidas))}</div>
	</div>
	<div class="card">
		<div class="card-content">
			{#if page.items.length === 0}
				<p role="status">Nenhum lançamento encontrado.</p>
			{:else}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<caption class="is-sr-only">Lançamentos ativos</caption>
						<thead>
							<tr>
								<th>ID</th>
								<th>Contraparte</th>
								<th>Descrição</th>
								<th>Tipo</th>
								<th>Valor</th>
								<th>Data</th>
								<th class="table-actions">Ações</th>
							</tr>
						</thead>
						<tbody>
							{#each page.items as item (item.id)}
								<tr>
									<td>{item.id}</td>
									<td>{item.contraparte?.nome ?? '—'}</td>
									<td>{item.descricao}</td>
									<td
										>{#if item.tipo === 'entrada'}
											<span class="tag is-success">Entrada</span>
										{:else}
											<span class="tag is-danger">Despesa</span>
										{/if}
									</td>
									<td>{moeda(Number(item.valor))}</td>
									<td>{formatCivilDate(item.dataLancamento)}</td>
									<td class="table-actions">
										{#if item.tipo === 'entrada' && item.reciboUuid}<a
												title="Recibo"
												href={resolve('/recibo/[uuid=uuid]', { uuid: item.reciboUuid })}
												target="_blank"
												aria-label="Recibo"><i class="fa-regular fa-file-lines fa-fw"></i></a
											>{/if}
										<a
											class="ml-3"
											title="Estorno"
											aria-label="Estornar"
											href={resolve('/(protected)/tesouraria/lancamentos/[id=integer]/estorno', {
												id: `${item.id}`,
											})}><i class="fa-regular fa-trash-can fa-fw"></i></a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
{/if}
