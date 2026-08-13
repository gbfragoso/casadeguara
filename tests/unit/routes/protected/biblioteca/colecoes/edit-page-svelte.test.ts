import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.svelte';

const data = { colecao: { idserie: 4, nome: 'FICÇÃO ORIGINAL' } };

describe('edit collection page', () => {
	it('renders the loaded collection when no value was submitted', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('value="FICÇÃO ORIGINAL"');
		expect(body).toContain('maxlength="60" required');
		expect(body).toContain('>Coleções</a>');
	});

	it('keeps an explicitly empty submitted value and all errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '' },
					errors: {
						nome: ['Nome da coleção é obrigatório.', 'Nome da coleção inválido.'],
					},
				},
			},
		});

		expect(body).toContain('value=""');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Nome da coleção é obrigatório.');
		expect(body).toContain('Nome da coleção inválido.');
	});

	it('renders the successful update notification for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Coleção atualizada com sucesso!');
	});
});
