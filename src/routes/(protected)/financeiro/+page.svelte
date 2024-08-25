<script lang="ts">
	import { moeda } from "$lib/js/currency";
	import dayjs from "dayjs";
	import utc from "dayjs/plugin/utc";

	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ entradas, saidas, entradaMesAtual, saidaMesAtual } = data);
	$: saldoMesAtual = Number(entradaMesAtual) - Number(saidaMesAtual);
	dayjs.extend(utc);
</script>

<div>
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro" aria-current="page">Página Inicial</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">
		Balanço do mês {dayjs.utc(new Date()).format("MM/YYYY")}
	</h1>
</div>
<div class="mt-2 columns">
	<div class="column">
		<div class="box has-text-weight-semibold">
			<i class="fa-solid fa-hand-holding-dollar fa-fw">&nbsp;</i>Valor
			recebido
			<h2 class="is-size-3 has-text-primary">
				{moeda(Number(entradaMesAtual))}
			</h2>
		</div>
	</div>
	<div class="column">
		<div class="box has-text-weight-semibold">
			<i class="fa-solid fa-money-bill-transfer fa-fw">&nbsp;</i>Despesas
			<h2 class="is-size-3 has-text-danger">
				{moeda(Number(saidaMesAtual))}
			</h2>
		</div>
	</div>
	<div class="column">
		<div class="box has-text-weight-semibold">
			<i class="fa-solid fa-sack-dollar fa-fw">&nbsp;</i>Saldo
			{#if saldoMesAtual >= 1}
				<h2 class="is-size-3 has-text-success">
					{moeda(saldoMesAtual)}
				</h2>
			{:else}
				<h2 class="is-size-3 has-text-danger">
					{moeda(saldoMesAtual)}
				</h2>
			{/if}
		</div>
	</div>
</div>
<div class="card">
	<div class="card-content">
		<p class="is-size-4 mb-4 has-text-weight-semibold">
			Últimas contribuições
		</p>
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th scope="col">Contribuinte</th>
					<th scope="col">Descrição</th>
					<th scope="col">Valor</th>
					<th scope="col">Data</th>
				</thead>
				<tbody>
					{#each entradas as entrada}
						<tr>
							<td>{entrada.contribuinte}</td>
							<td>{entrada.descricao}</td>
							<td>{moeda(Number(entrada.valor))}</td>
							<td
								>{dayjs
									.utc(entrada.data)
									.format("DD/MM/YYYY")}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<div class="card">
	<div class="card-content">
		<p class="is-size-4 mb-4 has-text-weight-semibold">
			Últimos pagamentos
		</p>
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th scope="col">Descrição</th>
					<th scope="col">Valor</th>
					<th scope="col">Data</th>
				</thead>
				<tbody>
					{#each saidas as saida}
						<tr>
							<td>{saida.descricao}</td>
							<td>{moeda(Number(saida.valor))}</td>
							<td
								>{dayjs
									.utc(saida.data_saida)
									.format("DD/MM/YYYY")}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
