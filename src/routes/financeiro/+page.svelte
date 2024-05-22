<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import { moeda } from '$lib/js/currency';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from 'chart.js';

	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ entradasData, saidasData } = data);
	$: entradaMesAtual = entradasData.length - 1 >= 0 ? entradasData[entradasData.length - 1] : 0;
	$: saidaMesAtual = saidasData.length - 1 >= 0 ? saidasData[saidasData.length - 1] : 0;
	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);
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
		{#await saidasData}
			Carregando gráfico
		{:then}
			<Line
				data={{
					labels: [],
					datasets: [
						{
							label: 'Doações',
							fill: true,
							borderColor: 'rgb(205, 130, 158)',
							pointBorderColor: 'rgb(205, 130,1 58)',
							pointBackgroundColor: 'rgb(255, 255, 255)',
							pointBorderWidth: 10,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: 'rgb(0, 0, 0)',
							pointHoverBorderColor: 'rgba(220, 220, 220,1)',
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: []
						},
						{
							label: 'Despesas',
							fill: true,
							borderColor: 'rgb(205, 130, 158)',
							pointBorderColor: 'rgb(205, 130,1 58)',
							pointBackgroundColor: 'rgb(255, 255, 255)',
							pointBorderWidth: 10,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: 'rgb(0, 0, 0)',
							pointHoverBorderColor: 'rgba(220, 220, 220,1)',
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: []
						}
					]
				}}
				options={{ responsive: true, animation: false }}
			/>
		{/await}
	</div>
</div>
