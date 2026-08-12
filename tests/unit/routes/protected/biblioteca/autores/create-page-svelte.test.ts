import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/novo/+page.svelte';

describe('new author page', () => {
	it('renders failed values, constraints, and every field error', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: '123' },
					errors: { nome: ['Nome do autor inválido.', 'Nome do autor excede o limite de caracteres.'] },
				},
			},
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('maxlength="60" required');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Nome do autor inválido.');
		expect(body).toContain('Nome do autor excede o limite de caracteres.');
	});

	it('renders the successful creation notification', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('Autor cadastrado com sucesso!');
	});
});
