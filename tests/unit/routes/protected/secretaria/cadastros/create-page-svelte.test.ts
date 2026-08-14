import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/novo/+page.svelte';

describe('new secretaria registration page', () => {
	it('renders field constraints, a default worker flag, and every validation error', () => {
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

		expect(body).toContain('maxlength="60" required');
		expect(body).toContain('for="cpf"');
		expect(body).toContain('maxlength="14"');
		expect(body).toContain('maxlength="15"');
		expect(body).toContain('maxlength="9"');
		expect(body).toContain('name="aniversario" id="aniversario" value="2024-02-29"');
		expect(body).toContain('aria-describedby="cpf-errors"');
		expect(body).toContain('Nome do trabalhador inválido.');
		expect(body).toContain('CPF inválido.');
		expect(body).toContain('RG inválido.');
		expect(body).toContain('Data de aniversário inválida.');
		expect(body).not.toContain('name="trab" id="trab" value="true" checked');
	});

	it('checks the worker flag by default and renders creation success for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('name="trab" id="trab" value="true" checked');
		expect(body).toContain('Trabalhador cadastrado com sucesso!');
	});
});
