<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		CategoryScale,
		Chart as ChartJS,
		LineElement,
		LinearScale,
		PointElement,
		Tooltip,
		type Chart as ChartInstance,
		type ChartData,
		type ChartOptions,
	} from 'chart.js';

	ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

	const labels = [
		'10/2025',
		'11/2025',
		'12/2025',
		'01/2026',
		'02/2026',
		'03/2026',
		'04/2026',
		'05/2026',
		'06/2026',
		'07/2026',
		'08/2026',
		'09/2026',
	];
	const data = $state.raw<ChartData<'line'>>({
		labels,
		datasets: [
			{
				label: 'Entradas',
				data: [120, 250, 0, 420, 610, 300, 520, 480, 760, 640, 800, 920],
				borderColor: '#007a3d',
				backgroundColor: '#007a3d',
				pointStyle: 'circle',
				pointRadius: 4,
				borderWidth: 3,
			},
			{
				label: 'Saídas',
				data: [80, 160, 0, 220, 340, 280, 400, 360, 510, 430, 600, 580],
				borderColor: '#b42318',
				backgroundColor: '#b42318',
				borderDash: [6, 4],
				pointStyle: 'rectRot',
				pointRadius: 4,
				borderWidth: 3,
			},
		],
	});

	let selectedIndex = $state<number | null>(null);
	let chart = $state<ChartInstance<'line'> | null>(null);
	const selection = $derived(
		selectedIndex === null ? 'Nenhuma competência selecionada' : `Competência ${labels[selectedIndex]}`,
	);

	const options = $state.raw<ChartOptions<'line'>>({
		responsive: true,
		maintainAspectRatio: false,
		animation: false,
		interaction: { mode: 'index', axis: 'x', intersect: false },
		onClick: (_event, elements) => {
			const [element] = elements;
			if (element) selectedIndex = element.index;
		},
		scales: {
			x: { ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 } },
			y: { beginAtZero: true },
		},
	});
</script>

<section aria-labelledby="proof-title" aria-describedby="proof-description">
	<h1 id="proof-title">Evolução financeira</h1>
	<p id="proof-description">Prova de compatibilidade do gráfico de linhas com duas séries mensais.</p>
	<div class="legend" aria-label="Legenda">
		<span class="entry"><i aria-hidden="true"></i>Entradas</span>
		<span class="exit"><i aria-hidden="true"></i>Saídas</span>
	</div>
	<div class="chart-container">
		<Line bind:chart {data} {options} aria-label="Gráfico de entradas e saídas" role="img" />
	</div>
	<p id="proof-selection" aria-live="polite">{selection}</p>
</section>

<style>
	section {
		box-sizing: border-box;
		width: 100%;
		max-width: 720px;
		padding: 16px;
		font-family: sans-serif;
	}

	.chart-container {
		position: relative;
		width: 100%;
		height: 240px;
	}

	.legend {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.legend i {
		display: inline-block;
		width: 22px;
		border-top: 3px solid currentColor;
	}

	.entry {
		color: #007a3d;
	}

	.exit {
		color: #b42318;
	}

	.exit i {
		border-top-style: dashed;
	}
</style>
