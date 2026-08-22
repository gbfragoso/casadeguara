import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/avisos/+page.svelte';

const notices = [
	{ idaviso: 8, dataCadastro: new Date(), texto: 'Aviso mais recente', username: 'bibliotecaria' },
	{ idaviso: 4, dataCadastro: new Date(), texto: 'Aviso anterior', username: 'bibliotecaria' },
];

const createData = (avisos = notices) => ({ username: 'bibliotecaria', userid: 'user-1', isAdmin: false, avisos });

describe('notice list page', () => {
	it('renders notices in the received order with accessible edit actions', () => {
		const { body } = render(Page, { props: { data: createData(), form: { status: 201 } } });

		expect(body.indexOf(notices[0].texto)).toBeLessThan(body.indexOf(notices[1].texto));
		expect(body).toContain('aria-label="Editar aviso 8"');
		expect(body).toContain('aria-hidden="true"');
	});

	it('renders an empty state row', () => {
		const { body } = render(Page, { props: { data: createData([]), form: { status: 201 } } });

		expect(body).toContain('Nenhum aviso cadastrado.');
		expect(body).toContain('colspan="2"');
	});

	it('renders preserved text, constraints, and associated errors', () => {
		const { body } = render(Page, {
			props: {
				data: createData([]),
				form: { values: { texto: '  Texto rejeitado  ' }, errors: { texto: ['Erro um', 'Erro dois'] } },
			},
		});

		expect(body).toContain('  Texto rejeitado  ');
		expect(body).toContain('maxlength="300"');
		expect(body).toContain('aria-describedby="texto-errors"');
		expect(body).toContain('Erro um');
		expect(body).toContain('Erro dois');
	});

	it('renders a creation confirmation', () => {
		const { body } = render(Page, { props: { data: createData([]), form: { status: 201 } } });

		expect(body).toContain('Aviso criado com sucesso!');
	});
});
