import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/avisos/+page.svelte';
import {
	getRenderedAnchor,
	getRenderedButton,
	getRenderedCell,
	getRenderedTextarea,
	parseRenderedBody,
} from '../../../../support/rendered-document';

const notices = [
	{ idaviso: 8, dataCadastro: new Date('2026-08-20'), texto: 'Aviso mais recente', username: 'bibliotecaria' },
	{ idaviso: 4, dataCadastro: new Date('2026-08-19'), texto: 'Aviso anterior', username: 'bibliotecaria' },
];

const createData = (avisos = notices) => ({ username: 'bibliotecaria', userid: 'user-1', isAdmin: false, avisos });

describe('notice list page', () => {
	it('renders notices in the received order with accessible edit actions', () => {
		const { body } = render(Page, { props: { data: createData(), form: { status: 201 } } });
		const document = parseRenderedBody(body);
		const rows = document.querySelectorAll('tbody tr');

		expect(rows[0]?.querySelector('td')?.textContent).toBe(notices[0].texto);
		expect(rows[1]?.querySelector('td')?.textContent).toBe(notices[1].texto);
		expect(getRenderedAnchor(document, 'a[aria-label="Editar aviso 8"]')).not.toBeNull();
		expect(document.querySelector('a[aria-label="Editar aviso 8"] i')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders an empty state row', () => {
		const { body } = render(Page, { props: { data: createData([]), form: { status: 201 } } });
		const document = parseRenderedBody(body);
		const emptyCell = getRenderedCell(document, 'tbody td[colspan="2"]');

		expect(emptyCell.textContent).toBe('Nenhum aviso cadastrado.');
	});

	it('renders preserved text, constraints, and associated errors', () => {
		const { body } = render(Page, {
			props: {
				data: createData([]),
				form: { values: { texto: '  Texto rejeitado  ' }, errors: { texto: ['Erro um', 'Erro dois'] } },
			},
		});
		const document = parseRenderedBody(body);
		const textarea = getRenderedTextarea(document, 'textarea[name="texto"]');

		expect(textarea.value).toBe('  Texto rejeitado  ');
		expect(textarea.maxLength).toBe(300);
		expect(textarea.getAttribute('aria-describedby')).toBe('texto-errors');
		expect(document.querySelectorAll('#texto-errors p')).toHaveLength(2);
	});

	it('renders a creation confirmation and an available submission control', () => {
		const { body } = render(Page, { props: { data: createData([]), form: { status: 201 } } });
		const document = parseRenderedBody(body);
		const submit = getRenderedButton(document, 'button[type="submit"]');

		expect(document.body.textContent).toContain('Aviso criado com sucesso!');
		expect(submit.getAttribute('aria-busy')).toBe('false');
		expect(submit.disabled).toBe(false);
	});
});
