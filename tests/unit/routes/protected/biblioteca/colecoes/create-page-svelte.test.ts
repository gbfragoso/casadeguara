import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/colecoes/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('new collection page', () => {
	it('renders submitted values, constraints, and field errors', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { nome: '123' },
					errors: {
						nome: [
							'Nome da coleção é obrigatório.',
							'Nome da coleção inválido.',
							'Nome da coleção excede o limite de caracteres.',
						],
					},
				},
			},
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da coleção é obrigatório.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da coleção inválido.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain(
			'Nome da coleção excede o limite de caracteres.',
		);
		expect(document.querySelector('nav a[aria-current="page"]')?.textContent).toBe('Coleções');
	});

	it('renders the successful creation notification for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Coleção cadastrada com sucesso!');
	});
});
