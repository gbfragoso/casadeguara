import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('amigo fraterno page', () => {
	it('renders totals, photo status, guidance, and download form', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Secretaria',
					userid: 'secretaria',
					isAdmin: false,
					total: 1,
					withoutPhoto: 1,
					participants: [{ id: 4, name: 'MARIA', hasPhoto: false }],
				},
			},
		});
		const document = parseRenderedBody(body);
		const date = getRenderedInput(document, 'input[name="nextDrawDate"]');

		expect(document.body.textContent).toContain('Total: 1');
		expect(document.body.textContent).toContain('Sem foto: 1');
		expect(document.body.textContent).toContain('MARIA');
		expect(document.body.textContent).toContain('Pendente');
		expect(document.body.textContent).toContain('Cadastros');
		expect(document.querySelector('label[for="nextDrawDate"]')?.textContent).toContain('Data do próximo sorteio');
		expect(date.required).toBe(true);
		expect(document.body.textContent).toContain('Baixar cartões em PDF');
	});

	it('renders a textual empty state without the download form', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Secretaria',
					userid: 'secretaria',
					isAdmin: false,
					total: 0,
					withoutPhoto: 0,
					participants: [],
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Não há participantes elegíveis no momento.');
		expect(document.querySelector('input[name="nextDrawDate"]')).toBeNull();
	});
});
