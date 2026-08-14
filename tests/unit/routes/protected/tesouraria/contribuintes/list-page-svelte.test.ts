import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/+page.svelte';

describe('tesouraria contributor list page', () => {
	it('renders the initial searchable form without an edit action', () => {
		const { body } = render(Page, { props: { form: { values: { nome: '' }, errors: {} } } });

		expect(body).toContain('autocomplete="name"');
		expect(body).toContain('maxlength="60"');
		expect(body).not.toContain(' required');
		expect(body).not.toContain('fa-pen-to-square');
	});

	it('retains search values and renders associated validation feedback', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '123' }, errors: { nome: ['Nome do contribuinte inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Nome do contribuinte inválido.');
	});

	it('renders keyed result rows and a Portuguese empty state after a search', () => {
		const { body: results } = render(Page, {
			props: {
				form: {
					contribuintes: [{ idleitor: 7, nome: 'ANA', telefone: '7133333333', trab: true }],
					values: { nome: 'Ana' },
				},
			},
		});
		const { body: empty } = render(Page, { props: { form: { contribuintes: [], values: { nome: 'Ana' } } } });

		expect(results).toContain('<td>ANA</td>');
		expect(results).toContain('<td>7133333333</td>');
		expect(results).toContain('<td>Trabalhador</td>');
		expect(empty).toContain('Nenhum contribuinte encontrado.');
	});
});
