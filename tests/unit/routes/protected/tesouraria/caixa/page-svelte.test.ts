import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/caixa/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const pendingEntry = (identrada: number, valor: string, descricao: string) => ({
	identrada,
	descricao,
	dataEntrada: new Date('2026-09-01T00:00:00Z'),
	valor,
	depositado: false as const,
	uuid: `uuid-${identrada}`,
	contribuinte: 'ANA',
	idcontribuinte: 7,
	trabalhador: true,
});

const renderCash = (entradas: ReturnType<typeof pendingEntry>[]) =>
	parseRenderedBody(render(Page, { props: { data: { entradas } } }).body);

describe('tesouraria cash page', () => {
	it('lists each pending entry already selected for the deposit confirmation', () => {
		const document = renderCash([pendingEntry(12, '30.00', 'Mensalidade'), pendingEntry(13, '20.50', 'Doação')]);

		const checkboxes = [...document.querySelectorAll('tbody input[type="checkbox"][name="entradas"]')];
		const form = document.querySelector('form');

		expect(checkboxes.map((checkbox) => checkbox.getAttribute('value'))).toEqual(['12', '13']);
		expect(checkboxes.every((checkbox) => checkbox.hasAttribute('checked'))).toBe(true);
		expect(checkboxes.every((checkbox) => checkbox.getAttribute('form') === form?.id)).toBe(true);
		expect(document.querySelector('tbody tr')?.textContent).toContain('MENSALIDADE');
		expect(document.querySelector('tbody tr')?.textContent).toContain('01/09/2026');
	});

	it('sums the pending entries in the table footer', () => {
		const document = renderCash([pendingEntry(12, '30.00', 'Mensalidade'), pendingEntry(13, '20.50', 'Doação')]);

		expect(document.querySelector('tfoot')?.textContent).toContain('Total');
		expect(document.querySelector('tfoot')?.textContent).toMatch(/R\$\s50,50/);
	});

	it('tells that nothing awaits deposit and offers no confirmation', () => {
		const document = renderCash([]);

		expect(document.querySelector('[role="status"]')?.textContent).toBe('Nenhuma entrada aguardando depósito.');
		expect(document.querySelector('table')).toBeNull();
		expect(document.querySelector('form')).toBeNull();
	});

	it('labels each pending entry checkbox with its receipt number', () => {
		const document = renderCash([pendingEntry(12, '30.00', 'Mensalidade')]);

		const checkbox = document.querySelector('tbody input[type="checkbox"]');

		expect(checkbox?.getAttribute('aria-label')).toBe('Incluir recibo nº 12 no depósito');
	});

	it.each([
		[
			'the confirmed deposit',
			{ status: 201, message: 'Depósito confirmado com sucesso.' },
			'Depósito confirmado com sucesso.',
		],
		['a deposit conflict', { message: 'Lançamento já depositado.' }, 'Lançamento já depositado.'],
		[
			'an invalid selection',
			{ values: { entradas: [] }, errors: { entradas: ['Seleção de lançamentos inválida.'] } },
			'Seleção de lançamentos inválida.',
		],
	])('notifies %s', (_scenario, form, message) => {
		const { body } = render(Page, { props: { data: { entradas: [] }, form } });
		const document = parseRenderedBody(body);

		expect(document.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe(message);
	});

	it('submits the confirmation by POST with an idle loading state', () => {
		const document = renderCash([pendingEntry(12, '30.00', 'Mensalidade')]);

		const button = document.querySelector('form button[type="submit"]');

		expect(document.querySelector('form')?.getAttribute('method')).toBe('POST');
		expect(button?.textContent?.trim()).toBe('Confirmar depósito');
		expect(button?.getAttribute('aria-busy')).toBe('false');
	});
});
