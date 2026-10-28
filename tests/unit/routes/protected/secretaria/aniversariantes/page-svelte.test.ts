import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { CORRECTION_NOTICE } from '#lib/birthdays/format.js';
import Page from '../../../../../../src/routes/(protected)/secretaria/aniversariantes/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

type PageForm = ComponentProps<typeof Page>['form'];

const PAGE_DATA = { username: 'secretaria@example.com', userid: 'user-1', isAdmin: false, hoje: '2026-10-27' };
const MARIA = { id: 31, nome: 'Maria', dia: 15, desencarnado: false };

const renderPage = (form: PageForm = null) =>
	parseRenderedBody(render(Page, { props: { data: PAGE_DATA, form } }).body);

const readText = (element: { textContent: string | null } | null | undefined) =>
	element?.textContent?.replace(/\s+/g, ' ').trim();

describe('TU-35 birthday page offers both actions', () => {
	it('offers the twelve months with the current month selected', () => {
		const document = renderPage();

		const options = [...document.querySelectorAll('select[name="mes"] option')];

		expect(options.map((option) => option.getAttribute('value'))).toEqual([
			'01',
			'02',
			'03',
			'04',
			'05',
			'06',
			'07',
			'08',
			'09',
			'10',
			'11',
			'12',
		]);
		expect(document.querySelector('select[name="mes"] option[selected]')?.getAttribute('value')).toBe('10');
	});

	it('offers to generate the list and the PDF', () => {
		const document = renderPage();

		const buttons = [...document.querySelectorAll('form button')].map((button) => readText(button));

		expect(buttons).toEqual(['Gerar lista', 'Gerar PDF']);
	});

	it('keeps the searched month selected after generating the list', () => {
		const document = renderPage({ leitores: [], mes: '07', ano: 2027 });

		expect(document.querySelector('select[name="mes"] option[selected]')?.getAttribute('value')).toBe('07');
	});
});

describe('TU-36 birthday table uses the reference year', () => {
	const searchJanuary = (desencarnado = false) =>
		renderPage({ leitores: [{ ...MARIA, desencarnado }], mes: '01', ano: 2027 });

	it('titles the list with the month in Portuguese and the reference year', () => {
		const document = searchJanuary();

		expect(readText(document.querySelector('#printable-content h2'))).toBe('Aniversariantes do mês janeiro / 2027');
	});

	it('shows the birthday as day and month', () => {
		const document = searchJanuary();

		expect(readText(document.querySelector('#printable-content tbody tr'))).toBe('MARIA 15/01');
	});

	it('marks deceased readers in memoriam', () => {
		const document = searchJanuary(true);

		expect(readText(document.querySelector('#printable-content tbody tr td'))).toBe('MARIA (IN MEMORIAM)');
	});

	it('asks for corrections below the list', () => {
		const document = searchJanuary();

		expect(readText(document.querySelector('#printable-content p'))).toBe(CORRECTION_NOTICE);
	});

	it('tells that no worker has a birthday in the searched month', () => {
		const document = renderPage({ leitores: [], mes: '02', ano: 2027 });

		expect(document.querySelector('#printable-content')).toBeNull();
		expect(readText(document.querySelector('[role="status"]'))).toBe(
			'Nenhum aniversariante encontrado em fevereiro.',
		);
	});
});
