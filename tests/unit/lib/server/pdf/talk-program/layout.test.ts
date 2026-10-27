import { describe, expect, it } from 'vitest';

import type { SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { SHEET_PALETTE } from '#lib/server/pdf/sheet/palette.js';
import { layoutTalkProgram } from '#lib/server/pdf/talk-program/layout.js';
import { ENTRY_STYLES } from '#lib/server/pdf/talk-program/typography.js';
import { contrastRatio } from '../../../../../support/contrast';
import { listTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import { BASE_TALK, createProgramDocument } from './support/program-fixtures';

const MINIMUM_TEXT_CONTRAST = 4.5;
const WHITE = '#ffffff';

const DATE_ROLES = new Set(['dia', 'diaSemana', 'horario']);
const ENTRY_TEXT_ROLES = new Set(['titulo', 'observacao', 'palestrante', 'local']);

const bottomOf = (element: SheetTextElement) => element.top + element.lines.length * element.lineHeight;

const spanOf = (elements: SheetTextElement[]) => ({
	top: Math.min(...elements.map(({ top }) => top)),
	bottom: Math.max(...elements.map(bottomOf)),
});

const heightOf = (elements: SheetTextElement[]) => spanOf(elements).bottom - spanOf(elements).top;

const centerOf = (elements: SheetTextElement[]) => (spanOf(elements).top + spanOf(elements).bottom) / 2;

describe('layoutTalkProgram', () => {
	it('centers the date and the text of an entry on the same line', () => {
		const document = createProgramDocument([{ ...BASE_TALK, observacoes: null }]);

		const [page] = layoutTalkProgram(document, testMeasurers);

		const texts = listTexts(page);
		const date = texts.filter(({ role }) => DATE_ROLES.has(role));
		const entryText = texts.filter(({ role }) => ENTRY_TEXT_ROLES.has(role));
		expect(heightOf(date)).not.toBe(heightOf(entryText));
		expect(centerOf(entryText)).toBeCloseTo(centerOf(date));
	});

	it('writes the entry texts in readable sheet colors', () => {
		const ratios = Object.values(ENTRY_STYLES).map(({ color }) => contrastRatio(SHEET_PALETTE[color], WHITE));

		expect(Math.min(...ratios)).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
	});
});
