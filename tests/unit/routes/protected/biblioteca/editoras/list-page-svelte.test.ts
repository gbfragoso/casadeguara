import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/editoras/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('publisher list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(document.querySelector('h1')?.textContent).toBe('Consulta de editoras');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(false);
	});

	it('renders the persisted search value and every validation error', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome da editora inválido.'] } } },
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('123');
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da editora inválido.');
	});

	it('renders publisher rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { editoras: [{ ideditora: 7, nome: 'EDITORA JOSÉ OLYMPIO' }], values: { nome: 'José' } } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('tbody td')?.textContent).toBe('EDITORA JOSÉ OLYMPIO');
		expect(getRenderedAnchor(document, 'tbody a').getAttribute('aria-label')).toBe(
			'Editar editora EDITORA JOSÉ OLYMPIO',
		);
	});

	it('renders an empty-result message after a search', () => {
		const { body } = render(Page, { props: { form: { editoras: [], values: { nome: 'Ana' } } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Nenhuma editora encontrada.');
	});
});
