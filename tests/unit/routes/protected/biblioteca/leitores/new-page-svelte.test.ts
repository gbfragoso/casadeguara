import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/novo/+page.svelte';

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
						nome: ['Nome invÃ¡lido.'],
						rg: ['RG invÃ¡lido.'],
						cpf: ['CPF invÃ¡lido.'],
						email: ['E-mail invÃ¡lido.'],
						celular: ['Celular invÃ¡lido.'],
						telefone: ['Telefone invÃ¡lido.'],
						logradouro: ['Logradouro invÃ¡lido.'],
						bairro: ['Bairro invÃ¡lido.'],
						complemento: ['Complemento invÃ¡lido.'],
						cidade: ['Cidade invÃ¡lida.'],
						cep: ['CEP invÃ¡lido.'],
						trab: ['Trabalhador invÃ¡lido.'],
						status: ['Status invÃ¡lido.'],
					},
				},
			},
		});

		expect(body).toContain('value="Maria da Silva"');
		expect(body).toContain('name="trab" id="trab" value="true" checked');
		expect(body).toContain('name="status" id="status" value="true"');
		expect(body).toContain('Nome invÃ¡lido.');
		expect(body).toContain('Status invÃ¡lido.');
	});

	it('shows the confirmation after a successful creation', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('Leitor cadastrado com sucesso!');
	});
});
