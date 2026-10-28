import { describe, expect, it } from 'vitest';

import { groupBirthdays } from '#lib/server/pdf/birthday-list/content.js';
import { createCalendarMonth } from '#lib/utils/calendar-month.js';
import { BASE_PERSON, createBirthdayDocument } from './support/birthday-fixtures';

describe('TU-24 groupBirthdays', () => {
	it('groups the people by day in ascending order, keeping the received order of names', () => {
		const document = createBirthdayDocument([
			{ ...BASE_PERSON, id: 1, nome: 'Ana Clara dos Santos', dia: 7 },
			{ ...BASE_PERSON, id: 2, nome: 'Bruno Lima', dia: 15 },
			{ ...BASE_PERSON, id: 3, nome: 'José Carlos Moreira', dia: 7 },
			{ ...BASE_PERSON, id: 4, nome: 'Áurea Souza', dia: 7 },
		]);

		const groups = groupBirthdays(document);

		expect(groups.map(({ dia, nomes }) => ({ dia, nomes }))).toEqual([
			{ dia: '07', nomes: ['ANA CLARA DOS SANTOS', 'JOSÉ CARLOS MOREIRA', 'ÁUREA SOUZA'] },
			{ dia: '15', nomes: ['BRUNO LIMA'] },
		]);
	});
});

describe('TU-25 birthday names', () => {
	it('writes the trimmed and normalized name in upper case', () => {
		const document = createBirthdayDocument([{ ...BASE_PERSON, nome: '  Maria das Graças '.normalize('NFD') }]);

		const [group] = groupBirthdays(document);

		expect(group.nomes).toEqual(['MARIA DAS GRAÇAS']);
	});

	it('marks a deceased person with a lower-case in memoriam suffix', () => {
		const document = createBirthdayDocument([{ ...BASE_PERSON, nome: 'Maria das Graças', desencarnado: true }]);

		const [group] = groupBirthdays(document);

		expect(group.nomes).toEqual(['MARIA DAS GRAÇAS (in memoriam)']);
	});

	it('carries no birth year, age or photo', () => {
		const document = createBirthdayDocument([BASE_PERSON]);

		const [group] = groupBirthdays(document);

		expect(Object.keys(group)).toEqual(['dia', 'diaSemana', 'nomes']);
	});
});

describe('TU-26 weekday in the reference year', () => {
	it.each([
		{ date: '03/11/2026', month: createCalendarMonth(2026, 11), dia: 3, expected: 'TER' },
		{ date: '29/02/2027', month: createCalendarMonth(2027, 2), dia: 29, expected: null },
		{ date: '29/02/2028', month: createCalendarMonth(2028, 2), dia: 29, expected: 'TER' },
	])('shows $expected for $date', ({ month, dia, expected }) => {
		const document = createBirthdayDocument([{ ...BASE_PERSON, dia }], month);

		const [group] = groupBirthdays(document);

		expect(group.diaSemana).toBe(expected);
	});
});
