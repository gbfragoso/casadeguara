import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = {
	emprestimo: {
		leitor: 'Rui Leitor',
		livro: 'Caminhos da Luz',
		numero: 2,
		idexemplar: 41,
		idlivro: 7,
		usuarioEmprestimo: 'Helena',
		dataEmprestimo: new Date('2026-10-05T00:00:00Z'),
		dataDevolvido: null,
	},
	exemplares: Promise.resolve([]),
};

const renderEditPage = (form: { status: number } | null) =>
	parseRenderedBody(render(Page, { props: { data, form } }).body);

describe('loan edit page', () => {
	it('shows the current loan as read-only context for the copy change', () => {
		const document = renderEditPage(null);

		expect(getRenderedInput(document, '#leitor').value).toBe('Rui Leitor');
		expect(getRenderedInput(document, '#leitor').disabled).toBe(true);
		expect(getRenderedInput(document, '#exemplaratual').value).toBe('Caminhos da Luz - EX:2');
		expect(getRenderedInput(document, '#idexemplar').value).toBe('41');
		expect(document.querySelector('form')?.textContent).toContain('Emprestado por Helena no dia 05/10/2026');
		expect(document.querySelector('[data-testid="regiao-notificacao"]')).toBeNull();
	});

	it('requires the new copy', () => {
		const document = renderEditPage(null);

		expect(document.querySelector('select#novoexemplar')?.hasAttribute('required')).toBe(true);
	});

	it('notifies the successful update', () => {
		const document = renderEditPage({ status: 200 });

		expect(document.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe(
			'Empréstimo atualizado com sucesso',
		);
	});
});
