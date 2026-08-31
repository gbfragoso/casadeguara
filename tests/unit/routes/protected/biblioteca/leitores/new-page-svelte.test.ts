import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const values = {
	nome: 'Maria da Silva',
	rg: '',
	cpf: '',
	email: 'maria@example.test',
	celular: '71987654321',
	telefone: '7133333333',
	logradouro: 'Rua das Flores',
	bairro: 'Centro',
	complemento: 'Casa 1',
	cidade: 'Salvador',
	cep: '40000000',
	trab: 'true',
	status: 'false',
};

describe('new reader page', () => {
	it('preserves submitted values and validation errors', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values,
					errors: {
						nome: ['Nome inválido.'],
						rg: ['RG inválido.'],
						cpf: ['CPF inválido.'],
						email: ['E-mail inválido.'],
						celular: ['Celular inválido.'],
						telefone: ['Telefone inválido.'],
						logradouro: ['Logradouro inválido.'],
						bairro: ['Bairro inválido.'],
						complemento: ['Complemento inválido.'],
						cidade: ['Cidade inválida.'],
						cep: ['CEP inválido.'],
						trab: ['Trabalhador inválido.'],
						status: ['Status inválido.'],
					},
				},
			},
		});
		const document = parseRenderedBody(body);
		const nome = getRenderedInput(document, 'input[name="nome"]');
		const trab = getRenderedInput(document, 'input[type="checkbox"][name="trab"]');
		const status = getRenderedInput(document, 'input[type="checkbox"][name="status"]');

		expect(nome.value).toBe('Maria da Silva');
		expect(trab.value).toBe('true');
		expect(trab.checked).toBe(true);
		expect(status.value).toBe('true');
		expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(13);
		expect(document.querySelector('#status-errors')?.textContent).toContain('Status inválido.');
	});

	it('shows the confirmation after a successful creation', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Leitor cadastrado com sucesso!');
	});
});
