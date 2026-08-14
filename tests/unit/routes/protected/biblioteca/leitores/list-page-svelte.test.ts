import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/+page.svelte';

describe('reader list page', () => {
	it('renders the initial searchable form', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });

		expect(body).toContain('Consulta de leitores');
		expect(body).toContain('autocomplete="name"');
		expect(body).toContain('maxlength="60"');
		expect(body).not.toContain(' required');
		expect(body).not.toContain('Nenhum leitor encontrado.');
	});

	it('renders retained values, validation feedback, and ARIA associations', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do leitor inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Nome do leitor inválido.');
	});

	it('renders minimal result rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: {
				form: { leitores: [{ idleitor: 7, nome: 'ANA', trab: true, status: false }], values: { nome: 'Ana' } },
			},
		});

		expect(body).toContain('<td>ANA</td>');
		expect(body).toContain('aria-label="Editar leitor ANA"');
		expect(body).toContain('>Sim</td>');
		expect(body).toContain('>Inativo</td>');
	});

	it('shows an empty state after a completed search', () => {
		const { body } = render(Page, { props: { form: { leitores: [], values: { nome: 'Ana' } } } });

		expect(body).toContain('Nenhum leitor encontrado.');
	});
});
