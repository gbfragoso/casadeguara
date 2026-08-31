import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const trabalhador = {
	nome: 'MARIA',
	rgMask: null,
	cpfMask: null,
	email: 'maria@example.com',
	celular: '71999999999',
	telefone: '7133333333',
	logradouro: 'Rua das Flores',
	bairro: 'Centro',
	complemento: 'Casa 2',
	cidade: 'Salvador',
	cep: '40000000',
	aniversario: null,
	trab: true,
	hasPhoto: false,
};

describe('secretaria registration field states', () => {
	it('renders submitted values and validation states for every editable field', () => {
		const { body } = render(Page, {
			props: {
				data: { id: 4, trabalhador },
				form: {
					values: {
						nome: 'MARIA NOVA',
						rg: '123456789',
						cpf: '12345678909',
						aniversario: '1990-01-02',
						email: 'nova@example.com',
						celular: '71988888888',
						telefone: '7132222222',
						logradouro: 'Avenida Central',
						bairro: 'Brotas',
						complemento: 'Apartamento 3',
						cidade: 'Lauro de Freitas',
						cep: '42700000',
						trab: 'false',
						removeRg: 'true',
						removeCpf: 'true',
					},
					errors: {
						nome: ['Nome inválido.'],
						rg: ['RG inválido.'],
						removeRg: ['Não foi possível remover o RG.'],
						cpf: ['CPF inválido.'],
						removeCpf: ['Não foi possível remover o CPF.'],
						aniversario: ['Data inválida.'],
						email: ['E-mail inválido.'],
						celular: ['Celular inválido.'],
						telefone: ['WhatsApp inválido.'],
						logradouro: ['Logradouro inválido.'],
						bairro: ['Bairro inválido.'],
						complemento: ['Complemento inválido.'],
						cidade: ['Cidade inválida.'],
						cep: ['CEP inválido.'],
						trab: ['Status inválido.'],
					},
				},
			},
		});
		const document = parseRenderedBody(body);
		const submittedValues = {
			nome: 'MARIA NOVA',
			aniversario: '1990-01-02',
			email: 'nova@example.com',
			celular: '71988888888',
			telefone: '7132222222',
			logradouro: 'Avenida Central',
			bairro: 'Brotas',
			complemento: 'Apartamento 3',
			cidade: 'Lauro de Freitas',
			cep: '42700000',
		};
		for (const [name, value] of Object.entries(submittedValues)) {
			expect(getRenderedInput(document, `input[name="${name}"]`).value).toBe(value);
		}

		expect(getRenderedInput(document, 'input[type="hidden"][name="trab"]').value).toBe('false');
		expect(getRenderedInput(document, 'input[type="checkbox"][name="trab"]').checked).toBe(false);
		expect(document.querySelectorAll('[aria-invalid="true"]').length).toBeGreaterThan(10);
		expect(document.querySelector('#removeCpf-errors')?.textContent).toContain('Não foi possível remover o CPF.');
		expect(document.body.textContent).toContain('RG cadastrado: Não informado.');
		expect(document.body.textContent).toContain('CPF cadastrado: Não informado.');
	});
});
