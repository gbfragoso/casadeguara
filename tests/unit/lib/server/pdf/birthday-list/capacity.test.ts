import { describe, expect, it } from 'vitest';

import { groupBirthdays } from '#lib/server/pdf/birthday-list/content.js';
import { layoutBirthdayList } from '#lib/server/pdf/birthday-list/layout.js';
import type { SheetPageLayout } from '#lib/server/pdf/sheet/elements.js';
import { boundsOf, intersects, listTexts, readTexts } from '../sheet/support/layout-queries';
import { testMeasurers } from '../sheet/support/measurers';
import {
	BASE_PERSON,
	createBirthdayDocument,
	FULL_MONTH_PEOPLE,
	MAY_2027,
	MAY_PROFILE_PEOPLE,
	WIDE_DESENCARNADO,
} from './support/birthday-fixtures';

const MINIMUM_NAME_SIZE = 12;
const MINIMUM_DETAIL_SIZE = 10;
const GROUP_ROLES = ['dia', 'diaSemana', 'nome'];
const BODY_ROLES = [...GROUP_ROLES, 'aviso'];

const FULL_MONTH = createBirthdayDocument(FULL_MONTH_PEOPLE);

const readPageNames = (page: SheetPageLayout) => readTexts(page, 'nome');

const readExpectedNames = (page: SheetPageLayout) => {
	const days = new Set(readTexts(page, 'dia'));
	return groupBirthdays(FULL_MONTH)
		.filter(({ dia }) => days.has(dia))
		.flatMap(({ nomes }) => nomes);
};

const listTextSizes = (page: SheetPageLayout, roles = BODY_ROLES) =>
	new Set(
		listTexts(page)
			.filter(({ role }) => roles.includes(role))
			.map(({ role, size, lineHeight, weight }) => `${role} ${size}/${lineHeight} ${weight}`),
	);

const readSmallestSize = (pages: SheetPageLayout[], roles: string[]) =>
	Math.min(...pages.flatMap(listTexts).flatMap(({ role, size }) => (roles.includes(role) ? [size] : [])));

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

const withoutSpaces = (text: string) => text.replace(/\s/g, '');

describe('TU-30 May profile', () => {
	it('fits 26 people in 16 days on a single sheet with the notice', () => {
		const document = createBirthdayDocument(MAY_PROFILE_PEOPLE, MAY_2027);

		const pages = layoutBirthdayList(document, testMeasurers);

		expect(pages).toHaveLength(1);
		expect(readTexts(pages[0], 'nome')).toHaveLength(MAY_PROFILE_PEOPLE.length);
		expect(readTexts(pages[0], 'aviso')).toHaveLength(1);
	});
});

describe('TU-31 full month', () => {
	it('continues on the following pages, each with the header and its page number', () => {
		const pages = layoutBirthdayList(FULL_MONTH, testMeasurers);

		expect(pages.length).toBeGreaterThan(1);
		expect(pages.map((page) => readTexts(page, 'cabecalho'))).toEqual(pages.map(() => ['ANIVERSARIANTES DO MÊS']));
		expect(pages.map((page) => readTexts(page, 'geracao'))).toEqual(
			pages.map((_, index) => [`Gerado em 27/10/2026 · Página ${index + 1} de ${pages.length}`]),
		);
	});

	it('keeps every group whole and lists each person once', () => {
		const pages = layoutBirthdayList(FULL_MONTH, testMeasurers);

		expect(pages.map(readPageNames)).toEqual(pages.map(readExpectedNames));
		expect(pages.flatMap(readPageNames)).toEqual(groupBirthdays(FULL_MONTH).flatMap(({ nomes }) => nomes));
	});

	it('keeps the notice with the last group on the last page', () => {
		const pages = layoutBirthdayList(FULL_MONTH, testMeasurers);

		const lastPage = pages[pages.length - 1];
		expect(pages.map((page) => readTexts(page, 'aviso').length)).toEqual(
			pages.map((_, index) => (index === pages.length - 1 ? 1 : 0)),
		);
		expect(readTexts(lastPage, 'dia').at(-1)).toBe('30');
	});

	it('uses the same text sizes on every page', () => {
		const pages = layoutBirthdayList(FULL_MONTH, testMeasurers);

		const groupSizes = pages.map((page) => listTextSizes(page, GROUP_ROLES));
		expect(groupSizes).toEqual(pages.map(() => groupSizes[0]));
	});
});

describe('TU-32 long names', () => {
	it('wraps a wide deceased name without clipping or overlap', () => {
		const document = createBirthdayDocument([
			WIDE_DESENCARNADO,
			{ ...BASE_PERSON, dia: 7 },
			{ ...BASE_PERSON, id: 2, dia: 8 },
		]);

		const [page] = layoutBirthdayList(document, testMeasurers);

		const [wideName] = listTexts(page).filter(({ role }) => role === 'nome');
		expect(wideName.lines.length).toBeGreaterThan(1);
		expect(listOverflowingLines(page)).toEqual([]);
		expect(findCollisions(page)).toEqual([]);
		expect(withoutSpaces(wideName.lines.join(''))).toBe(
			withoutSpaces(`${WIDE_DESENCARNADO.nome.toLocaleUpperCase('pt-BR')} (in memoriam)`),
		);
	});
});

describe('TU-33 fixed text sizes', () => {
	it('keeps names at 12 pt or more and the weekday and the notice at 10 pt or more', () => {
		const pages = layoutBirthdayList(FULL_MONTH, testMeasurers);

		expect(readSmallestSize(pages, ['nome'])).toBeGreaterThanOrEqual(MINIMUM_NAME_SIZE);
		expect(readSmallestSize(pages, ['diaSemana', 'aviso'])).toBeGreaterThanOrEqual(MINIMUM_DETAIL_SIZE);
	});

	it('uses the same sizes for one person and for a full month', () => {
		const single = layoutBirthdayList(createBirthdayDocument([BASE_PERSON]), testMeasurers);
		const full = layoutBirthdayList(FULL_MONTH, testMeasurers);

		expect(listTextSizes(single[0])).toEqual(new Set(full.flatMap((page) => [...listTextSizes(page)])));
	});
});
