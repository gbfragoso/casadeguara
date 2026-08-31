import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = { editora: { ideditora: 4, nome: 'EDITORA ORIGINAL' } };

describe('edit publisher page', () => {
	it('renders the loaded publisher name when there is no submitted value', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('EDITORA ORIGINAL');
		expect(input.maxLength).toBe(60);
		expect(input.required).toBe(true);
	});

	it('renders failed values and all validation errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '' },
					errors: { nome: ['Nome da editora é obrigatório.', 'Nome da editora inválido.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const input = getRenderedInput(document, 'input[name="nome"]');

		expect(input.value).toBe('');
		expect(input.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da editora é obrigatório.');
		expect(document.querySelector('#nome-errors')?.textContent).toContain('Nome da editora inválido.');
	});

	it('renders the successful update notification', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Editora atualizada com sucesso!');
	});
});
