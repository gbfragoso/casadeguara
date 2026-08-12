import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/+page.svelte';

describe('author list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: undefined } });

		expect(body).toContain('Consulta de autores');
		expect(body).toContain('maxlength="60"');
	});

	it('renders a persisted search and its validation error', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do autor inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('Nome do autor inválido.');
	});

	it('renders author rows with descriptive edit labels', () => {
		const { body } = render(Page, {
			props: { form: { autores: [{ idautor: 1, nome: 'ÉRICO VERÍSSIMO' }], values: { nome: 'Érico' } } },
		});

		expect(body).toContain('ÉRICO VERÍSSIMO');
		expect(body).toContain('aria-label="Editar autor ÉRICO VERÍSSIMO"');
	});

	it('renders the empty result message', () => {
		const { body } = render(Page, { props: { form: { autores: [], values: { nome: 'nada' } } } });

		expect(body).toContain('Nenhum autor encontrado.');
	});
});
