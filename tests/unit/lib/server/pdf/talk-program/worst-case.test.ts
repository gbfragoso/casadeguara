import { describe, expect, it } from 'vitest';

import { toProgramEntryContent, type ProgramEntryContent } from '#lib/server/pdf/talk-program/content.js';
import type { ProgramPageLayout } from '#lib/server/pdf/talk-program/elements.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { BODY_BOTTOM, BODY_TOP } from '#lib/server/pdf/talk-program/typography.js';
import { boundsOf, intersects, listTexts, readTexts } from './support/layout-queries';
import {
	createProgramDocument,
	LEGACY_LIMIT_TALK,
	LONG_WORST_CASE_TALK,
	testMeasurers,
	WIDE_WORST_CASE_TALK,
} from './support/program-fixtures';

const ENTRY_TEXT_ROLES = ['titulo', 'observacao', 'palestrante', 'local'] as const;

const withoutSpaces = (text: string | null) => (text ?? '').replace(/\s/g, '');

const readRenderedEntry = (page: ProgramPageLayout) =>
	ENTRY_TEXT_ROLES.map((role) => withoutSpaces(readTexts(page, role).join('')));

const readExpectedEntry = (content: ProgramEntryContent) =>
	ENTRY_TEXT_ROLES.map((role) => withoutSpaces(content[role]));

const listOverflowingLines = (page: ProgramPageLayout) =>
	listTexts(page).flatMap((text) =>
		text.lines.filter((line) => testMeasurers[text.weight].widthOfTextAtSize(line, text.size) > text.width),
	);

const findCollisions = ({ elements }: ProgramPageLayout) =>
	elements.flatMap((element, index) =>
		elements
			.slice(index + 1)
			.filter((other) => intersects(boundsOf(element), boundsOf(other)))
			.map((other) => `${element.kind} × ${other.kind}`),
	);

const isEntryText = (role: string) => !['instituicao', 'cabecalho', 'mes', 'rodape', 'geracao'].includes(role);

const listEntryBounds = (page: ProgramPageLayout) =>
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
