import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.svelte';

const data = { editora: { ideditora: 4, nome: 'EDITORA ORIGINAL' } };

describe('edit publisher page', () => {
	it('renders the loaded publisher name when there is no submitted value', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('value="EDITORA ORIGINAL"');
		expect(body).toContain('maxlength="60" required');
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

		expect(body).toContain('value=""');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('Nome da editora é obrigatório.');
		expect(body).toContain('Nome da editora inválido.');
	});

	it('renders the successful update notification', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Editora atualizada com sucesso!');
	});
});
