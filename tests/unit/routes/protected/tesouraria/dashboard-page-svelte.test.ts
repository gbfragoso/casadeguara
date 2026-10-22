import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/tesouraria/+page.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

const monthlyTotals = Array.from({ length: 12 }, (_, index) => ({
	competencia: `2025-${String(index + 1).padStart(2, '0')}`,
	entradas: index === 11 ? '120.00' : '0',
	saidas: index === 11 ? '30.00' : '0',
}));

describe('tesouraria dashboard page', () => {
	it('preserves the five indicators and places the monthly chart after them', () => {
		const { body } = render(Page, {
			props: {
				data: {
					entradaMesAtual: [{ count: 2, median: 60, value: '120.00' }],
					saidaMesAtual: [{ value: '30.00' }],
					lancamentosMensais: monthlyTotals,
				},
			},
		});
		const document = parseRenderedBody(body);

		const indicators = document.querySelector('[data-testid="indicadores"]');
		const chart = document.querySelector('[role="region"]');
		expect(indicators?.children).toHaveLength(5);
		expect(indicators?.textContent).toContain('Total');
		expect(indicators?.textContent).toContain('Saldo');
		expect(chart && indicators?.nextElementSibling?.contains(chart)).toBe(true);
		expect(chart?.querySelector('h2')?.textContent).toContain('12 meses');
		expect(chart?.querySelector('details')).toBeNull();
		expect(chart?.querySelector('[aria-live]')).toBeNull();
	});

	it('leads with the amount received, expenses and balance before the donation statistics', () => {
		const { body } = render(Page, {
			props: {
				data: {
					entradaMesAtual: [{ count: 2, median: 60, value: '120.00' }],
					saidaMesAtual: [{ value: '30.00' }],
					lancamentosMensais: monthlyTotals,
				},
			},
		});
		const document = parseRenderedBody(body);

		const labels = [...document.querySelectorAll('[data-testid="indicadores"] > article > p')].map((label) =>
			label.textContent?.trim(),
		);

		expect(labels).toEqual(['Valor recebido', 'Despesas', 'Saldo', 'Total de doações', 'Valor médio']);
	});

	it('shows a negative balance when expenses exceed donations', () => {
		const { body } = render(Page, {
			props: {
				data: {
					entradaMesAtual: [{ count: 2, median: 115.25, value: '230.50' }],
					saidaMesAtual: [{ value: '275.25' }],
					lancamentosMensais: monthlyTotals,
				},
			},
		});
		const document = parseRenderedBody(body);

		const balance = [...document.querySelectorAll('[data-testid="indicadores"] > *')].find((indicator) =>
			indicator.textContent?.includes('Saldo'),
		);

		expect(balance?.querySelector('h2')?.textContent).toMatch(/-R\$\s44,75/);
	});

	it.each([
		['an even', '30.00', /R\$\s0,00/],
		['a positive', '10.00', /R\$\s20,00/],
	])('shows %s balance of the month', (_scenario, expenses, balance) => {
		const { body } = render(Page, {
			props: {
				data: {
					entradaMesAtual: [{ count: 1, median: 30, value: '30.00' }],
					saidaMesAtual: [{ value: expenses }],
					lancamentosMensais: monthlyTotals,
				},
			},
		});
		const document = parseRenderedBody(body);

		const indicator = [...document.querySelectorAll('[data-testid="indicadores"] > *')].find((element) =>
			element.textContent?.includes('Saldo'),
		);

		expect(indicator?.querySelector('h2')?.textContent).toMatch(balance);
	});
});
