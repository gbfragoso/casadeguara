import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const page = {
	items: [
		{
			id: 12,
			tipo: 'entrada' as const,
			descricao: 'Mensalidade',
			valor: '100.00',
			dataLancamento: '2026-09-01',
			contraparte: { id: 1, nome: 'Ana' },
			depositado: true,
			reciboUuid: 'uuid-entry',
			dataRegistro: '2026-09-01',
		},
		{
			id: 13,
			tipo: 'saida' as const,
			descricao: 'Material',
			valor: '25.00',
			dataLancamento: '2026-09-01',
			contraparte: null,
			depositado: null,
			reciboUuid: null,
			dataRegistro: null,
		},
	],
	totais: { entradas: '100.00', saidas: '25.00' },
};

describe('lancamentos list page', () => {
	it('identifies both types and exposes a receipt only for entries', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Tesouraria',
					userid: 'u',
					page,
					values: { tipo: 'todos' },
					isAdmin: false,
				},
			},
		});
		const document = parseRenderedBody(body);
		const rows = [...document.querySelectorAll('tbody tr')];

		expect(rows[0]?.textContent).toContain('Entrada');
		expect(rows[1]?.textContent).toContain('Despesa');
		expect(rows[0]?.textContent).toContain('01/09/2026');
		expect(rows[0]?.querySelector('a[href*="/recibo/"]')).not.toBeNull();
		expect(rows[1]?.querySelector('a[href*="/recibo/"]')).toBeNull();
		expect(document.querySelectorAll('a[title="Estorno"]')).toHaveLength(2);
		expect(document.querySelector('input[name="contraparte"]')).not.toBeNull();
		expect(document.querySelector('nav[aria-label="Paginação de lançamentos"]')).toBeNull();
		expect(document.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe('false');
		expect(document.body.textContent).not.toContain('Editar');
		expect(document.body.textContent).not.toContain('Excluir');
	});

	it('renders an accessible empty state', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Tesouraria',
					userid: 'u',
					page: { ...page, items: [], totais: { entradas: '0', saidas: '0' } },
					values: {},
					isAdmin: false,
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('[role="status"]')?.textContent).toContain('Nenhum lançamento encontrado.');
	});
});
