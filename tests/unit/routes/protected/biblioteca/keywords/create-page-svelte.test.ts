import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/keywords/novo/+page.svelte';

describe('new keyword page', () => {
	it('renders submitted values, constraints, and field errors', () => {
		const { body } = render(Page, {
			props: {
				form: {
					values: { chave: '123' },
					errors: { chave: ['Palavra-chave inválida.', 'Palavra-chave excede o limite de caracteres.'] },
				},
			},
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('maxlength="30" required');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Palavra-chave inválida.');
		expect(body).toContain('Palavra-chave excede o limite de caracteres.');
		expect(body).toContain('>Palavras-chave</a>');
	});

	it('renders the successful creation notification for status 201', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('Palavra-chave cadastrada com sucesso!');
	});
});
