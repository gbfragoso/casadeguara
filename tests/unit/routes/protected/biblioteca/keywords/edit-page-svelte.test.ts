import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.svelte';

const data = { keyword: { idkeyword: 4, chave: 'FICÇÃO ORIGINAL' } };

describe('edit keyword page', () => {
	it('renders the loaded keyword when no value was submitted', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('value="FICÇÃO ORIGINAL"');
		expect(body).toContain('maxlength="30" required');
		expect(body).toContain('>Palavras-chave</a>');
	});

	it('keeps an explicitly empty submitted value and all errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { chave: '' },
					errors: { chave: ['Palavra-chave é obrigatória.', 'Palavra-chave inválida.'] },
				},
			},
		});

		expect(body).toContain('value=""');
		expect(body).toContain('aria-describedby="chave-errors"');
		expect(body).toContain('Palavra-chave é obrigatória.');
		expect(body).toContain('Palavra-chave inválida.');
	});

	it('renders the successful update notification for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Palavra-chave atualizada com sucesso!');
	});
});
