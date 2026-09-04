import type { Scale, TooltipItem, TooltipModel } from 'chart.js';
import { describe, expect, it } from 'vitest';

import { buildMonthlyChart } from '$lib/charts/monthly-lancamentos';

const totals = Array.from({ length: 12 }, (_, index) => ({
	competencia: `2025-${String(index + 1).padStart(2, '0')}`,
	entradas: index === 0 ? '1234.567890123456789' : String(index * 100),
	saidas: index === 0 ? '987.654' : String(index * 50),
}));

const getCallbacks = (options: ReturnType<typeof buildMonthlyChart>['options']) => {
	const callbacks = options.plugins?.tooltip?.callbacks;
	if (!callbacks) throw new Error('Tooltip callbacks were not configured.');
	return callbacks;
};

const tooltipItem = (datasetIndex: number): TooltipItem<'line'> =>
	({ dataIndex: 0, datasetIndex }) as TooltipItem<'line'>;

describe('buildMonthlyChart', () => {
	it('builds responsive, distinguishable, non-animated series', () => {
		const { data, options } = buildMonthlyChart(totals);

		const [entries, exits] = data.datasets;

		expect(data.labels).toEqual(
			totals.map((total) => `${total.competencia.slice(5)}/${total.competencia.slice(0, 4)}`),
		);
		expect(entries.data).toHaveLength(12);
		expect(exits.data).toHaveLength(12);
		expect(entries.label).toBe('Entradas');
		expect(exits.label).toBe('Saídas');
		expect(entries.pointStyle).toBe('circle');
		expect(exits.pointStyle).toBe('rectRot');
		expect(exits.borderDash).toEqual([6, 4]);
		expect(entries.borderColor).toBe('#007a3d');
		expect(exits.borderColor).toBe('#b42318');
		expect(options.responsive).toBe(true);
		expect(options.maintainAspectRatio).toBe(false);
		expect(options.animation).toBe(false);
		expect(options.locale).toBe('pt-BR');
		expect(options.interaction).toEqual({ mode: 'index', axis: 'x', intersect: false });
		expect(options.scales?.x?.ticks).toMatchObject({ autoSkip: true, maxRotation: 0, minRotation: 0 });
		expect(options.scales?.y).toMatchObject({ beginAtZero: true });
	});

	it('keeps exact decimal strings in tooltip callbacks', () => {
		const { options } = buildMonthlyChart(totals);
		const callbacks = getCallbacks(options);

		expect(callbacks.title?.call({} as TooltipModel<'line'>, [tooltipItem(0)])).toBe('01/2025');
		expect(callbacks.title?.call({} as TooltipModel<'line'>, [])).toBe('');
		expect(callbacks.label?.call({} as TooltipModel<'line'>, tooltipItem(0))).toBe(
			'Entradas: R$ 1.234,567890123456789',
		);
		expect(callbacks.label?.call({} as TooltipModel<'line'>, tooltipItem(1))).toBe('Saídas: R$ 987,654');
	});

	it('rejects tooltip indexes that break the monthly contract', () => {
		const { options } = buildMonthlyChart(totals);
		const callbacks = getCallbacks(options);

		expect(() =>
			callbacks.label?.call(
				{} as TooltipModel<'line'>,
				{ dataIndex: 12, datasetIndex: 0 } as TooltipItem<'line'>,
			),
		).toThrow(RangeError);
		expect(() =>
			callbacks.label?.call({} as TooltipModel<'line'>, { dataIndex: 0, datasetIndex: 2 } as TooltipItem<'line'>),
		).toThrow(RangeError);
	});

	it('formats compact real values on the y axis', () => {
		const { options } = buildMonthlyChart(totals);
		const callback = options.scales?.y?.ticks?.callback;
		if (!callback) throw new Error('Y-axis formatter was not configured.');

		expect(callback.call({} as Scale, 1000, 0, [])).toContain('mil');
	});
});
