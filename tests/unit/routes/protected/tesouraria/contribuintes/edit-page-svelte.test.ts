import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.svelte';

const data = { contribuinte: { nome: 'MARIA', telefone: null, trab: true } };

describe('tesouraria contributor edit page', () => {
	it('retains submitted values and renders accessible field errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '', telefone: '123', trab: 'false' },
					errors: { nome: ['Nome do contribuinte é obrigatório.'], telefone: ['Telefone inválido.'] },
				},
			},
		});

		expect(body).toContain('value="" autocomplete="name"');
		expect(body).toContain('value="123" maxlength="15" inputmode="tel"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-describedby="telefone-errors"');
		expect(body).toContain('Nome do contribuinte é obrigatório.');
		expect(body).toContain('Telefone inválido.');
	});

	it('uses the stored worker state and renders update success for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('name="trab" id="trab" value="true" checked');
		expect(body).toContain('Contribuinte atualizado com sucesso!');
	});
});
