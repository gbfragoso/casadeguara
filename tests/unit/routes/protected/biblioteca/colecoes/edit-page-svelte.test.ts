import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = { colecao: { idserie: 4, nome: 'FICÇÃO ORIGINAL' } };

describe('edit collection page', () => {
	it('renders the loaded collection when no value was submitted', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('FICÇÃO ORIGINAL');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(true);
		expect(document.querySelector('nav a[aria-current="page"]')?.textContent).toBe('Coleções');
	});

	it('keeps an explicitly empty submitted value and all errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '' },
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

		expect(input.value).toBe('');
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da coleção é obrigatório.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da coleção inválido.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain(
			'Nome da coleção excede o limite de caracteres.',
		);
	});

	it('renders the successful update notification for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Coleção atualizada com sucesso!');
	});
});
