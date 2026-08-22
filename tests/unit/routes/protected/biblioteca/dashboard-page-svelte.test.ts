import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/biblioteca/+page.svelte';

const notices = [
	{ idaviso: 8, dataCadastro: new Date('2026-08-20'), texto: 'Aviso mais recente', username: 'bibliotecaria' },
	{ idaviso: 4, dataCadastro: new Date('2026-08-19'), texto: 'Aviso anterior', username: 'bibliotecaria' },
];

describe('library dashboard page', () => {
	it('renders the received notice order and all monthly indicators', () => {
		const { body } = render(Page, {
			props: {
				data: {
					avisos: notices,
					emprestimos: [{ counter: 4, renovacoes: '2' }],
					devolucoes: [{ counter: 3 }],
					username: 'Bibliotecária',
					userid: 'user-1',
				},
			},
		});

		expect(body.indexOf(notices[0].texto)).toBeLessThan(body.indexOf(notices[1].texto));
		expect(body).toContain('Empréstimos');
		expect(body).toContain('Devoluções');
		expect(body).toContain('Renovações');
		expect(body).toContain('>4</h2>');
		expect(body).toContain('>3</h2>');
		expect(body).toContain('>2</h2>');
	});
});
