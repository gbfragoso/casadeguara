import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('new secretaria registration page', () => {
	it('renders field constraints, worker control, and validation feedback', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: 'Maria', cpf: '', rg: '', trab: 'false', aniversario: '2024-02-29' },
					errors: {
						nome: ['Nome do trabalhador inválido.'],
						cpf: ['CPF inválido.'],
						rg: ['RG inválido.'],
						aniversario: ['Data de aniversário inválida.'],
					},
				},
			},
		});
		const document = parseRenderedBody(body);
		const nome = getRenderedInput(document, 'input[name="nome"]');
		const cpf = getRenderedInput(document, 'input[name="cpf"]');
		const rg = getRenderedInput(document, 'input[name="rg"]');
		const aniversario = getRenderedInput(document, 'input[name="aniversario"]');
		const trab = getRenderedInput(document, 'input[name="trab"]');

		expect(nome.maxLength).toBe(60);
		expect(nome.required).toBe(true);
		expect(document.querySelector('label[for="cpf"]')).not.toBeNull();
		expect(cpf.maxLength).toBe(14);
		expect(rg.maxLength).toBe(12);
		expect(getRenderedInput(document, 'input[name="cep"]').maxLength).toBe(9);
		expect(aniversario.value).toBe('2024-02-29');
		expect(cpf.getAttribute('aria-describedby')).toBe('cpf-errors');
		expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(4);
		expect(trab.checked).toBe(false);
	});

	it('checks the worker flag by default and renders creation success', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);
		const trab = getRenderedInput(document, 'input[type="checkbox"][name="trab"]');

		expect(trab.checked).toBe(true);
		expect(document.body.textContent).toContain('Trabalhador cadastrado com sucesso!');
	});
});
