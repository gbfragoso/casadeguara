import {
	CategoryScale,
	Chart as ChartJS,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
	type ActiveElement,
	type ChartData,
	type ChartOptions,
	type TooltipItem,
} from 'chart.js';

import type { MonthlyLancamentoTotal } from '$lib/tesouraria/monthly-totals';
import { formatBrlDecimal, formatMonthLabel } from '$lib/utils/currency';

const ENTRY_COLOR = '#007a3d';
const EXIT_COLOR = '#b42318';
const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	notation: 'compact',
	maximumFractionDigits: 1,
});

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

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

export const formatMonthlyDetail = (total: MonthlyLancamentoTotal | undefined) => {
	if (!total) return 'Selecione uma competência para consultar os valores exatos.';
	return `Competência ${formatMonthLabel(total.competencia)} — Entradas: ${formatBrlDecimal(total.entradas)}; Saídas: ${formatBrlDecimal(total.saidas)}`;
};

const buildEntryDataset = (totals: readonly MonthlyLancamentoTotal[]) => ({
	label: 'Entradas',
	data: totals.map(({ entradas }) => toChartNumber(entradas)),
	borderColor: ENTRY_COLOR,
	backgroundColor: ENTRY_COLOR,
	pointBackgroundColor: ENTRY_COLOR,
	pointBorderColor: ENTRY_COLOR,
	pointStyle: 'circle' as const,
	pointRadius: 4,
	pointHoverRadius: 6,
	borderWidth: 3,
	fill: false,
});

const buildExitDataset = (totals: readonly MonthlyLancamentoTotal[]) => ({
	label: 'Saídas',
	data: totals.map(({ saidas }) => toChartNumber(saidas)),
	borderColor: EXIT_COLOR,
	backgroundColor: EXIT_COLOR,
	pointBackgroundColor: EXIT_COLOR,
	pointBorderColor: EXIT_COLOR,
	pointStyle: 'rectRot' as const,
	pointRadius: 4,
	pointHoverRadius: 6,
	borderWidth: 3,
	borderDash: [6, 4],
	fill: false,
});

const buildChartData = (totals: readonly MonthlyLancamentoTotal[], labels: string[]): ChartData<'line'> => ({
	labels,
	datasets: [buildEntryDataset(totals), buildExitDataset(totals)],
});

const buildTooltip = (totals: readonly MonthlyLancamentoTotal[], labels: string[]) => ({
	usePointStyle: true,
	callbacks: {
		title: (items: TooltipItem<'line'>[]) => (items[0] ? labels[items[0].dataIndex] : ''),
		label: (item: TooltipItem<'line'>) => {
			const name = item.datasetIndex === 0 ? 'Entradas' : 'Saídas';
			return `${name}: ${formatBrlDecimal(getTotal(totals, item))}`;
		},
	},
});

const selectFirstElement = (elements: ActiveElement[], onSelect: (index: number) => void) => {
	const [element] = elements;
	if (element) onSelect(element.index);
};

const buildChartOptions = (
	totals: readonly MonthlyLancamentoTotal[],
	labels: string[],
	onSelect: (index: number) => void,
): ChartOptions<'line'> => ({
	responsive: true,
	maintainAspectRatio: false,
	animation: false,
	locale: 'pt-BR',
	interaction: { mode: 'index', axis: 'x', intersect: false },
	onClick: (_event, elements) => selectFirstElement(elements, onSelect),
	onHover: (_event, elements) => selectFirstElement(elements, onSelect),
	plugins: { legend: { display: false }, tooltip: buildTooltip(totals, labels) },
	scales: {
		x: { ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 } },
		y: { beginAtZero: true, ticks: { callback: (value) => formatAxisValue(value) } },
	},
});

export const buildMonthlyChart = (
	totals: readonly MonthlyLancamentoTotal[],
	onSelect: (index: number) => void,
): { data: ChartData<'line'>; options: ChartOptions<'line'> } => {
	const labels = totals.map(({ competencia }) => formatMonthLabel(competencia));
	return { data: buildChartData(totals, labels), options: buildChartOptions(totals, labels, onSelect) };
};
