import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/editoras/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('new publisher page', () => {
	it('renders failed values, constraints, and every field error', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: '123' },
					errors: { nome: ['Nome da editora inválido.', 'Nome da editora excede o limite de caracteres.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da editora inválido.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain(
			'Nome da editora excede o limite de caracteres.',
		);
	});

	it('renders the successful creation notification', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Editora cadastrada com sucesso!');
	});
});
