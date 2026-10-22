export type ChartPalette = { entry: string; exit: string; axis: string; surface: string };

const readToken = (style: CSSStyleDeclaration, token: string) => style.getPropertyValue(token).trim();

export const readChartPalette = (element: Element): ChartPalette => {
	const style = getComputedStyle(element);
	return {
		entry: readToken(style, '--color-chart-entry'),
		exit: readToken(style, '--color-chart-exit'),
		axis: readToken(style, '--color-chart-axis'),
		surface: readToken(style, '--color-surface'),
	};
};
