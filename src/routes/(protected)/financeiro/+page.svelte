<script lang="ts">
	import { moeda } from '$lib/js/currency';

	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: entradaMesAtual = 0//entradasData.length - 1 >= 0 ? entradasData[entradasData.length - 1] : 0;
	$: saidaMesAtual = 0;//saidasData.length - 1 >= 0 ? saidasData[saidasData.length - 1] : 0;
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Dashboard</h2>
	<p>Visão geral da movimentação financeira</p>
</hgroup>

<div class="grid">
	<div>
		<div class="card">
			<i class="fa-solid fa-hand-holding-dollar">&nbsp;</i>Valor recebido
			<h2 class="pico-color-jade-500">{moeda(entradaMesAtual)}</h2>
		</div>
		<div class="card">
			<i class="fa-solid fa-money-bill-transfer">&nbsp;</i>Despesas
			<h2 class="pico-color-red-500">{moeda(saidaMesAtual)}</h2>
		</div>
		<div class="card">
			<i class="fa-solid fa-sack-dollar">&nbsp;</i>Saldo
			<h2 class="pico-color-azure-500">{moeda(entradaMesAtual - saidaMesAtual)}</h2>
		</div>
	</div>
	<div class="card">
		<h2>Doações e despesas</h2>
	</div>
</div>
