import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/keywords/novo/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('new keyword page', () => {
	it('renders submitted values, constraints, and field errors', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { chave: '123' },
					errors: { chave: ['Palavra-chave inválida.', 'Palavra-chave excede o limite de caracteres.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="chave"]');

		expect(input.value).toBe('123');
		expect(input.maxLength).toBe(30);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#chave-errors')?.textContent).toContain('Palavra-chave inválida.');
		expect(document.querySelector('#chave-errors')?.textContent).toContain(
			'Palavra-chave excede o limite de caracteres.',
		);
		expect(document.querySelector('nav a[aria-current="page"]')?.textContent).toBe('Palavras-chave');
	});

	it('renders the successful creation notification for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Palavra-chave cadastrada com sucesso!');
	});
});
