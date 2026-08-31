import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = { keyword: { idkeyword: 4, chave: 'FICÇÃO ORIGINAL' } };

describe('edit keyword page', () => {
	it('renders the loaded keyword when no value was submitted', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="chave"]');

		expect(input.value).toBe('FICÇÃO ORIGINAL');
		expect(input.maxLength).toBe(30);
		expect(input.required).toBe(true);
		expect(document.querySelector('nav a[aria-current="page"]')?.textContent).toBe('Palavras-chave');
	});

	it('keeps an explicitly empty submitted value and all errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { chave: '' },
					errors: { chave: ['Palavra-chave é obrigatória.', 'Palavra-chave inválida.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="chave"]');

		expect(input.value).toBe('');
		expect(input.getAttribute('aria-describedby')).toBe('chave-errors');
		expect(document.querySelector('#chave-errors')?.textContent).toContain('Palavra-chave é obrigatória.');
		expect(document.querySelector('#chave-errors')?.textContent).toContain('Palavra-chave inválida.');
	});

	it('renders the successful update notification for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Palavra-chave atualizada com sucesso!');
	});
});
