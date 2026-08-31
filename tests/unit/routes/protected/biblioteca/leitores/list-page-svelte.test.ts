import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('reader list page', () => {
	it('renders the initial searchable form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(document.querySelector('h1')?.textContent).toBe('Consulta de leitores');
		expect(input.autocomplete).toBe('name');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(false);
		expect(document.body.textContent).not.toContain('Nenhum leitor encontrado.');
	});

	it('renders retained values, validation feedback, and ARIA associations', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do leitor inválido.'] } } },
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome do leitor inválido.');
	});

	it('renders minimal result rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: {
				form: { leitores: [{ idleitor: 7, nome: 'ANA', trab: true, status: false }], values: { nome: 'Ana' } },
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('tbody tr td')?.textContent).toBe('ANA');
		expect(getRenderedAnchor(document, 'tbody a').getAttribute('aria-label')).toBe('Editar leitor ANA');
		expect(document.querySelector('tbody tr td:nth-child(2)')?.textContent).toBe('Sim');
		expect(document.querySelector('tbody tr td:nth-child(3)')?.textContent).toBe('Inativo');
	});

	it('shows an empty state after a completed search', () => {
		const { body } = render(Page, { props: { form: { leitores: [], values: { nome: 'Ana' } } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Nenhum leitor encontrado.');
	});
});
