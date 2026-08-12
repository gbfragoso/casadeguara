import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/novo/+page.svelte';

describe('new author page', () => {
	it('renders required name constraints', () => {
		const { body } = render(Page, { props: { form: undefined } });

		expect(body).toContain('required');
		expect(body).toContain('maxlength="60"');
	});

	it('renders every field error and preserves the submitted value', () => {
		const errors = ['Nome do autor inválido.', 'Nome do autor excede o limite de caracteres.'];
		const { body } = render(Page, { props: { form: { values: { nome: '123' }, errors: { nome: errors } } } });

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain(errors[0]);
		expect(body).toContain(errors[1]);
	});

	it('renders the creation success notification', () => {
		const { body } = render(Page, { props: { form: { status: 201 } } });

		expect(body).toContain('Autor cadastrado com sucesso!');
	});
});
