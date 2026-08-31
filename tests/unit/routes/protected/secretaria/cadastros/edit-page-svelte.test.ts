import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const trabalhador = {
	nome: 'MARIA',
	rgMask: '12.***.***-89',
	cpfMask: '123.***.***-09',
	email: null,
	celular: null,
	telefone: null,
	logradouro: null,
	bairro: null,
	complemento: null,
	cidade: null,
	cep: null,
	aniversario: null,
	trab: true,
	hasPhoto: false,
};

describe('edit secretaria registration page', () => {
	it('renders masks, blank replacement inputs, null birthday, and removal controls', () => {
		const { body } = render(Page, {
			props: {
				data: { id: 4, trabalhador: { ...trabalhador, hasPhoto: true } },
				form: { values: { rg: '', cpf: '' }, errors: { cpf: ['CPF inválido.'], removeCpf: ['CPF inválido.'] } },
			},
		});
		const document = parseRenderedBody(body);
		const cpf = getRenderedInput(document, 'input[name="cpf"]');
		const rg = getRenderedInput(document, 'input[name="rg"]');
		const aniversario = getRenderedInput(document, 'input[name="aniversario"]');

		expect(document.body.textContent).toContain('RG cadastrado: 12.***.***-89');
		expect(document.body.textContent).toContain('CPF cadastrado: 123.***.***-09');
		expect(cpf.value).toBe('');
		expect(rg.value).toBe('');
		expect(aniversario.value).toBe('');
		expect(document.querySelector('label[for="removeCpf"]')).not.toBeNull();
		expect(document.querySelector('label[for="removeRg"]')).not.toBeNull();
		expect(cpf.getAttribute('aria-describedby')).toBe('cpf-errors');
		expect(document.querySelector('img[src="/secretaria/cadastros/4/foto"]')).not.toBeNull();
		expect(document.body.textContent).not.toContain('12345678909');
	});

	it('renders a valid birthday without timezone conversion and update success', () => {
		const { body } = render(Page, {
			props: {
				data: { id: 4, trabalhador: { ...trabalhador, aniversario: '2024-02-29' } },
				form: { status: 200 },
			},
		});
		const document = parseRenderedBody(body);

		expect(getRenderedInput(document, 'input[name="aniversario"]').value).toBe('2024-02-29');
		expect(document.body.textContent).toContain('Trabalhador atualizado com sucesso!');
	});
});
