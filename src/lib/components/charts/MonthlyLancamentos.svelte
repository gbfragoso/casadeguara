<script lang="ts">
	import { Line } from 'svelte-chartjs';

	import { readChartPalette } from '#lib/charts/chart-palette.js';
	import { buildMonthlyChart } from '#lib/charts/monthly-lancamentos.js';
	import Card from '#lib/components/layout/Card.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import type { MonthlyLancamentoTotal } from '#lib/tesouraria/monthly-totals.js';
	import { trackThemeChange } from '#lib/theme/theme-change.js';

	interface Props {
		totals: readonly MonthlyLancamentoTotal[];
	}

	let { totals }: Props = $props();
	let chartArea = $state<HTMLElement>();

	const isZero = (value: string) => /^[-+]?0(?:\.0+)?$/.test(value);
	const hasMovement = $derived(totals.some(({ entradas, saidas }) => !isZero(entradas) || !isZero(saidas)));
	const palette = $derived.by(() => {
		trackThemeChange();
		return chartArea && readChartPalette(chartArea);
	});
	const chartConfig = $derived(hasMovement && palette ? buildMonthlyChart(totals, palette) : null);

	const titleId = 'monthly-lancamentos-title';
	const descriptionId = 'monthly-lancamentos-description';
</script>

<Card>
	<div class="w-full" role="region" aria-labelledby={titleId} aria-describedby={descriptionId}>
		<div class="flex flex-col gap-1">
			<SectionHeading id={titleId}>Entradas e saídas — últimos 12 meses</SectionHeading>
			<p id={descriptionId} class="text-ink-muted">Totais mensais de lançamentos ativos, em reais.</p>
		</div>

		<div class="mt-5">
			<div class="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Legenda" data-testid="legenda-grafico">
				<span class="inline-flex items-center gap-2 font-medium text-ink">
					<i aria-hidden="true" class="inline-block w-6 border-t-2 border-chart-entry"></i>Entradas
				</span>
				<span class="inline-flex items-center gap-2 font-medium text-ink">
					<i aria-hidden="true" class="inline-block w-6 border-t-2 border-dashed border-chart-exit"></i>Saídas
				</span>
			</div>

			{#if hasMovement}
				<div bind:this={chartArea} class="relative h-72 w-full tablet:h-80">
					{#if chartConfig}
						<Line
							data={chartConfig.data}
							options={chartConfig.options}
							aria-hidden="true"
							role="presentation"
							class="max-w-full" />
					{/if}
				</div>
			{:else}
				<p class="my-4 font-medium" role="status">Não há lançamentos ativos no período.</p>
			{/if}
		</div>
	</div>
</Card>
