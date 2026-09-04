<script lang="ts">
	import { Line } from 'svelte-chartjs';

	import { buildMonthlyChart } from '$lib/charts/monthly-lancamentos';
	import type { MonthlyLancamentoTotal } from '$lib/tesouraria/monthly-totals';

	interface Props {
		totals: readonly MonthlyLancamentoTotal[];
	}

	let { totals }: Props = $props();

	const isZero = (value: string) => /^[-+]?0(?:\.0+)?$/.test(value);
	const hasMovement = $derived(totals.some(({ entradas, saidas }) => !isZero(entradas) || !isZero(saidas)));
	const chartConfig = $derived.by(() => (hasMovement ? buildMonthlyChart(totals) : null));

	const titleId = 'monthly-lancamentos-title';
	const descriptionId = 'monthly-lancamentos-description';
</script>

<div class="monthly-lancamentos" role="region" aria-labelledby={titleId} aria-describedby={descriptionId}>
	<h2 id={titleId}>Entradas e saídas — últimos 12 meses</h2>
	<p id={descriptionId}>Totais mensais de lançamentos ativos, em reais.</p>

	<div class="legend" aria-label="Legenda">
		<span class="legend-entry"><i aria-hidden="true"></i>Entradas</span>
		<span class="legend-exit"><i aria-hidden="true"></i>Saídas</span>
	</div>

	{#if hasMovement && chartConfig}
		<div class="chart-container">
			<Line data={chartConfig.data} options={chartConfig.options} aria-hidden="true" role="presentation" />
		</div>
	{:else}
		<p class="empty-state" role="status">Não há lançamentos ativos no período.</p>
	{/if}
</div>

<style>
	.monthly-lancamentos {
		box-sizing: border-box;
		width: 100%;
		padding: 1rem;
		background: #fff;
		color: #1f2937;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-block: 1rem;
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-weight: 600;
	}

	.legend i {
		display: inline-block;
		width: 1.5rem;
		border-top: 3px solid currentColor;
	}

	.legend-entry {
		color: #007a3d;
	}

	.legend-exit {
		color: #b42318;
	}

	.legend-exit i {
		border-top-style: dashed;
	}

	.chart-container {
		position: relative;
		width: 100%;
		height: clamp(220px, 55vw, 360px);
	}

	.empty-state {
		margin-block: 1rem;
		font-weight: 600;
	}
</style>
