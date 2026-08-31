import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('tesouraria contributor list page', () => {
	it('renders the initial searchable form without an edit action', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.autocomplete).toBe('name');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(false);
		expect(document.querySelector('a[aria-label="Editar contribuinte"]')).toBeNull();
	});

	it('retains search values and renders associated validation feedback', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do contribuinte inválido.'] } } },
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome do contribuinte inválido.');
	});

	it('renders result rows and a Portuguese empty state after a search', () => {
		const { body: resultBody } = render(Page, {
			props: {
				form: {
					contribuintes: [{ idleitor: 7, nome: 'ANA', telefone: '7133333333', trab: true }],
					values: { nome: 'Ana' },
				},
			},
		});
		const { body: emptyBody } = render(Page, { props: { form: { contribuintes: [], values: { nome: 'Ana' } } } });
		const result = parseRenderedBody(resultBody);
		const empty = parseRenderedBody(emptyBody);

		expect(result.querySelector('tbody tr td')?.textContent).toBe('ANA');
		expect(result.querySelector('tbody tr td:nth-child(2)')?.textContent).toBe('7133333333');
		expect(result.querySelector('tbody tr td:nth-child(3)')?.textContent).toBe('Trabalhador');
		expect(empty.body.textContent).toContain('Nenhum contribuinte encontrado.');
	});
});
