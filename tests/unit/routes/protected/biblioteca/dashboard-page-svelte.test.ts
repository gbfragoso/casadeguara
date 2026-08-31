import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/biblioteca/+page.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

const notices = [
	{ idaviso: 8, dataCadastro: new Date('2026-08-20'), texto: 'Aviso mais recente', username: 'bibliotecaria' },
	{ idaviso: 4, dataCadastro: new Date('2026-08-19'), texto: 'Aviso anterior', username: 'bibliotecaria' },
];

describe('library dashboard page', () => {
	it('renders received notice order and monthly indicators', () => {
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
		const document = parseRenderedBody(body);
		const noticeText = [...document.querySelectorAll('.content p')].map((cell) => cell.textContent?.trim() ?? '');
		const counters = [...document.querySelectorAll('h2')].map((heading) => heading.textContent?.trim());

		expect(noticeText[0]).toContain('Aviso mais recente');
		expect(noticeText[1]).toContain('Aviso anterior');
		expect(document.body.textContent).toContain('Empréstimos');
		expect(document.body.textContent).toContain('Devoluções');
		expect(document.body.textContent).toContain('Renovações');
		expect(counters).toEqual(expect.arrayContaining(['4', '3', '2']));
	});
});
