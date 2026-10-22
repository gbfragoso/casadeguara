import {
	CategoryScale,
	Chart as ChartJS,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
	type ChartData,
	type ChartOptions,
	type PointStyle,
	type TooltipItem,
} from 'chart.js';

import type { ChartPalette } from '#lib/charts/chart-palette.js';
import type { MonthlyLancamentoTotal } from '#lib/tesouraria/monthly-totals.js';
import { formatBrlDecimal, formatMonthLabel } from '#lib/utils/currency.js';

const LINE_WIDTH = 2;
const POINT_RADIUS = 4;
const POINT_HOVER_RADIUS = 6;
const POINT_RING_WIDTH = 2;
const EXIT_DASH = [6, 4];
const CHART_FONT = { family: "'Roboto', sans-serif", size: 13 };
const HIDDEN_LINES = { grid: { display: false }, border: { display: false } };

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	notation: 'compact',
	maximumFractionDigits: 1,
});

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

type SeriesStyle = { label: string; color: string; pointStyle: PointStyle; borderDash?: number[] };

const toChartNumber = (value: string) => {
	formatBrlDecimal(value);
	return Number(value);
};

const getTotal = (totals: readonly MonthlyLancamentoTotal[], item: TooltipItem<'line'>) => {
	const total = totals[item.dataIndex];
	if (!total) throw new RangeError('Chart data index is outside the monthly totals.');
	if (item.datasetIndex === 0) return total.entradas;
	if (item.datasetIndex === 1) return total.saidas;
	throw new RangeError('Chart dataset index is outside the monthly totals.');
};

const formatAxisValue = (value: string | number) =>
	compactCurrencyFormatter.format(typeof value === 'number' ? value : Number(value));

const buildSeries = (values: string[], style: SeriesStyle, palette: ChartPalette) => ({
	label: style.label,
	data: values.map(toChartNumber),
	borderColor: style.color,
	backgroundColor: style.color,
	borderWidth: LINE_WIDTH,
	borderDash: style.borderDash,
	borderCapStyle: 'round' as const,
	borderJoinStyle: 'round' as const,
	cubicInterpolationMode: 'monotone' as const,
	pointStyle: style.pointStyle,
	pointRadius: POINT_RADIUS,
	pointHoverRadius: POINT_HOVER_RADIUS,
	pointBackgroundColor: style.color,
	pointBorderColor: palette.surface,
	pointBorderWidth: POINT_RING_WIDTH,
	pointHoverBorderWidth: POINT_RING_WIDTH,
	fill: false,
});

const buildChartData = (
	totals: readonly MonthlyLancamentoTotal[],
	labels: string[],
	palette: ChartPalette,
): ChartData<'line'> => ({
	labels,
	datasets: [
		buildSeries(
			totals.map(({ entradas }) => entradas),
			{ label: 'Entradas', color: palette.entry, pointStyle: 'circle' },
			palette,
		),
		buildSeries(
			totals.map(({ saidas }) => saidas),
			{ label: 'Saídas', color: palette.exit, pointStyle: 'rectRot', borderDash: EXIT_DASH },
			palette,
		),
	],
});

const buildTooltip = (totals: readonly MonthlyLancamentoTotal[], labels: string[]) => ({
	usePointStyle: true,
	titleFont: CHART_FONT,
	bodyFont: CHART_FONT,
	callbacks: {
		title: (items: TooltipItem<'line'>[]) => (items[0] ? labels[items[0].dataIndex] : ''),
		label: (item: TooltipItem<'line'>) => {
			const name = item.datasetIndex === 0 ? 'Entradas' : 'Saídas';
			return `${name}: ${formatBrlDecimal(getTotal(totals, item))}`;
		},
	},
});

const buildChartOptions = (
	totals: readonly MonthlyLancamentoTotal[],
	labels: string[],
	palette: ChartPalette,
): ChartOptions<'line'> => ({
	responsive: true,
	maintainAspectRatio: false,
	animation: false,
	locale: 'pt-BR',
	interaction: { mode: 'index', axis: 'x', intersect: false },
	plugins: { legend: { display: false }, tooltip: buildTooltip(totals, labels) },
	scales: {
		x: {
			...HIDDEN_LINES,
			ticks: { autoSkip: true, maxRotation: 0, minRotation: 0, color: palette.axis, font: CHART_FONT },
		},
		y: {
			...HIDDEN_LINES,
			beginAtZero: true,
			ticks: { color: palette.axis, font: CHART_FONT, callback: (value) => formatAxisValue(value) },
		},
	},
});

export const buildMonthlyChart = (
	totals: readonly MonthlyLancamentoTotal[],
	palette: ChartPalette,
): { data: ChartData<'line'>; options: ChartOptions<'line'> } => {
	const labels = totals.map(({ competencia }) => formatMonthLabel(competencia));
	return { data: buildChartData(totals, labels, palette), options: buildChartOptions(totals, labels, palette) };
};
