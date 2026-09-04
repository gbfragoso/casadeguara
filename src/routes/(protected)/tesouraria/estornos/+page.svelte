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
	let values = $derived(form?.values ?? data?.values ?? {});
	let page = $derived(form?.page ?? data?.page);

	const formEnhancer = createFormEnhancer();
	const value = (field: string) => values[field] ?? '';
	const fieldErrors = (field: string) => form?.errors?.[field] ?? [];
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/tesouraria')}>Tesouraria</a></li>
			<li class="is-active"><a href={resolve('/tesouraria/estornos')} aria-current="page">Estornos</a></li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Auditoria de estornos</h1>
</div>

<form class="card" action="?/pesquisar" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="columns">
			<div class="field column">
				<label class="label" for="tipo">Tipo de lançamento</label>
				<div class="select is-fullwidth">
					<select id="tipo" name="tipo" value={value('tipo')}
						><option value="todos">Todos</option><option value="entrada">Entrada</option><option
							value="saida">Saída</option
						></select>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="contraparte">Contraparte</label>
				<input
					class="input"
					id="contraparte"
					name="contraparte"
					maxlength="200"
					value={value('contraparte')}
					aria-invalid={fieldErrors('contraparte').length > 0} />
			</div>
			<div class="field column">
				<label class="label" for="descricao">Descrição</label><input
					class="input"
					id="descricao"
					name="descricao"
					maxlength="200"
					value={value('descricao')}
					aria-invalid={fieldErrors('descricao').length > 0} />
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="lancamentoInicio">Lançamento desde</label><input
					class="input"
					type="date"
					id="lancamentoInicio"
					name="lancamentoInicio"
					value={value('lancamentoInicio')} />
			</div>
			<div class="field column">
				<label class="label" for="lancamentoFim">Lançamento até</label><input
					class="input"
					type="date"
					id="lancamentoFim"
					name="lancamentoFim"
					value={value('lancamentoFim')} />
			</div>
			<div class="field column">
				<label class="label" for="estornoInicio">Estorno desde</label><input
					class="input"
					type="date"
					id="estornoInicio"
					name="estornoInicio"
					value={value('estornoInicio')} />
			</div>
			<div class="field column">
				<label class="label" for="estornoFim">Estorno até</label><input
					class="input"
					type="date"
					id="estornoFim"
					name="estornoFim"
					value={value('estornoFim')} />
			</div>
		</div>
		{#if fieldErrors('lancamentoFim').length || fieldErrors('estornoFim').length}<p
				class="help is-danger"
				role="alert">
				{[...fieldErrors('lancamentoFim'), ...fieldErrors('estornoFim')].join(' ')}
			</p>{/if}
		<button
			class={['button is-primary has-text-weight-semibold is-fullwidth', { 'is-loading': formEnhancer.loading }]}
			type="submit"
			aria-busy={formEnhancer.loading}><i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar</button>
	</div>
</form>

{#if page}
	{#if page.items.length === 0}
		<div class="card">
			<div class="card-content">
				<p role="status">Nenhum estorno encontrado.</p>
			</div>
		</div>
	{:else}
		<div class="card">
			<div class="card-content">
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<caption class="is-sr-only">Estornos registrados</caption>
						<thead>
							<tr>
								<th>Tipo</th>
								<th>Contraparte</th>
								<th>Descrição</th>
								<th>Valor</th>
								<th>Motivo</th>
								<th>Usuário</th>
								<th>Data do lançamento</th>
								<th>Data do estorno</th>
							</tr>
						</thead>
						<tbody>
							{#each page.items as item (item.id)}
								<tr>
									<td>{item.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
									<td>{item.contraparte?.nome ?? '—'}</td>
									<td>{item.descricao}</td><td>{moeda(Number(item.valor))}</td>
									<td>{item.motivo}</td>
									<td>{item.usuario}</td>
									<td>{formatCivilDate(item.dataLancamento)}</td>
									<td>{formatCivilDate(item.dataEstorno)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
{/if}
