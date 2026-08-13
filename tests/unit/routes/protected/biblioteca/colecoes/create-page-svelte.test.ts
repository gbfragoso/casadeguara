import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/colecoes/novo/+page.svelte';

describe('new collection page', () => {
	it('renders submitted values, constraints, and field errors', () => {
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

		expect(body).toContain('value="123"');
		expect(body).toContain('maxlength="60" required');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Nome da coleção é obrigatório.');
		expect(body).toContain('Nome da coleção inválido.');
		expect(body).toContain('Nome da coleção excede o limite de caracteres.');
		expect(body).toContain('>Coleções</a>');
	});

	it('renders the successful creation notification for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('Coleção cadastrada com sucesso!');
	});
});
