<script lang="ts">
	import Chart from 'chart.js/auto';
	import type { Action } from 'svelte/action';

	const options = {
		animation: false,
		plugins: {
			legend: {
				display: true,
			},
			tooltip: {
				enabled: true,
			},
		},
		responsive: true,
		maintainAspectRatio: false,
	};

	let data = $state({
		labels: ['Aurora', 'Goldon', 'Thornton', 'Colorado Springs'],
		datasets: [
			{
				label: 'Frequência por mês',
				backgroundColor: ['#3e95cd'],
				data: [42, 32, 23, 52],
				tension: 0.32,
				borderWidth: 3,
			},
		],
	});

	interface Props {
		dataset: { data: number; label: string }[];
	}

	let { dataset }: Props = $props();
	data.labels = dataset.map((x) => x.label.substring(0, 7));
	data.datasets[0].data = dataset.map((x) => x.data);

	let config = $derived({
		type: 'line',
		data,
		options,
	});

	const handleChart: Action<HTMLCanvasElement, any> = (element, config) => {
		let theChart = new Chart(element, config);

		return {
			update(config) {
				theChart.destroy();
				theChart = new Chart(element, config);
			},
			destroy() {
				theChart.destroy();
			},
		};
	};
</script>

<canvas use:handleChart={config}></canvas>
