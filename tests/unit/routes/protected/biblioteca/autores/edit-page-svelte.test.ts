import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/[id=integer]/+page.svelte';

const data = { autor: { idautor: 4, nome: 'ANA ORIGINAL' } };

describe('edit author page', () => {
	it('renders the loaded author name when there is no submitted value', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('value="ANA ORIGINAL"');
		expect(body).toContain('maxlength="60" required');
	});

	it('renders failed values and all validation errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '' },
					errors: { nome: ['Nome do autor é obrigatório.', 'Nome do autor inválido.'] },
				},
			},
		});

		expect(body).toContain('value=""');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('Nome do autor é obrigatório.');
		expect(body).toContain('Nome do autor inválido.');
	});

	it('renders the successful update notification', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Autor atualizado com sucesso');
	});
});
