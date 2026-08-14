import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/novo/+page.svelte';

describe('new tesouraria contributor page', () => {
	it('renders constraints, every field error, and an unchecked worker flag by default', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: 'Maria', telefone: '123', trab: 'false' },
					errors: {
						nome: ['Nome do contribuinte inválido.'],
						telefone: ['Telefone inválido.'],
						trab: ['Trabalhador inválido.'],
					},
				},
			},
		});

		expect(body).toContain('maxlength="60" required');
		expect(body).toContain('maxlength="15" inputmode="tel" autocomplete="tel-national"');
		expect(body).toContain('aria-describedby="telefone-errors"');
		expect(body).toContain('Nome do contribuinte inválido.');
		expect(body).toContain('Telefone inválido.');
		expect(body).toContain('Trabalhador inválido.');
		expect(body).toContain('name="trab" value="false"');
		expect(body).not.toContain('name="trab" id="trab" value="true" checked');
	});

	it('renders creation success for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('Contribuinte cadastrado com sucesso!');
	});
});
