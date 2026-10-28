import { describe, expect, it } from 'vitest';

import type { SheetElement, SheetLogoElement, SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { buildSheetFooter, buildSheetHeader } from '#lib/server/pdf/sheet/sections.js';
import { HEADING_LINE_GAP } from '#lib/server/pdf/sheet/typography.js';
import { boundsOf, listTexts, readTexts } from './support/layout-queries';
import { testMeasurers } from './support/measurers';
import { GENERATED_ON, NOVEMBER_2026 } from './support/sheet-fixtures';

const PROGRAM_HEADING = 'Programação de palestras';
const LONG_HEADING = 'Programação de palestras públicas, estudos doutrinários e seminários da casa espírita';

const findText = (header: SheetElement[], role: string): SheetTextElement => {
	const [element] = listTexts({ elements: header }).filter((text) => text.role === role);
	return element;
};

const findLogo = (header: SheetElement[]) =>
	header.find((element): element is SheetLogoElement => element.kind === 'logo');

const describeElement = (element: SheetElement) => {
	if (element.kind === 'logo') return 'logo';
	return element.kind === 'text' ? `${element.role}: ${element.lines.join(' ')}` : element.role;
};

describe('TU-02 sheet header', () => {
	it('shows the logo, the house, the received heading in upper case, the month and the rule', () => {
		const header = buildSheetHeader('Aniversariantes do mês', NOVEMBER_2026, testMeasurers);

		expect(header.map(describeElement)).toEqual([
			'logo',
			'instituicao: GRUPO ESPÍRITA CASA DE GUARÁ',
			'cabecalho: ANIVERSARIANTES DO MÊS',
			'mes: — NOVEMBRO DE 2026',
			'filete',
		]);
	});

	it('writes the heading at the size of the house name', () => {
		const header = buildSheetHeader(PROGRAM_HEADING, NOVEMBER_2026, testMeasurers);

		expect(findText(header, 'cabecalho').size).toBe(findText(header, 'instituicao').size);
	});

	it('puts the month on the heading line, after the heading and in its color', () => {
		const header = buildSheetHeader(PROGRAM_HEADING, NOVEMBER_2026, testMeasurers);

		const heading = findText(header, 'cabecalho');
		const month = findText(header, 'mes');
		const headingRight = heading.x + testMeasurers.bold.widthOfTextAtSize(heading.lines[0], heading.size);
		expect(month.top).toBe(heading.top);
		expect(month.x).toBeGreaterThan(headingRight);
		expect(month.color).toBe(heading.color);
	});

	it('keeps the month whole on the heading line after a long heading', () => {
		const header = buildSheetHeader(LONG_HEADING, NOVEMBER_2026, testMeasurers);

		const month = findText(header, 'mes');

		expect(month.lines).toEqual(['— NOVEMBRO DE 2026']);
		expect(month.x).toBeGreaterThan(findText(header, 'cabecalho').x);
	});

	it('gives the logo the top and the height of the heading text', () => {
		const header = buildSheetHeader(PROGRAM_HEADING, NOVEMBER_2026, testMeasurers);

		const institution = boundsOf(findText(header, 'instituicao'));
		const heading = boundsOf(findText(header, 'cabecalho'));
		expect(findLogo(header)).toMatchObject({ top: institution.top, size: heading.bottom - institution.top });
	});

	it('separates the two header lines with the approved spacing', () => {
		const header = buildSheetHeader(PROGRAM_HEADING, NOVEMBER_2026, testMeasurers);

		const gap = findText(header, 'cabecalho').top - boundsOf(findText(header, 'instituicao')).bottom;
		expect(gap).toBe(HEADING_LINE_GAP);
	});
});

describe('TU-02 sheet footer', () => {
	it('shows the house and the generation date without numbering a single page', () => {
		const footer = {
			elements: buildSheetFooter({ generatedOn: GENERATED_ON, pageNumber: 1, pageCount: 1 }, testMeasurers),
		};

		expect(readTexts(footer, 'rodape')).toEqual([
			'Grupo Espírita Casa de Guará · Rua Major Dórea, 86, Castália, Itabuna-BA',
		]);
		expect(readTexts(footer, 'geracao')).toEqual(['Gerado em 27/10/2026']);
	});

	it('numbers the page when the sheet has more than one page', () => {
		const footer = {
			elements: buildSheetFooter({ generatedOn: GENERATED_ON, pageNumber: 2, pageCount: 3 }, testMeasurers),
		};

		expect(readTexts(footer, 'geracao')).toEqual(['Gerado em 27/10/2026 · Página 2 de 3']);
	});
});
