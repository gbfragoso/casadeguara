<script lang="ts">
	import { moeda } from '$lib/js/currency';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';

	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();

	let { entradas, saidas, entradaMesAtual, saidaMesAtual } = $derived(data);
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
		Balanço do mês {dayjs.utc(new Date()).format('MM/YYYY')}
	</h1>
</div>
<div class="mt-2 columns">
	{#await entradaMesAtual then entrada}
		{#await saidaMesAtual then saida}
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-hand-holding-dollar fa-fw">&nbsp;</i>Valor recebido
					<h2 class="is-size-3 has-text-primary">
						{moeda(Number(entrada[0].value))}
					</h2>
				</div>
			</div>
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-money-bill-transfer fa-fw">&nbsp;</i>Despesas
					<h2 class="is-size-3 has-text-danger">
						{moeda(Number(saida[0].value))}
					</h2>
				</div>
			</div>
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-sack-dollar fa-fw">&nbsp;</i>Saldo
					{#if Number(entrada[0].value) - Number(saida[0].value) >= 1}
						<h2 class="is-size-3 has-text-success">
							{moeda(Number(entrada[0].value) - Number(saida[0].value))}
						</h2>
					{:else}
						<h2 class="is-size-3 has-text-danger">
							{moeda(Number(entrada[0].value) - Number(saida[0].value))}
						</h2>
					{/if}
				</div>
			</div>
		{/await}
	{/await}
</div>

<div class="card">
	<div class="card-content">
		<p class="is-size-4 mb-4 has-text-weight-semibold">Últimas contribuições</p>
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Contribuinte</th>
						<th>Descrição</th>
						<th>Valor</th>
						<th>Data</th>
					</tr>
				</thead>
				<tbody>
					{#await entradas}
						<tr>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
						</tr>
					{:then item}
						{#each item as entrada}
							<tr>
								<td>{entrada.contribuinte}</td>
								<td>{entrada.descricao}</td>
								<td>{moeda(Number(entrada.valor))}</td>
								<td>{dayjs.utc(entrada.data).format('DD/MM/YYYY')}</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>

<div class="card">
	<div class="card-content">
		<p class="is-size-4 mb-4 has-text-weight-semibold">Últimos pagamentos</p>
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th scope="col">Descrição</th>
						<th scope="col">Valor</th>
						<th scope="col">Data</th>
					</tr>
				</thead>
				<tbody>
					{#await saidas}
						<tr>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
						</tr>
					{:then item}
						{#each item as saida}
							<tr>
								<td>{saida.descricao}</td>
								<td>{moeda(Number(saida.valor))}</td>
								<td>{dayjs.utc(saida.dataSaida).format('DD/MM/YYYY')}</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
