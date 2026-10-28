import { describe, expect, it } from 'vitest';

import { toProgramEntryContent, type ProgramEntryContent } from '#lib/server/pdf/talk-program/content.js';
import type { SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { BODY_BOTTOM, BODY_TOP } from '#lib/server/pdf/sheet/typography.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { boundsOf, intersects, listTexts, readTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import {
	BASE_TALK,
	createProgramDocument,
	LEGACY_LIMIT_TALK,
	LONG_WORST_CASE_TALK,
	WIDE_WORST_CASE_TALK,
} from './support/program-fixtures';

const ENTRY_TEXT_ROLES = ['titulo', 'observacao', 'palestrante', 'local'] as const;

const withoutSpaces = (text: string | null) => (text ?? '').replace(/\s/g, '');

const readRenderedEntry = (page: SheetPageLayout) =>
	ENTRY_TEXT_ROLES.map((role) => withoutSpaces(readTexts(page, role).join('')));

const readExpectedEntry = (content: ProgramEntryContent) =>
	ENTRY_TEXT_ROLES.map((role) => withoutSpaces(content[role]));

const listOverflowingLines = (page: SheetPageLayout) =>
	listTexts(page).flatMap((text) =>
		text.lines.filter((line) => testMeasurers[text.weight].widthOfTextAtSize(line, text.size) > text.width),
	);

const findCollisions = ({ elements }: SheetPageLayout) =>
	elements.flatMap((element, index) =>
		elements
			.slice(index + 1)
			.filter((other) => intersects(boundsOf(element), boundsOf(other)))
			.map((other) => `${element.kind} × ${other.kind}`),
	);

const isEntryText = (role: string) => !['instituicao', 'cabecalho', 'mes', 'rodape', 'geracao'].includes(role);

const listEntryBounds = (page: SheetPageLayout) =>
	listTexts(page)
		.filter(({ role }) => isEntryText(role))
		.map(boundsOf);

describe('talk program worst cases', () => {
	it.each([
		{ name: 'wide characters', talk: WIDE_WORST_CASE_TALK },
		{ name: 'long realistic texts', talk: LONG_WORST_CASE_TALK },
	])('wraps long texts without clipping or overlap: $name', ({ talk }) => {
		const document = createProgramDocument([talk]);

		const [page] = layoutTalkProgram(document, testMeasurers);

		expect(listOverflowingLines(page)).toEqual([]);
		expect(findCollisions(page)).toEqual([]);
		expect(readRenderedEntry(page)).toEqual(readExpectedEntry(toProgramEntryContent(talk)));
	});

	it('fits a realistic 70-character upper-case title on one line', () => {
		const titulo = LONG_WORST_CASE_TALK.titulo.toLocaleUpperCase('pt-BR');
		const document = createProgramDocument([{ ...LONG_WORST_CASE_TALK, titulo }]);

		const [page] = layoutTalkProgram(document, testMeasurers);

		expect(listTexts(page).find(({ role }) => role === 'titulo')?.lines).toEqual([titulo]);
	});

	it('fits a legacy talk at the database limits on one sheet', () => {
		const document = createProgramDocument([LEGACY_LIMIT_TALK]);

		const pages = layoutTalkProgram(document, testMeasurers);

		const entryBounds = listEntryBounds(pages[0]);
		expect(pages).toHaveLength(1);
		expect(readRenderedEntry(pages[0])).toEqual(readExpectedEntry(toProgramEntryContent(LEGACY_LIMIT_TALK)));
		expect(Math.min(...entryBounds.map(({ top }) => top))).toBeGreaterThanOrEqual(BODY_TOP);
		expect(Math.max(...entryBounds.map(({ bottom }) => bottom))).toBeLessThanOrEqual(BODY_BOTTOM);
	});
});

const readObservationLines = (page: SheetPageLayout) =>
	listTexts(page).find(({ role }) => role === 'observacao')?.lines;

describe('talk program observation line breaks', () => {
	it('keeps each typed line of an observation on its own line', () => {
		const document = createProgramDocument([
			{ ...BASE_TALK, observacoes: 'Tema: O perdão\r\n\nTrazer o Evangelho' },
		]);

		const [page] = layoutTalkProgram(document, testMeasurers);

		expect(readObservationLines(page)).toEqual(['Tema: O perdão', 'Trazer o Evangelho']);
	});

	it('joins the typed lines when keeping them would push the talk past the sheet body', () => {
		const document = createProgramDocument([{ ...BASE_TALK, observacoes: 'Item 1.\n'.repeat(62) }]);

		const pages = layoutTalkProgram(document, testMeasurers);

		const entryBounds = listEntryBounds(pages[0]);
		expect(pages).toHaveLength(1);
		expect(readObservationLines(pages[0])?.length).toBeLessThan(62);
		expect(Math.max(...entryBounds.map(({ bottom }) => bottom))).toBeLessThanOrEqual(BODY_BOTTOM);
	});
});
