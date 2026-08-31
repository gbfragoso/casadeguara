import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('author list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(document.querySelector('h1')?.textContent).toBe('Consulta de autores');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(false);
	});

	it('renders the persisted search value and every validation error', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do autor inválido.'] } } },
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome do autor inválido.');
	});

	it('renders author rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { autores: [{ idautor: 7, nome: 'CONCEIÇÃO EVARISTO' }], values: { nome: 'Conceição' } } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('tbody td')?.textContent).toBe('CONCEIÇÃO EVARISTO');
		expect(getRenderedAnchor(document, 'tbody a').getAttribute('aria-label')).toBe(
			'Editar autor CONCEIÇÃO EVARISTO',
		);
	});

	it('renders an empty-result message after a search', () => {
		const { body } = render(Page, { props: { form: { autores: [], values: { nome: 'Ana' } } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Nenhum autor encontrado.');
	});
});
