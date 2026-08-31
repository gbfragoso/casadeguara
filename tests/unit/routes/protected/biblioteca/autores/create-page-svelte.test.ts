import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

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
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome do autor inválido.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain(
			'Nome do autor excede o limite de caracteres.',
		);
	});

	it('renders the successful creation notification', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Autor cadastrado com sucesso!');
	});
});
