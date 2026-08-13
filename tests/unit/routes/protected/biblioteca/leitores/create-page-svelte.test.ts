import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/novo/+page.svelte';

describe('new reader page', () => {
	it('renders the form constraints, a default active status, and every validation error', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: 'Maria', cpf: '', rg: '', status: 'false' },
					errors: { nome: ['Nome do leitor inválido.'], cpf: ['CPF inválido.'], rg: ['RG inválido.'] },
				},
			},
		});

		expect(body).toContain('maxlength="60" required');
		expect(body).toContain('for="cpf"');
		expect(body).toContain('maxlength="14"');
		expect(body).toContain('maxlength="15"');
		expect(body).toContain('maxlength="9"');
		expect(body).toContain('inputmode="numeric"');
		expect(body).toContain('aria-describedby="cpf-errors"');
		expect(body).toContain('Nome do leitor inválido.');
		expect(body).toContain('CPF inválido.');
		expect(body).toContain('RG inválido.');
		expect(body).toContain('name="status" value="false"');
		expect(body).not.toContain('name="status" id="status" value="true" checked');
	});

	it('checks the active status by default and renders creation success for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('name="status" id="status" value="true" checked');
		expect(body).toContain('Leitor cadastrado com sucesso!');
	});
});
