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
				<a href="/financeiro/estornos" aria-current="page">Estornos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de estornos</h1>
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
				<label class="label" for="dataFim">Registrado em</label>
				<div class="control">
					<input class="input" type="date" name="dataRegistro" id="dataRegistro" aria-label="Date" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial do recebimento</label>
				<div class="control">
					<input class="input" type="date" name="dataInicio" id="dataInicio" aria-label="Date" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data final do recebimento</label>
				<div class="control">
					<input class="input" type="date" name="dataFim" id="dataFim" aria-label="Date" />
				</div>
			</div>
		</div>
		<div class="columns" style="margin-top: -1.5rem">
			<div class="field column">
				<label class="label" for="trabalhadores">Tipo de contribuinte</label>
				<label class="checkbox">
					<input type="checkbox" name="trabalhadores" id="trabalhadores" />
					Somente trabalhadores
				</label>
			</div>
			<div class="column"></div>
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
							<th>N° Recibo</th>
							<th>Contribuinte</th>
							<th>Valor</th>
							<th>Motivo</th>
							<th>Data</th>
						</tr>
					</thead>
					<tbody>
						{#each form.resultados as resultado}
							<tr>
								<td>{resultado.identrada}</td>
								<td>{resultado.contribuinte}</td>
								<td>{moeda(Number(resultado.valor))}</td>
								<td>{resultado.motivoEstorno?.toUpperCase()}</td>
								<td>{dayjs.utc(resultado.dataEstorno).format('DD/MM/YYYY')}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
