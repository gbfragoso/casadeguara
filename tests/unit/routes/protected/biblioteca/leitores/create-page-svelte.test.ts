import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('new reader page', () => {
	it('renders constraints, status controls, and validation feedback', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: 'Maria', cpf: '', rg: '', status: 'false' },
					errors: { nome: ['Nome do leitor inválido.'], cpf: ['CPF inválido.'], rg: ['RG inválido.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const nome = getRenderedInput(document, 'input[name="nome"]');
		const cpf = getRenderedInput(document, 'input[name="cpf"]');
		const rg = getRenderedInput(document, 'input[name="rg"]');
		const cep = getRenderedInput(document, 'input[name="cep"]');
		const status = getRenderedInput(document, 'input[type="checkbox"][name="status"]');

		expect(nome.maxLength).toBe(60);
		expect(nome.required).toBe(true);
		expect(cpf.maxLength).toBe(14);
		expect(rg.maxLength).toBe(12);
		expect(cep.maxLength).toBe(9);
		expect(cpf.getAttribute('inputmode')).toBe('numeric');
		expect(document.querySelector('label[for="cpf"]')).not.toBeNull();
		expect(cpf.getAttribute('aria-describedby')).toBe('cpf-errors');
		expect(document.querySelectorAll('#nome-errors p, #cpf-errors p, #rg-errors p')).toHaveLength(3);
		expect(status.value).toBe('true');
		expect(status.checked).toBe(false);
	});

	it('checks the active status by default and renders creation success', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);
		const status = getRenderedInput(document, 'input[type="checkbox"][name="status"]');

		expect(status.value).toBe('true');
		expect(status.checked).toBe(true);
		expect(document.body.textContent).toContain('Leitor cadastrado com sucesso!');
	});
});
