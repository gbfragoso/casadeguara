import { describe, expect, it } from 'vitest';

import type { SheetElement, SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { buildSheetFooter, buildSheetHeader } from '#lib/server/pdf/sheet/sections.js';
import { HEADING_LINE_GAP } from '#lib/server/pdf/sheet/typography.js';
import { listTexts, readTexts } from './support/layout-queries';
import { testMeasurers } from './support/measurers';
import { GENERATED_ON, NOVEMBER_2026 } from './support/sheet-fixtures';

const bottomOf = (element: SheetTextElement) => element.top + element.lines.length * element.lineHeight;

const describeElement = (element: SheetElement) => {
	if (element.kind === 'logo') return 'logo';
	return element.kind === 'text' ? `${element.role}: ${element.lines.join(' ')}` : element.role;
};

describe('TU-02 sheet header', () => {
	it('shows the logo, the house, the received heading, the month and the rule', () => {
		const header = buildSheetHeader('Aniversariantes do mês', NOVEMBER_2026, testMeasurers);

		expect(header.map(describeElement)).toEqual([
			'logo',
			'instituicao: GRUPO ESPÍRITA CASA DE GUARÁ',
			'cabecalho: Aniversariantes do mês',
			'mes: NOVEMBRO DE 2026',
			'filete',
		]);
	});

	it('separates the header lines with the approved spacing', () => {
		const header = buildSheetHeader('Programação de palestras', NOVEMBER_2026, testMeasurers);

		const heading = listTexts({ elements: header });
		const gaps = heading.slice(1).map((element, index) => element.top - bottomOf(heading[index]));
		expect(gaps).toEqual([HEADING_LINE_GAP, HEADING_LINE_GAP]);
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
