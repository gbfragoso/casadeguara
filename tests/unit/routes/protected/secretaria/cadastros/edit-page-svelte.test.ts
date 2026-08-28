import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.svelte';

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
	it('renders masks, blank replacement inputs, null birthdays, and accessible removal controls', () => {
		const { body } = render(Page, {
			props: {
				data: { id: 4, trabalhador: { ...trabalhador, hasPhoto: true } },
				form: {
					values: { rg: '', cpf: '' },
					errors: { cpf: ['CPF inválido.'], removeCpf: ['CPF inválido.'] },
				},
			},
		});

		expect(body).toContain('RG cadastrado: 12.***.***-89');
		expect(body).toContain('CPF cadastrado: 123.***.***-09');
		expect(body).toContain('name="cpf" id="cpf" value=""');
		expect(body).toContain('name="rg" id="rg" value=""');
		expect(body).toContain('for="removeCpf"');
		expect(body).toContain('for="removeRg"');
		expect(body).toContain('name="aniversario" id="aniversario" value=""');
		expect(body).toContain('aria-describedby="cpf-errors"');
		expect(body).toContain('CPF inválido.');
		expect(body).toContain('src="/secretaria/cadastros/4/foto"');
		expect(body).not.toContain('12345678909');
	});

	it('renders a valid birthday without timezone conversion and update success for status 200', () => {
		const { body } = render(Page, {
			props: {
				data: { id: 4, trabalhador: { ...trabalhador, aniversario: '2024-02-29' } },
				form: { status: 200 },
			},
		});

		expect(body).toContain('name="aniversario" id="aniversario" value="2024-02-29"');
		expect(body).toContain('Trabalhador atualizado com sucesso!');
	});

	it('renders submitted values and validation states for every editable field', () => {
		const { body } = render(Page, {
			props: {
				data: {
					id: 4,
					trabalhador: {
						...trabalhador,
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
					},
				},
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
						nome: ['Nome invÃ¡lido.'],
						rg: ['RG invÃ¡lido.'],
						removeRg: ['NÃ£o foi possÃ­vel remover o RG.'],
						cpf: ['CPF invÃ¡lido.'],
						removeCpf: ['NÃ£o foi possÃ­vel remover o CPF.'],
						aniversario: ['Data invÃ¡lida.'],
						email: ['E-mail invÃ¡lido.'],
						celular: ['Celular invÃ¡lido.'],
						telefone: ['WhatsApp invÃ¡lido.'],
						logradouro: ['Logradouro invÃ¡lido.'],
						bairro: ['Bairro invÃ¡lido.'],
						complemento: ['Complemento invÃ¡lido.'],
						cidade: ['Cidade invÃ¡lida.'],
						cep: ['CEP invÃ¡lido.'],
						trab: ['Status invÃ¡lido.'],
					},
				},
			},
		});

		expect(body).toContain('value="MARIA NOVA"');
		expect(body).toContain('value="nova@example.com"');
		expect(body).toContain('value="false"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('NÃ£o foi possÃ­vel remover o CPF.');
		expect(body).toContain('RG cadastrado: Não informado.');
		expect(body).toContain('CPF cadastrado: Não informado.');
	});
});
