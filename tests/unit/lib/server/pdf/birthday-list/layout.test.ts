import { describe, expect, it } from 'vitest';

import { CORRECTION_NOTICE } from '#lib/birthdays/format.js';
import { layoutBirthdayList } from '#lib/server/pdf/birthday-list/layout.js';
import type { SheetElement, SheetPageLayout, SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { createCalendarMonth } from '#lib/utils/calendar-month.js';
import { boundsOf, listTexts, readTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import { BASE_PERSON, createBirthdayDocument, FULL_MONTH_PEOPLE } from './support/birthday-fixtures';

const HEADER_ROLES = new Set(['instituicao', 'cabecalho', 'mes', 'filete']);

const TWO_GROUPS = createBirthdayDocument([
	{ ...BASE_PERSON, id: 1, nome: 'Ana Clara dos Santos', dia: 3 },
	{ ...BASE_PERSON, id: 2, nome: 'José Carlos Moreira', dia: 3 },
	{ ...BASE_PERSON, id: 3, nome: 'Maria das Graças Lima', dia: 7, desencarnado: true },
]);

const describeHeaderElement = (element: SheetElement) => {
	if (element.kind === 'logo') return 'logo';
	if (!HEADER_ROLES.has(element.role)) return null;
	return element.kind === 'text' ? `${element.role}: ${element.lines.join(' ')}` : element.role;
};

const findTexts = (page: SheetPageLayout, role: string) => listTexts(page).filter((text) => text.role === role);

const listSeparatorTops = ({ elements }: SheetPageLayout) =>
	elements.flatMap((element) => (element.kind === 'rule' && element.role === 'separador' ? [element.y] : []));

const bottomOf = (elements: SheetTextElement[]) => Math.max(...elements.map((element) => boundsOf(element).bottom));

describe('TU-27 birthday list header and footer', () => {
	it('heads the sheet with the list title and the reference month', () => {
		const [page] = layoutBirthdayList(TWO_GROUPS, testMeasurers);

		expect(page.elements.map(describeHeaderElement).filter(Boolean)).toEqual([
			'logo',
			'instituicao: GRUPO ESPÍRITA CASA DE GUARÁ',
			'cabecalho: ANIVERSARIANTES DO MÊS',
			'mes: — NOVEMBRO DE 2026',
			'filete',
		]);
	});

	it('dates a single sheet without numbering its page', () => {
		const [page] = layoutBirthdayList(TWO_GROUPS, testMeasurers);

		expect(readTexts(page, 'geracao')).toEqual(['Gerado em 27/10/2026']);
	});
});

describe('TU-28 birthday groups', () => {
	it('shows the day and the weekday once per group and each name on its own element', () => {
		const [page] = layoutBirthdayList(TWO_GROUPS, testMeasurers);

		expect(readTexts(page, 'dia')).toEqual(['03', '07']);
		expect(readTexts(page, 'diaSemana')).toEqual(['TER', 'SÁB']);
		expect(readTexts(page, 'nome')).toEqual([
			'ANA CLARA DOS SANTOS',
			'JOSÉ CARLOS MOREIRA',
			'MARIA DAS GRAÇAS LIMA (in memoriam)',
		]);
	});

	it('aligns the day with the first name and the weekday with the second', () => {
		const [page] = layoutBirthdayList(TWO_GROUPS, testMeasurers);

		const [day] = findTexts(page, 'dia');
		const [weekday] = findTexts(page, 'diaSemana');
		const [firstName, secondName] = findTexts(page, 'nome');
		expect(day.top).toBe(firstName.top);
		expect(weekday.top).toBeGreaterThanOrEqual(secondName.top);
		expect(weekday.top).toBeLessThan(boundsOf(secondName).bottom);
	});

	it('shows only the day for 29/02 when the reference year is not a leap year', () => {
		const document = createBirthdayDocument([{ ...BASE_PERSON, dia: 29 }], createCalendarMonth(2027, 2));

		const [page] = layoutBirthdayList(document, testMeasurers);

		expect(readTexts(page, 'dia')).toEqual(['29']);
		expect(readTexts(page, 'diaSemana')).toEqual([]);
	});

	it('separates the groups with a rule between them', () => {
		const [page] = layoutBirthdayList(TWO_GROUPS, testMeasurers);

		const [firstDay, secondDay] = findTexts(page, 'dia');
		const firstGroup = listTexts(page).filter((text) => text.top >= firstDay.top && text.top < secondDay.top);
		const separators = listSeparatorTops(page);
		expect(separators).toHaveLength(1);
		expect(separators[0]).toBeGreaterThan(bottomOf(firstGroup));
		expect(separators[0]).toBeLessThan(secondDay.top);
	});
});

describe('TU-29 correction notice', () => {
	it('closes the last page with the full notice below the last group', () => {
		const pages = layoutBirthdayList(createBirthdayDocument(FULL_MONTH_PEOPLE), testMeasurers);

		const lastPage = pages[pages.length - 1];
		const [notice] = findTexts(lastPage, 'aviso');
		expect(pages.flatMap((page) => readTexts(page, 'aviso'))).toEqual([CORRECTION_NOTICE]);
		expect(notice.top).toBeGreaterThanOrEqual(bottomOf(findTexts(lastPage, 'nome')));
	});
});
