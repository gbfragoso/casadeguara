<script lang="ts">
	import { moeda } from '$lib/js/currency';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';

	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();

	let { entradaMesAtual, saidaMesAtual } = $derived(data);
	dayjs.extend(utc);
</script>

<div>
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/tesouraria">Tesouraria</a></li>
			<li class="is-active">
				<a href="/tesouraria" aria-current="page">Página Inicial</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">
		Balanço do mês {dayjs.utc(new Date()).format('MM/YYYY')}
	</h1>
</div>
<div class="mt-2 columns">
	{#await entradaMesAtual}
		<div class="column">
			<div class="box has-text-weight-semibold">
				<i class="fa-solid fa-calculator fa-fw">&nbsp;</i>Doações
				<div class="skeleton-lines">
					<div></div>
				</div>
			</div>
		</div>
		<div class="column">
			<div class="box has-text-weight-semibold">
				<i class="fa-solid fa-wave-square fa-fw">&nbsp;</i>Valor médio
				<div class="skeleton-lines">
					<div></div>
				</div>
			</div>
		</div>
		<div class="column">
			<div class="box has-text-weight-semibold">
				<i class="fa-solid fa-hand-holding-dollar fa-fw">&nbsp;</i>Valor recebido
				<div class="skeleton-lines">
					<div></div>
				</div>
			</div>
		</div>
		<div class="column">
			<div class="box has-text-weight-semibold">
				<i class="fa-solid fa-money-bill-transfer fa-fw">&nbsp;</i>Despesas
				<div class="skeleton-lines">
					<div></div>
				</div>
			</div>
		</div>
		<div class="column">
			<div class="box has-text-weight-semibold">
				<i class="fa-solid fa-sack-dollar fa-fw">&nbsp;</i>Saldo
				<div class="skeleton-lines">
					<div></div>
				</div>
			</div>
		</div>
	{:then entrada}
		{#await saidaMesAtual then saida}
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-calculator fa-fw">&nbsp;</i>Total de doações
					<h2 class="is-size-3">
						{entrada[0].count}
					</h2>
				</div>
			</div>
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-wave-square fa-fw">&nbsp;</i>Valor médio
					<h2 class="is-size-3">
						{moeda(Number(entrada[0].median))}
					</h2>
				</div>
			</div>
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
