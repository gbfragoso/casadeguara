import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/colecoes/+page.svelte';

describe('collection list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });

		expect(body).toContain('Consulta de coleções');
		expect(body).toContain('maxlength="60"');
		expect(body).not.toContain('required');
		expect(body).not.toContain('Nenhuma coleção encontrada.');
	});

	it('renders persisted values, messages, and ARIA associations', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome da coleção inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Nome da coleção inválido.');
	});

	it('renders result rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { colecoes: [{ idserie: 7, nome: 'FICÇÃO' }], values: { nome: 'Ficção' } } },
		});

		expect(body).toContain('<th>Nome</th>');
		expect(body).toContain('aria-label="Editar coleção FICÇÃO"');
	});

	it('renders a completed-empty message', () => {
		const { body } = render(Page, { props: { form: { colecoes: [], values: { nome: 'Ana' } } } });

		expect(body).toContain('Nenhuma coleção encontrada.');
	});
});
