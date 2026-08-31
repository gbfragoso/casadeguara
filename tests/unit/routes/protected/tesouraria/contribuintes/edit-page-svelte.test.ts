import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = { contribuinte: { nome: 'MARIA', telefone: null, trab: true } };

describe('tesouraria contributor edit page', () => {
	it('retains submitted values and renders accessible field errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '', telefone: '123', trab: 'false' },
					errors: { nome: ['Nome obrigatório.'], telefone: ['Telefone inválido.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const nome = getRenderedInput(document, 'input[name="nome"]');
		const telefone = getRenderedInput(document, 'input[name="telefone"]');

		expect(nome.value).toBe('');
		expect(nome.autocomplete).toBe('name');
		expect(telefone.value).toBe('123');
		expect(telefone.maxLength).toBe(15);
		expect(nome.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(telefone.getAttribute('aria-describedby')).toBe('telefone-errors');
		expect(document.querySelectorAll('#nome-errors p, #telefone-errors p')).toHaveLength(2);
	});

	it('uses the stored worker state and renders update success for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);
		const trab = getRenderedInput(document, 'input[type="checkbox"][name="trab"]');

		expect(trab.value).toBe('true');
		expect(trab.checked).toBe(true);
		expect(document.body.textContent).toContain('Contribuinte atualizado com sucesso!');
	});
});
