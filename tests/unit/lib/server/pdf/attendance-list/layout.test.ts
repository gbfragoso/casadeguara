import { describe, expect, it } from 'vitest';

import { ATTENDANCE_NOTICE } from '#lib/attendance/format.js';
import type { SheetBoxElement, SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { layoutAttendanceList } from '#lib/server/pdf/attendance-list/layout.js';
import { boundsOf, listRules, listTexts, readTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import {
	createAttendanceDocument,
	createWorkers,
	FIFTEEN_DATES,
	LONGEST_REGISTERED_NAME,
} from './support/attendance-fixtures';

const REFERENCE_WORKER_COUNT = 181;
const NOVEMBER_COLUMNS = ['Nome', '02', '03', '05', '09', '10', '12', '16', '17', '19', '23', '24', '26', '30'];

const layoutWorkers = (workers: string[], dates?: string[]) =>
	layoutAttendanceList(createAttendanceDocument(workers, dates), testMeasurers);

const listNames = <Role extends string>(page: SheetPageLayout<Role>) =>
	listTexts(page).filter(({ role }) => role === 'nome');

const listBoxes = ({ elements }: SheetPageLayout, role: SheetBoxElement['role']) =>
	elements.filter((element): element is SheetBoxElement => element.kind === 'box' && element.role === role);

describe('layoutAttendanceList', () => {
	it('TU-11 shows "Nome" and the two-digit days in the table header of every page', () => {
		const pages = layoutWorkers(createWorkers(REFERENCE_WORKER_COUNT));

		expect(pages.map((page) => readTexts(page, 'coluna'))).toEqual(pages.map(() => NOVEMBER_COLUMNS));
	});

	it('TU-12 shows the notice only on the first page, below the header and above the table', () => {
		const pages = layoutWorkers(createWorkers(REFERENCE_WORKER_COUNT));

		const [notice] = listTexts(pages[0]).filter(({ role }) => role === 'aviso');
		const [tableHeading] = listTexts(pages[0]).filter(({ role }) => role === 'coluna');
		const [headerRule] = listRules(pages[0], 'filete');
		expect(pages.map((page) => readTexts(page, 'aviso'))).toEqual([[ATTENDANCE_NOTICE], [], [], [], []]);
		expect(notice.top).toBeGreaterThan(boundsOf(headerRule).bottom);
		expect(boundsOf(notice).bottom).toBeLessThanOrEqual(tableHeading.top);
	});

	it('TU-13 numbers the pages of a multi-page list in the footer', () => {
		const pages = layoutWorkers(createWorkers(REFERENCE_WORKER_COUNT));

		expect(pages.map((page) => readTexts(page, 'geracao'))).toEqual(
			pages.map((_, index) => [`Gerado em 02/11/2026 · Página ${index + 1} de ${pages.length}`]),
		);
	});

	it('TU-14 fits 181 workers and 13 dates in 5 pages with one line per name', () => {
		const pages = layoutWorkers(createWorkers(REFERENCE_WORKER_COUNT));

		const names = pages.map(listNames);
		expect(names.map((pageNames) => pageNames.length)).toEqual([41, 43, 43, 43, 11]);
		expect(names.flat().every(({ lines }) => lines.length === 1)).toBe(true);
	});

	it('TU-15 fits the longest registered name at 8 pt or more with 15 dates', () => {
		const [page] = layoutWorkers([LONGEST_REGISTERED_NAME], FIFTEEN_DATES);

		const [name] = listNames(page);
		expect(name.lines).toEqual([LONGEST_REGISTERED_NAME]);
		expect(name.size).toBeGreaterThanOrEqual(8);
		expect(testMeasurers.regular.widthOfTextAtSize(name.lines[0], name.size)).toBeLessThanOrEqual(name.width);
	});

	it('TU-18 bands the even rows across the table, before their names', () => {
		const [page] = layoutWorkers(createWorkers(4), FIFTEEN_DATES.slice(0, 3));

		const names = listNames(page);
		const bands = listBoxes(page, 'faixa');
		expect(bands.map(({ top }) => top)).toEqual([names[1].top, names[3].top]);
		expect(bands.map((band) => page.elements.indexOf(band))).toEqual(
			[names[1], names[3]].map((name) => page.elements.indexOf(name) - 1),
		);
	});

	it('TU-18 draws one checkbox per date inside each worker row', () => {
		const [page] = layoutWorkers(createWorkers(4), FIFTEEN_DATES.slice(0, 3));

		const rows = listNames(page).map(boundsOf);
		const checkboxes = listBoxes(page, 'marcacao').map(boundsOf);
		expect(checkboxes).toHaveLength(12);
		expect(
			rows.map((row) => checkboxes.filter(({ top, bottom }) => top > row.top && bottom < row.bottom).length),
		).toEqual([3, 3, 3, 3]);
	});
});
