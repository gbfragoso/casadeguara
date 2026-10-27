import { describe, expect, it } from 'vitest';

import type { ProgramElement } from '#lib/server/pdf/talk-program/elements.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { PROGRAM_PALETTE } from '#lib/server/pdf/talk-program/palette.js';
import { contrastRatio } from '../../../../../support/contrast';
import { readThemeTokens, resolveToken } from '../../../styles/support/theme-tokens';
import { listTexts, readTexts } from './support/layout-queries';
import {
	BASE_TALK,
	createProgramDocument,
	FULL_MONTH_TALKS,
	LONG_WORST_CASE_TALK,
	testMeasurers,
} from './support/program-fixtures';

const MINIMUM_TEXT_CONTRAST = 4.5;
const WHITE = '#ffffff';

const HEADER_ROLES = new Set(['instituicao', 'cabecalho', 'mes', 'filete']);

const describeHeaderElement = (element: ProgramElement) => {
	if (element.kind === 'logo') return 'logo';
	if (!HEADER_ROLES.has(element.role)) return null;
	return element.kind === 'text' ? `${element.role}: ${element.lines.join(' ')}` : element.role;
};

const toTokenName = (color: string) => `--color-${color.replace(/(\d+)$/, '-$1')}`;

describe('layoutTalkProgram', () => {
	it('repeats the header on every page', () => {
		const document = createProgramDocument(FULL_MONTH_TALKS);

		const pages = layoutTalkProgram(document, testMeasurers);

		const headers = pages.map(({ elements }) => elements.map(describeHeaderElement).filter(Boolean));
		expect(pages.length).toBeGreaterThan(1);
		expect(headers).toEqual(
			pages.map(() => [
				'logo',
				'instituicao: GRUPO ESPÍRITA CASA DE GUARÁ',
				'cabecalho: Programação de palestras',
				'mes: NOVEMBRO DE 2026',
				'filete',
			]),
		);
	});

	it('shows the house and the generation date in the footer of a single page', () => {
		const document = createProgramDocument([BASE_TALK]);

		const [page, ...otherPages] = layoutTalkProgram(document, testMeasurers);

		expect(otherPages).toEqual([]);
		expect(readTexts(page, 'rodape')).toEqual([
			'Grupo Espírita Casa de Guará · Rua Major Dórea, 86, Castália, Itabuna-BA',
		]);
		expect(readTexts(page, 'geracao')).toEqual(['Gerado em 27/10/2026']);
		expect(listTexts(page).filter(({ lines }) => lines.join(' ').includes('Página'))).toEqual([]);
	});

	it('restricts color to the logo and the header rule', () => {
		const document = createProgramDocument([...FULL_MONTH_TALKS, LONG_WORST_CASE_TALK]);

		const elements = layoutTalkProgram(document, testMeasurers).flatMap((page) => page.elements);

		const texts = listTexts({ elements });
		const rules = elements.filter((element) => element.kind === 'rule');
		const colors = [...texts, ...rules].map(({ color }) => color);
		const textRatios = texts.map(({ color }) => contrastRatio(PROGRAM_PALETTE[color], WHITE));
		expect(new Set(elements.map(({ kind }) => kind))).toEqual(new Set(['text', 'rule', 'logo']));
		expect(rules.filter(({ color }) => color === 'accent').map(({ role }) => role)).toEqual(
			rules.filter(({ role }) => role === 'filete').map(() => 'filete'),
		);
		expect(colors.filter((color) => !Object.hasOwn(PROGRAM_PALETTE, color))).toEqual([]);
		expect(Math.min(...textRatios)).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
	});

	it('mirrors the theme tokens in the sheet palette', () => {
		const { light } = readThemeTokens();

		const themeColors = Object.keys(PROGRAM_PALETTE).map((color) =>
			resolveToken(light, toTokenName(color)).toLowerCase(),
		);

		expect(themeColors).toEqual(Object.values(PROGRAM_PALETTE));
	});
});
