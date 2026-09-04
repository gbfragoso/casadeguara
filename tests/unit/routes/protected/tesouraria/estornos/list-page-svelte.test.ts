import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/estornos/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const page = {
	items: [
		{
			id: 12,
			tipo: 'entrada' as const,
			contraparte: { id: 1, nome: 'Árvore' },
			descricao: 'Mensalidade',
			valor: '100.00',
			dataLancamento: '2026-09-01',
			motivo: 'Correção',
			usuario: 'admin',
			dataEstorno: '2026-09-02',
		},
	],
};

describe('estornos list page', () => {
	it('uses textual counterpart filtering without pagination and formats civil dates', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Admin',
					userid: 'admin',
					page,
					values: { tipo: 'todos', contraparte: 'arvore' },
					isAdmin: true,
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('input[name="contraparte"]')).not.toBeNull();
		expect(document.querySelector('select[name="contraparte"]')).toBeNull();
		expect(document.querySelector('[name="contraparteId"]')).toBeNull();
		expect(document.querySelector('nav[aria-label="Paginação de estornos"]')).toBeNull();
		expect(document.querySelector('tbody tr')?.textContent).toContain('01/09/2026');
		expect(document.querySelector('tbody tr')?.textContent).toContain('02/09/2026');
		expect(document.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe('false');
	});

	it('retains submitted filters and displays validation feedback', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { tipo: 'entrada', contraparte: 'Ana', descricao: 'Taxa', lancamentoFim: '2026-09-01' },
					errors: { lancamentoFim: ['Data final inválida.'] },
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('input[name="contraparte"]')?.getAttribute('value')).toBe('Ana');
		expect(document.querySelector('input[name="descricao"]')?.getAttribute('value')).toBe('Taxa');
		expect(document.querySelector('input[name="contraparte"]')?.getAttribute('aria-invalid')).toBe('false');
		expect(document.querySelector('[role="alert"]')?.textContent).toContain('Data final inválida.');
	});

	it('shows an explicit empty state after a search with no reversals', () => {
		const { body } = render(Page, {
			props: {
				data: { username: 'Admin', userid: 'admin', page: { items: [] }, values: {}, isAdmin: true },
			},
		});
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Nenhum estorno encontrado.');
		expect(document.querySelector('tbody')).toBeNull();
	});

	it('renders only the search form before a search is submitted', () => {
		const { body } = render(Page, {
			props: { form: null },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('form[action="?/pesquisar"]')).not.toBeNull();
		expect(document.querySelector('tbody')).toBeNull();
		expect(document.querySelector('[role="status"]')).toBeNull();
	});
});
