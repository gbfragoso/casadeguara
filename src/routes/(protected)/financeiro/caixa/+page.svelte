<script lang="ts">
	import { enhance } from '$app/forms';
	import { moeda } from '$lib/js/currency';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';

	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let loading = $state(false);
	let { entradas } = $derived(data);

	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/caixa" aria-current="page">Caixa</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Caixa</h1>
</div>

<form
	class="card"
	style="display: block !important"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				{#await entradas then item}
					<thead>
						<tr>
							<th class="is-hidden-print"></th>
							<th>N° Recibo</th>
							<th>Contribuinte</th>
							<th>Valor</th>
							<th>Descrição</th>
							<th>Data</th>
						</tr>
					</thead>
					<tbody>
						{#each item as resultado}
							<tr>
								<td class="is-hidden-print">
									<input name="entradas" value={resultado.identrada} type="checkbox" checked />
								</td>
								<td>
									{resultado.identrada}
								</td>
								<td>
									{resultado.contribuinte}
								</td>
								<td>{moeda(Number(resultado.valor))}</td>
								<td>{resultado.descricao.toUpperCase()}</td>
								<td>{dayjs.utc(resultado.dataEntrada).format('DD/MM/YYYY')}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot class="has-background-warning-light has-text-weight-bold">
						<tr>
							<th class="is-hidden-print"></th>
							<th class="has-text-black">Total</th>
							<th></th>
							<th class="has-text-black"
								>{moeda(
									item
										.map((a) => Number(a.valor))
										.reduce(function (a, b) {
											return a + b;
										}, 0),
								)}</th>
							<th></th>
							<th></th>
						</tr>
					</tfoot>
				{/await}
			</table>
		</div>
		<div class="is-hidden-print" style="min-width: 200px">
			<button
				aria-busy={loading}
				class:is-loading={loading}
				class="button is-success is-fullwidth has-text-weight-semibold"
				type="submit">
				<i class="fa-solid fa-check fa-fw">&nbsp;</i>Confirmar depósito
			</button>
		</div>
	</div>
</form>
