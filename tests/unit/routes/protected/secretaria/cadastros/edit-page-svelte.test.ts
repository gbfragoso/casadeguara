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
};

describe('edit secretaria registration page', () => {
	it('renders masks, blank replacement inputs, null birthdays, and accessible removal controls', () => {
		const { body } = render(Page, {
			props: {
				data: { trabalhador },
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
		expect(body).not.toContain('12345678909');
	});

	it('renders a valid birthday without timezone conversion and update success for status 200', () => {
		const { body } = render(Page, {
			props: { data: { trabalhador: { ...trabalhador, aniversario: '2024-02-29' } }, form: { status: 200 } },
		});

		expect(body).toContain('name="aniversario" id="aniversario" value="2024-02-29"');
		expect(body).toContain('Trabalhador atualizado com sucesso!');
	});
});
