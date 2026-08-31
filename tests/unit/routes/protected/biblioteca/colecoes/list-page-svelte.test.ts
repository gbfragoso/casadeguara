import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/colecoes/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('collection list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(document.querySelector('h1')?.textContent).toBe('Consulta de coleções');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(false);
		expect(document.body.textContent).not.toContain('Nenhuma coleção encontrada.');
	});

	it('renders persisted values, all messages, and ARIA associations', () => {
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
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da coleção é obrigatório.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da coleção inválido.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain(
			'Nome da coleção excede o limite de caracteres.',
		);
	});

	it('renders result rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { colecoes: [{ idserie: 7, nome: 'FICÇÃO' }], values: { nome: 'Ficção' } } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('th')?.textContent).toBe('Nome');
		expect(getRenderedAnchor(document, 'tbody a').getAttribute('aria-label')).toBe('Editar coleção FICÇÃO');
	});

	it('renders a completed-empty message', () => {
		const { body } = render(Page, { props: { form: { colecoes: [], values: { nome: 'Ana' } } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Nenhuma coleção encontrada.');
	});
});
