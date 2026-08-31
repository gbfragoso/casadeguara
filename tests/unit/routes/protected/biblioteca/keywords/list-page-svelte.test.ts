import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/keywords/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('keyword list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { chave: '' }, errors: {} } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="chave"]');

		expect(document.querySelector('h1')?.textContent).toBe('Consulta de palavras-chave');
		expect(input.maxLength).toBe(30);
		expect(input.required).toBe(false);
		expect(document.body.textContent).not.toContain('Nenhuma palavra-chave encontrada.');
	});

	it('renders a persisted search and Portuguese error', () => {
		const { body } = render(Page, {
			props: { form: { values: { chave: '123' }, errors: { chave: ['Palavra-chave inválida.'] } } },
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="chave"]');

		expect(input.value).toBe('123');
		expect(input.getAttribute('aria-describedby')).toBe('chave-errors');
		expect(document.querySelector('#chave-errors')?.textContent).toContain('Palavra-chave inválida.');
	});

	it('renders result rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { keywords: [{ idkeyword: 7, chave: 'FICÇÃO' }], values: { chave: 'Ficção' } } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('th')?.textContent).toBe('Palavra-chave');
		expect(getRenderedAnchor(document, 'tbody a').getAttribute('aria-label')).toBe('Editar palavra-chave FICÇÃO');
	});

	it('renders a completed-empty message', () => {
		const { body } = render(Page, { props: { form: { keywords: [], values: { chave: 'Ana' } } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Nenhuma palavra-chave encontrada.');
	});
});
