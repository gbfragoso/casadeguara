// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('svelte-chartjs', async () => ({ Line: (await import('./support/LineStub.svelte')).default }));

import MonthlyLancamentos from '#lib/components/charts/MonthlyLancamentos.svelte';
import { renderComponent } from '../support/render-component.js';

const totals = Array.from({ length: 12 }, (_, index) => ({
	competencia: `2025-${String(index + 1).padStart(2, '0')}`,
	entradas: String((index + 1) * 100),
	saidas: String((index + 1) * 40),
}));

const themeStyle = document.createElement('style');

const setThemeColors = (entry: string, axis: string) => {
	themeStyle.textContent = `div { --color-chart-entry: ${entry}; --color-chart-axis: ${axis}; }`;
	document.head.append(themeStyle);
};

afterEach(() => {
	themeStyle.remove();
	document.documentElement.removeAttribute('data-theme');
});

describe('MonthlyLancamentos in the browser', () => {
	it('draws the chart with the theme colors on a canvas hidden from assistive technology', async () => {
		setThemeColors('#006ca5', '#505d7c');

		const target = await renderComponent(MonthlyLancamentos, { totals });

		const canvas = target.querySelector('canvas');
		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
		expect([canvas?.dataset.entryColor, canvas?.dataset.axisColor]).toEqual(['#006ca5', '#505d7c']);
	});

	it('repaints the chart when the theme changes', async () => {
		setThemeColors('#006ca5', '#505d7c');
		const target = await renderComponent(MonthlyLancamentos, { totals });

		setThemeColors('#0288cd', '#95a1bb');
		document.documentElement.dataset.theme = 'dark';

		await vi.waitFor(() => expect(target.querySelector('canvas')?.dataset.entryColor).toBe('#0288cd'));
	});
});
