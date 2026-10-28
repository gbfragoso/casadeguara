import { describe, expect, it } from 'vitest';

import type { SheetPageLayout, SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { BODY_TOP } from '#lib/server/pdf/sheet/typography.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { ENTRY_LINE_GAP } from '#lib/server/pdf/talk-program/typography.js';
import {
	baselineOf,
	capTopOf,
	drawnLeftOf,
	lastBaselineOf,
	listRules,
	listTexts,
} from '../sheet/support/layout-queries';
import { measureDeepestDescender, measureTallestAccentedCapital } from '../sheet/support/glyph-extents';
import { testMeasurers } from '../sheet/support/measurers';
import { BASE_TALK, createProgramDocument } from './support/program-fixtures';

const DATE_ROLES = ['dia', 'diaSemana', 'horario'];
const TEXT_ROLES = ['titulo', 'observacao', 'palestrante', 'local'];
const TWO_LINE_TITLE =
	'Ninguém pode ver o reino de Deus se não nascer de novo: a reencarnação e o progresso do Espírito';

const TWO_TALKS = createProgramDocument([BASE_TALK, { ...BASE_TALK, id: 413, data: '2026-11-09' }]);

const findTexts = (page: SheetPageLayout, roles: string[]) =>
	listTexts(page).filter(({ role }) => roles.includes(role));

const readFirstSeparator = (page: SheetPageLayout) => listRules(page, 'separador')[0];

const findFirstEntryTexts = (page: SheetPageLayout, roles: string[]) =>
	findTexts(page, roles).filter(({ top }) => top < readFirstSeparator(page).y);

const listLines = (elements: SheetTextElement[]) =>
	elements.flatMap((element) => element.lines.map((_, index) => ({ element, index })));

describe('talk program alignment', () => {
	it('starts the widest date line where the rules start', () => {
		const [page] = layoutTalkProgram(TWO_TALKS, testMeasurers);

		const dateLefts = findFirstEntryTexts(page, DATE_ROLES).map((element) => drawnLeftOf(element));
		expect(Math.min(...dateLefts)).toBeCloseTo(readFirstSeparator(page).x);
	});

	it('starts the talk text where the header text starts', () => {
		const [page] = layoutTalkProgram(TWO_TALKS, testMeasurers);

		const [title] = findTexts(page, ['titulo']);
		const [heading] = findTexts(page, ['cabecalho']);
		expect(title.x).toBe(heading.x);
	});

	it('keeps every date text on one line', () => {
		const [page] = layoutTalkProgram(TWO_TALKS, testMeasurers);

		const dateTexts = findTexts(page, DATE_ROLES);

		dateTexts.forEach((element) => expect(element.lines).toHaveLength(1));
	});
});

describe('talk program spacing', () => {
	it('leaves the same space above the title as below the last text line', () => {
		const [page] = layoutTalkProgram(TWO_TALKS, testMeasurers);

		const texts = findFirstEntryTexts(page, TEXT_ROLES);
		const spaceAbove = capTopOf(texts[0]) - BODY_TOP;
		const spaceBelow = readFirstSeparator(page).y - lastBaselineOf(texts[texts.length - 1]);
		expect(spaceAbove).toBeCloseTo(spaceBelow);
	});

	it('separates every line of a talk with the same gap', () => {
		const document = createProgramDocument([{ ...BASE_TALK, titulo: TWO_LINE_TITLE }]);

		const [page] = layoutTalkProgram(document, testMeasurers);

		const lines = listLines(findTexts(page, TEXT_ROLES));
		const gaps = lines.slice(1).map(({ element, index }, position) => {
			const previous = lines[position];
			return capTopOf(element, index) - baselineOf(previous.element, previous.index);
		});
		expect(lines.length).toBeGreaterThanOrEqual(4);
		gaps.forEach((gap) => expect(gap).toBeCloseTo(ENTRY_LINE_GAP));
	});

	it('keeps the descenders of a title line clear of the accented capitals below it', () => {
		const document = createProgramDocument([{ ...BASE_TALK, titulo: TWO_LINE_TITLE }]);

		const [page] = layoutTalkProgram(document, testMeasurers);

		const [title] = findTexts(page, ['titulo']);
		const reach = measureDeepestDescender(title) + measureTallestAccentedCapital(title);
		expect(title.lines.length).toBeGreaterThan(1);
		expect(title.lineHeight).toBeGreaterThan(reach);
	});
});
