// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { readChartPalette } from '#lib/charts/chart-palette.js';

afterEach(() => {
	document.body.replaceChildren();
});

describe('readChartPalette', () => {
	it('reads the series, axis and point ring colors from the theme tokens', () => {
		const chartArea = document.createElement('div');
		chartArea.setAttribute(
			'style',
			'--color-chart-entry: #006ca5; --color-chart-exit: #c52633; --color-chart-axis: #505d7c; --color-surface: #ffffff',
		);
		document.body.append(chartArea);

		const palette = readChartPalette(chartArea);

		expect(palette).toEqual({ entry: '#006ca5', exit: '#c52633', axis: '#505d7c', surface: '#ffffff' });
	});
});
