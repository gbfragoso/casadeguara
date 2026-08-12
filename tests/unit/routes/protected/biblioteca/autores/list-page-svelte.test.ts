import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/+page.svelte';

describe('author list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });

		expect(body).toContain('Consulta de autores');
		expect(body).toContain('maxlength="60"');
		expect(body).not.toContain('required');
	});

	it('renders the persisted search value and every validation error', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do autor inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('Nome do autor inválido.');
	});

	it('renders author rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { autores: [{ idautor: 7, nome: 'CONCEIÇÃO EVARISTO' }], values: { nome: 'Conceição' } } },
		});

		expect(body).toContain('CONCEIÇÃO EVARISTO');
		expect(body).toContain('aria-label="Editar autor CONCEIÇÃO EVARISTO"');
	});

	it('renders an empty-result message after a search', () => {
		const { body } = render(Page, { props: { form: { autores: [], values: { nome: 'Ana' } } } });

		expect(body).toContain('Nenhum autor encontrado.');
	});
});
