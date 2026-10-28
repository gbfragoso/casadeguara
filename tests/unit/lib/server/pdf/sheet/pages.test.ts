import { describe, expect, it } from 'vitest';

import type { SheetElement, SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { composeSheetPages } from '#lib/server/pdf/sheet/pages.js';
import { SHEET_PALETTE } from '#lib/server/pdf/sheet/palette.js';
import { BODY_HEIGHT, BODY_TOP } from '#lib/server/pdf/sheet/typography.js';
import { contrastRatio } from '../../../../../support/contrast';
import { readThemeTokens, resolveToken } from '../../../styles/support/theme-tokens';
import { listTexts, readTexts } from './support/layout-queries';
import { testMeasurers } from './support/measurers';
import { createTextBlock, SHEET_FRAME } from './support/sheet-fixtures';

const MINIMUM_TEXT_CONTRAST = 4.5;
const WHITE = '#ffffff';
const HEADER_ROLES = new Set(['instituicao', 'cabecalho', 'mes', 'filete']);

const HALF_BODY_BLOCKS = ['Primeiro', 'Segundo', 'Terceiro'].map((text) => createTextBlock(text, BODY_HEIGHT / 2));

const describeHeaderElement = (element: SheetElement) => {
	if (element.kind === 'logo') return 'logo';
	if (!HEADER_ROLES.has(element.role)) return null;
	return element.kind === 'text' ? `${element.role}: ${element.lines.join(' ')}` : element.role;
};

const listSeparatorTops = ({ elements }: SheetPageLayout) =>
	elements.flatMap((element) => (element.kind === 'rule' && element.role === 'separador' ? [element.y] : []));

const toTokenName = (color: string) => `--color-${color.replace(/(\d+)$/, '-$1')}`;

describe('composeSheetPages', () => {
	it('repeats the header with the received heading on every page', () => {
		const pages = composeSheetPages(SHEET_FRAME, HALF_BODY_BLOCKS, testMeasurers);

		const headers = pages.map(({ elements }) => elements.map(describeHeaderElement).filter(Boolean));
		expect(headers).toEqual(
			pages.map(() => [
				'logo',
				'instituicao: GRUPO ESPÍRITA CASA DE GUARÁ',
				'cabecalho: ANIVERSARIANTES DO MÊS',
				'mes: — NOVEMBRO DE 2026',
				'filete',
			]),
		);
	});

	it('separates the blocks of a page without a rule above the first one', () => {
		const pages = composeSheetPages(SHEET_FRAME, HALF_BODY_BLOCKS, testMeasurers);

		expect(pages.map((page) => readTexts(page, 'item'))).toEqual([['Primeiro', 'Segundo'], ['Terceiro']]);
		expect(pages.map(listSeparatorTops)).toEqual([[BODY_TOP + BODY_HEIGHT / 2], []]);
	});

	it('numbers every page in the footer of a sheet with more than one page', () => {
		const pages = composeSheetPages(SHEET_FRAME, HALF_BODY_BLOCKS, testMeasurers);

		expect(pages.map((page) => readTexts(page, 'geracao'))).toEqual([
			['Gerado em 27/10/2026 · Página 1 de 2'],
			['Gerado em 27/10/2026 · Página 2 de 2'],
		]);
	});
});

describe('TU-03 sheet colors', () => {
	it('restricts color to the logo and the header rule', () => {
		const pages = composeSheetPages(SHEET_FRAME, HALF_BODY_BLOCKS, testMeasurers);

		const elements = pages.flatMap((page) => page.elements);
		const texts = listTexts({ elements });
		const rules = elements.filter((element) => element.kind === 'rule');
		const textRatios = texts.map(({ color }) => contrastRatio(SHEET_PALETTE[color], WHITE));
		expect(new Set(elements.map(({ kind }) => kind))).toEqual(new Set(['text', 'rule', 'logo']));
		expect(rules.filter(({ color }) => color === 'accent').map(({ role }) => role)).toEqual(['filete', 'filete']);
		expect([...texts, ...rules].filter(({ color }) => !Object.hasOwn(SHEET_PALETTE, color))).toEqual([]);
		expect(Math.min(...textRatios)).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
	});

	it('mirrors the theme tokens in the sheet palette', () => {
		const { light } = readThemeTokens();

		const themeColors = Object.keys(SHEET_PALETTE).map((color) =>
			resolveToken(light, toTokenName(color)).toLowerCase(),
		);

		expect(themeColors).toEqual(Object.values(SHEET_PALETTE));
	});
});
