<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import type { Chart as ChartInstance } from 'chart.js';

	import { buildMonthlyChart, formatMonthlyDetail } from '$lib/charts/monthly-lancamentos';
	import type { MonthlyLancamentoTotal } from '$lib/tesouraria/monthly-totals';
	import { formatBrlDecimal, formatMonthLabel } from '$lib/utils/currency';

	interface Props {
		totals: readonly MonthlyLancamentoTotal[];
	}

	let { totals }: Props = $props();
	let selectedIndex = $state(-1);
	let chart = $state<ChartInstance<'line'> | null>(null);

	const isZero = (value: string) => /^[-+]?0(?:\.0+)?$/.test(value);
	const hasMovement = $derived(totals.some(({ entradas, saidas }) => !isZero(entradas) || !isZero(saidas)));
	const selectedTotal = $derived(totals[selectedIndex]);
	const chartConfig = $derived.by(() =>
		hasMovement ? buildMonthlyChart(totals, (index) => (selectedIndex = index)) : null,
	);
	const detail = $derived(formatMonthlyDetail(selectedTotal));

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
			<Line
				bind:chart
				data={chartConfig.data}
				options={chartConfig.options}
				aria-hidden="true"
				role="presentation" />
		</div>
	{:else}
		<p class="empty-state" role="status">Não há lançamentos ativos no período.</p>
	{/if}

	<p class="selection" aria-live="polite">{detail}</p>

	<details>
		<summary>Consultar tabela dos últimos 12 meses</summary>
		<div class="table-container">
			<table>
				<caption>Entradas e saídas por competência</caption>
				<thead>
					<tr>
						<th scope="col">Competência</th>
						<th scope="col">Entradas</th>
						<th scope="col">Saídas</th>
					</tr>
				</thead>
				<tbody>
					{#each totals as total (total.competencia)}
						<tr>
							<th scope="row">{formatMonthLabel(total.competencia)}</th>
							<td>{formatBrlDecimal(total.entradas)}</td>
							<td>{formatBrlDecimal(total.saidas)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
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

	.selection,
	.empty-state {
		margin-block: 1rem;
	}

	.empty-state {
		font-weight: 600;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.5rem;
		border-bottom: 1px solid #d1d5db;
		text-align: start;
	}

	caption {
		padding: 0.5rem;
		font-weight: 600;
		text-align: start;
	}
</style>
