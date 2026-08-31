import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('new tesouraria contributor page', () => {
	it('renders constraints, worker control, and validation feedback', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: 'Maria', telefone: '123', trab: 'false' },
					errors: {
						nome: ['Nome do contribuinte inválido.'],
						telefone: ['Telefone inválido.'],
						trab: ['Trabalhador inválido.'],
					},
				},
			},
		});
		const document = parseRenderedBody(body);
		const nome = getRenderedInput(document, 'input[name="nome"]');
		const telefone = getRenderedInput(document, 'input[name="telefone"]');
		const trab = getRenderedInput(document, 'input[type="checkbox"][name="trab"]');

		expect(nome.maxLength).toBe(60);
		expect(nome.required).toBe(true);
		expect(telefone.maxLength).toBe(15);
		expect(telefone.getAttribute('inputmode')).toBe('tel');
		expect(telefone.getAttribute('autocomplete')).toBe('tel-national');
		expect(telefone.getAttribute('aria-describedby')).toBe('telefone-errors');
		expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(3);
		expect(trab.value).toBe('true');
		expect(trab.checked).toBe(false);
	});

	it('renders creation success for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Contribuinte cadastrado com sucesso!');
	});
});
