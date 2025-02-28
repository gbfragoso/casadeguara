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
	const year = Number(new Date().getFullYear());

	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/historico" aria-current="page">Histórico</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Histórico de contribuições</h1>
</div>

<form
	class="card"
	action="?/pesquisar"
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
			<label class="label" for="contribuinte">Contribuinte</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="contribuinte"
					id="contribuinte"
					placeholder="Digite o nome do contribuinte" />
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="nome">Exercício</label>
				<div class="select is-fullwidth">
					<select name="exercicio" id="exercicio" value={year}>
						{#each { length: 10 }, index}
							<option value={year - index}>{year - index}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial</label>
				<div class="control">
					<input class="input" type="date" name="dataInicio" id="dataInicio" aria-label="Date" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data final</label>
				<div class="control">
					<input class="input" type="date" name="dataFim" id="dataFim" aria-label="Date" />
				</div>
			</div>
		</div>
		<div class="field is-grouped">
			<label class="checkbox">
				<input type="checkbox" name="trabalhadores" id="trabalhadores" />
				Somente trabalhadores
			</label>
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
		</div>
	</div>
</form>

{#if form?.resultados}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Contribuinte</th>
							<th>Valor Médio</th>
							<th class="has-text-centered">Última Contribuição</th>
							<th class="has-text-centered">Contribuições</th>
						</tr>
					</thead>
					<tbody>
						{#each form.resultados as resultado}
							<tr>
								<td>{resultado.contribuinte}</td>
								<td>{moeda(Number(resultado.valor))}</td>
								<td class="has-text-centered">{dayjs.utc(resultado.data).format('DD/MM/YYYY')}</td>
								<td class="has-text-centered">{resultado.contribuicoes}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot class="has-background-warning-light has-text-weight-bold">
						<tr>
							<th class="has-text-black">Total</th>
							<th class="has-text-black"
								>{moeda(
									form.resultados
										.map((a) => Number(a.valor))
										.reduce(function (a, b) {
											return a + b;
										}, 0),
								)}</th>
							<th></th>
							<th></th>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	</div>
{/if}
