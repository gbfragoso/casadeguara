import { describe, expect, it } from 'vitest';

import type { SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { listTexts, readTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import {
	createProgramDocument,
	FOURTEEN_TALKS,
	FULL_MONTH_TALKS,
	TYPICAL_MONTH_TALKS,
} from './support/program-fixtures';

const ENTRY_ROLES = new Set(['dia', 'diaSemana', 'horario', 'titulo', 'observacao', 'palestrante']);

const readTalkNumbers = (page: SheetPageLayout, role: 'titulo' | 'observacao') =>
	readTexts(page, role).map((text) => text.match(/\d{2}/)?.[0]);

const listTextStyles = (page: SheetPageLayout) =>
	new Set(
		listTexts(page)
			.filter(({ role }) => ENTRY_ROLES.has(role))
			.map(({ role, size, lineHeight, weight }) => `${role} ${size}/${lineHeight} ${weight}`),
	);

describe('talk program pagination', () => {
	it('fits 12 typical talks on a single sheet', () => {
		const document = createProgramDocument(TYPICAL_MONTH_TALKS);

		const pages = layoutTalkProgram(document, testMeasurers);

		expect(pages).toHaveLength(1);
		expect(readTexts(pages[0], 'titulo')).toEqual(TYPICAL_MONTH_TALKS.map(({ titulo }) => titulo));
	});

	it('fits 14 one-line talks with upper-case titles on a single sheet', () => {
		const document = createProgramDocument(FOURTEEN_TALKS);

		const pages = layoutTalkProgram(document, testMeasurers);

		expect(pages).toHaveLength(1);
		expect(readTexts(pages[0], 'titulo')).toEqual(FOURTEEN_TALKS.map(({ titulo }) => titulo));
	});

	it('continues a full month on the following pages without splitting a talk', () => {
		const document = createProgramDocument(FULL_MONTH_TALKS);

		const pages = layoutTalkProgram(document, testMeasurers);

		const expectedNumbers = FULL_MONTH_TALKS.map((_, index) => String(index + 1).padStart(2, '0'));
		expect(pages.length).toBeGreaterThan(1);
		expect(pages.flatMap((page) => readTalkNumbers(page, 'titulo'))).toEqual(expectedNumbers);
		expect(pages.map((page) => readTalkNumbers(page, 'observacao'))).toEqual(
			pages.map((page) => readTalkNumbers(page, 'titulo')),
		);
		expect(pages.map((page) => readTexts(page, 'palestrante').length)).toEqual(
			pages.map((page) => readTexts(page, 'titulo').length),
		);
		expect(pages.map(listTextStyles)).toEqual(pages.map(() => listTextStyles(pages[0])));
	});
});
