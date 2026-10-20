import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../../../support/contrast';
import {
	listReferencedTokens,
	measureHueDistance,
	readThemeTokens,
	resolveColor,
	resolveToken,
	type TokenMap,
} from './support/theme-tokens';

const INSTITUTIONAL_COLORS = [
	{ token: '--color-primary', value: '#017fc0' },
	{ token: '--color-accent', value: '#ffb70f' },
];
const TONE_FAMILIES = [
	{ pattern: /^--color-primary-\d+$/, base: '#017fc0' },
	{ pattern: /^--color-accent-\d+$/, base: '#ffb70f' },
];
const TONE_HUE_TOLERANCE_DEGREES = 10;
const GRADIENT_STOP = /^--color-(?:primary|accent)(?:-\d+)?$/;
const TEXT_CONTRAST_RATIO = 4.5;
const NON_TEXT_CONTRAST_RATIO = 3;
const FIXED_CHART_COLORS = ['#007a3d', '#b42318'];

const TEXT_ROLES = [
	'ink',
	'ink-strong',
	'ink-muted',
	'primary-ink',
	'success-ink',
	'danger-ink',
	'info-ink',
	'warning-ink',
];
const TEXT_BACKGROUNDS = ['page', 'surface', 'surface-muted'];
const TEXT_PAIRS = [
	...TEXT_ROLES.flatMap((text) => TEXT_BACKGROUNDS.map((background) => [text, background])),
	['ink-strong', 'topbar'],
	['on-primary', 'primary-600'],
	['on-primary', 'primary-700'],
	['on-accent', 'accent'],
	['on-success', 'success'],
	['on-danger', 'danger'],
	['on-info', 'info'],
	['on-warning', 'warning'],
	['sidebar-ink', 'sidebar'],
	['sidebar-hover-ink', 'sidebar-hover'],
	['sidebar-active-ink', 'sidebar-active'],
	['primary-ink', 'primary-soft'],
	['success-ink', 'success-soft'],
	['danger-ink', 'danger-soft'],
	['warning-ink', 'warning-soft'],
	['primary-ink', 'surface-hover'],
	['chart-ink', 'chart-surface'],
];
const NON_TEXT_PAIRS = [
	['focus', 'page'],
	['focus', 'surface'],
	['focus', 'sidebar'],
	['line', 'surface'],
	['line', 'page'],
	['sidebar-active-icon', 'sidebar-active'],
];

const themes = readThemeTokens();
const THEMES = [
	{ theme: 'claro', tokens: themes.light },
	{ theme: 'escuro', tokens: themes.dark },
];

const listGradients = (tokens: TokenMap) => Object.entries(tokens).filter(([name]) => name.startsWith('--gradient-'));

const findWeakPairs = (tokens: TokenMap, pairs: string[][], minimumRatio: number) =>
	pairs
		.map(([foreground, background]) => ({
			pair: `${foreground} sobre ${background}`,
			ratio: contrastRatio(resolveColor(tokens, foreground), resolveColor(tokens, background)),
		}))
		.filter(({ ratio }) => ratio < minimumRatio);

describe('theme tokens', () => {
	it.each(INSTITUTIONAL_COLORS)('fixes $token as $value in both themes', ({ token, value }) => {
		const { light, darkOverrides } = themes;

		const lightValue = light[token];

		expect(lightValue).toBe(value);
		expect(darkOverrides).not.toHaveProperty(token);
	});

	it('composes every gradient only from primary and accent tones', () => {
		const gradients = listGradients(themes.light);

		const foreignStops = gradients.flatMap(([, value]) =>
			listReferencedTokens(value).filter((stop) => !GRADIENT_STOP.test(stop)),
		);

		expect(gradients.length).toBeGreaterThan(0);
		expect(foreignStops).toEqual([]);
	});

	it('keeps every primary and accent tone within the hue tolerance of its base color', () => {
		const tones = TONE_FAMILIES.flatMap(({ pattern, base }) =>
			Object.keys(themes.light)
				.filter((name) => pattern.test(name))
				.map((name) => ({ name, base })),
		);

		const distantTones = tones.filter(
			({ name, base }) => measureHueDistance(resolveToken(themes.light, name), base) > TONE_HUE_TOLERANCE_DEGREES,
		);

		expect(tones.length).toBeGreaterThan(0);
		expect(distantTones).toEqual([]);
	});

	it.each(THEMES)('keeps text roles legible in the $theme theme', ({ tokens }) => {
		const weakPairs = findWeakPairs(tokens, TEXT_PAIRS, TEXT_CONTRAST_RATIO);

		expect(weakPairs).toEqual([]);
	});

	it.each(THEMES)('keeps focus, field borders and active icons visible in the $theme theme', ({ tokens }) => {
		const weakPairs = findWeakPairs(tokens, NON_TEXT_PAIRS, NON_TEXT_CONTRAST_RATIO);

		expect(weakPairs).toEqual([]);
	});

	it.each(THEMES)('keeps highlight text legible over every gradient stop in the $theme theme', ({ tokens }) => {
		const stops = listGradients(tokens).flatMap(([, value]) => listReferencedTokens(value));

		const weakStops = stops.filter(
			(stop) =>
				contrastRatio(resolveColor(tokens, 'on-highlight'), resolveToken(tokens, stop)) < TEXT_CONTRAST_RATIO,
		);

		expect(stops.length).toBeGreaterThan(0);
		expect(weakStops).toEqual([]);
	});

	it.each(THEMES)('keeps the fixed chart colors legible on the chart surface in the $theme theme', ({ tokens }) => {
		const chartSurface = resolveColor(tokens, 'chart-surface');

		const weakColors = FIXED_CHART_COLORS.filter(
			(chartColor) => contrastRatio(chartColor, chartSurface) < TEXT_CONTRAST_RATIO,
		);

		expect(weakColors).toEqual([]);
	});
});
