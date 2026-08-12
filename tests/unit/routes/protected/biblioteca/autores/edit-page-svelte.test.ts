import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/autores/[id=integer]/+page.svelte';

const data = { autor: { idautor: 1, nome: 'ÉRICO VERÍSSIMO' } };

describe('edit author page', () => {
	it('uses the loaded author name by default', () => {
		const { body } = render(Page, { props: { data, form: undefined } });

		expect(body).toContain('value="ÉRICO VERÍSSIMO"');
		expect(body).toContain('required');
	});

	it('preserves failed values and renders accessible errors', () => {
		const { body } = render(Page, {
			props: { data, form: { values: { nome: '123' }, errors: { nome: ['Nome do autor inválido.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('maxlength="60"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('Nome do autor inválido.');
	});

	it('renders the update success notification', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Autor atualizado com sucesso');
	});
});
