import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/editoras/+page.svelte';

describe('publisher list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });

		expect(body).toContain('Consulta de editoras');
		expect(body).toContain('maxlength="60"');
		expect(body).not.toContain('required');
	});

	it('renders the persisted search value and every validation error', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome da editora inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('Nome da editora inválido.');
	});

	it('renders publisher rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { editoras: [{ ideditora: 7, nome: 'EDITORA JOSÉ OLYMPIO' }], values: { nome: 'José' } } },
		});

		expect(body).toContain('EDITORA JOSÉ OLYMPIO');
		expect(body).toContain('aria-label="Editar editora EDITORA JOSÉ OLYMPIO"');
	});

	it('renders an empty-result message after a search', () => {
		const { body } = render(Page, { props: { form: { editoras: [], values: { nome: 'Ana' } } } });

		expect(body).toContain('Nenhuma editora encontrada.');
	});
});
