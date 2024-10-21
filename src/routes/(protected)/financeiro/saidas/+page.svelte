<script lang="ts">
	import { enhance } from '$app/forms';
	import { moeda } from '$lib/js/currency';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);

	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/saidas" aria-current="page">Saídas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Saídas</h1>
</div>

<form
	class="card"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input class="input" type="text" name="descricao" id="descricao" placeholder="Descrição da despesa" />
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial</label>
				<div class="control">
					<input class="input" type="date" name="dataInicio" id="dataInicio" aria-label="Date" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data Final</label>
				<div class="control">
					<input class="input" type="date" name="dataFim" id="dataFim" aria-label="Date" />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a class="button is-fullwidth has-text-weight-semibold is-warning" href="/financeiro/saidas/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.saidas}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Descrição</th>
							<th>Valor</th>
							<th>Data</th>
							<th>Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each form.saidas as saida}
							<tr>
								<td>{saida.descricao}</td>
								<td>{moeda(Number(saida.valor))}</td>
								<td>{dayjs.utc(saida.dataSaida).format('DD/MM/YYYY')}</td>
								<td>
									<a aria-label="editar" href="/financeiro/saidas/{saida.idsaida}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
