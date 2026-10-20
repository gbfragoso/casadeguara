<script lang="ts">
	import { Line } from 'svelte-chartjs';

	import { buildMonthlyChart, ENTRY_COLOR, EXIT_COLOR } from '#lib/charts/monthly-lancamentos.js';
	import Card from '#lib/components/layout/Card.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import type { MonthlyLancamentoTotal } from '#lib/tesouraria/monthly-totals.js';

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

<Card>
	<div class="w-full" role="region" aria-labelledby={titleId} aria-describedby={descriptionId}>
		<div class="flex flex-col gap-1">
			<SectionHeading id={titleId} icon="fa-solid fa-chart-line"
				>Entradas e saídas — últimos 12 meses</SectionHeading>
			<p id={descriptionId} class="text-ink-muted tablet:pl-12">
				Totais mensais de lançamentos ativos, em reais.
			</p>
		</div>

		<div class="mt-5 rounded-lg bg-chart-surface p-3 text-chart-ink tablet:p-4">
			<div class="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Legenda" data-testid="legenda-grafico">
				<span class="inline-flex items-center gap-2 font-medium" style:color={ENTRY_COLOR}>
					<i aria-hidden="true" class="inline-block w-6 border-t-3 border-current"></i>Entradas
				</span>
				<span class="inline-flex items-center gap-2 font-medium" style:color={EXIT_COLOR}>
					<i aria-hidden="true" class="inline-block w-6 border-t-3 border-dashed border-current"></i>Saídas
				</span>
			</div>

			{#if hasMovement && chartConfig}
				<div class="relative h-72 w-full tablet:h-80">
					<Line
						data={chartConfig.data}
						options={chartConfig.options}
						aria-hidden="true"
						role="presentation"
						class="max-w-full" />
				</div>
			{:else}
				<p class="my-4 font-medium" role="status">Não há lançamentos ativos no período.</p>
			{/if}
		</div>
	</div>
</Card>
