import { describe, expect, it } from 'vitest';

import { layoutBirthdayList } from '#lib/server/pdf/birthday-list/layout.js';
import type { SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { BODY_TOP } from '#lib/server/pdf/sheet/typography.js';
import { capTopOf, drawnLeftOf, lastBaselineOf, listRules, listTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import { BASE_PERSON, createBirthdayDocument } from './support/birthday-fixtures';

const GROUP_ROLES = ['dia', 'diaSemana', 'nome'];

const ONE_THEN_TWO_NAMES = createBirthdayDocument([
	{ ...BASE_PERSON, id: 1, nome: 'Ana Clara dos Santos', dia: 1 },
	{ ...BASE_PERSON, id: 2, nome: 'Bruno Lima', dia: 7 },
	{ ...BASE_PERSON, id: 3, nome: 'José Carlos Moreira', dia: 7 },
	{ ...BASE_PERSON, id: 4, nome: 'Maria das Graças Lima', dia: 9 },
]);

const measureGroupSpaces = (page: SheetPageLayout, top: number, bottom: number) => {
	const texts = listTexts(page).filter(
		({ role, top: textTop }) => GROUP_ROLES.includes(role) && textTop >= top && textTop < bottom,
	);
	return {
		above: Math.min(...texts.map((text) => capTopOf(text))) - top,
		below: bottom - Math.max(...texts.map(lastBaselineOf)),
	};
};

describe('birthday list alignment', () => {
	it('starts the day where the rules start', () => {
		const [page] = layoutBirthdayList(ONE_THEN_TWO_NAMES, testMeasurers);

		const [day] = listTexts(page).filter(({ role }) => role === 'dia');
		expect(drawnLeftOf(day)).toBeCloseTo(listRules(page, 'separador')[0].x);
	});
});

describe('birthday list spacing', () => {
	it('leaves the same space above and below groups of one and of two names', () => {
		const [page] = layoutBirthdayList(ONE_THEN_TWO_NAMES, testMeasurers);

		const [first, second] = listRules(page, 'separador').map(({ y }) => y);
		const spaces = [measureGroupSpaces(page, BODY_TOP, first), measureGroupSpaces(page, first, second)];
		spaces.forEach(({ below }) => expect(below).toBeCloseTo(spaces[0].above));
		expect(spaces[1].above).toBeCloseTo(spaces[0].above);
	});
});
