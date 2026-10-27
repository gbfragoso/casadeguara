import { describe, expect, it } from 'vitest';

import type { ProgramPageLayout } from '#lib/server/pdf/talk-program/elements.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { listTexts, readTexts } from './support/layout-queries';
import {
	createProgramDocument,
	FULL_MONTH_TALKS,
	TYPICAL_MONTH_TALKS,
	testMeasurers,
} from './support/program-fixtures';

const ENTRY_ROLES = new Set(['dia', 'diaSemana', 'horario', 'titulo', 'observacao', 'palestrante']);

const readTalkNumbers = (page: ProgramPageLayout, role: 'titulo' | 'observacao') =>
	readTexts(page, role).map((text) => text.match(/\d{2}/)?.[0]);

const listTextStyles = (page: ProgramPageLayout) =>
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

	it('continues a full month on the following pages without splitting a talk', () => {
		const document = createProgramDocument(FULL_MONTH_TALKS);

		const pages = layoutTalkProgram(document, testMeasurers);

		const pageCount = pages.length;
		const expectedNumbers = FULL_MONTH_TALKS.map((_, index) => String(index + 1).padStart(2, '0'));
		expect(pageCount).toBeGreaterThan(1);
		expect(pages.map((page) => readTexts(page, 'geracao'))).toEqual(
			pages.map((_, index) => [`Gerado em 27/10/2026 · Página ${index + 1} de ${pageCount}`]),
		);
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
