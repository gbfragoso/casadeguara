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

		expect(document.querySelectorAll('.mt-2.columns > .column')).toHaveLength(5);
		expect(document.querySelector('.mt-2.columns')?.textContent).toContain('Total');
		expect(document.querySelector('.mt-2.columns')?.textContent).toContain('Saldo');
		expect(document.querySelector('.mt-2.columns + .card [role="region"]')).not.toBeNull();
		expect(document.querySelector('[role="region"] h2')?.textContent).toContain('12 meses');
		expect(document.querySelector('[role="region"] details')).toBeNull();
		expect(document.querySelector('[role="region"] .selection')).toBeNull();
	});
});
