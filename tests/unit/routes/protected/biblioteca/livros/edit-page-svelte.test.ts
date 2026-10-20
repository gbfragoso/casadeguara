import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const REGISTERED_AT = new Date('2026-01-10T00:00:00Z');
const data = {
	livro: {
		idlivro: 7,
		tombo: '00012345',
		titulo: 'Caminhos da Luz',
		editora: 2,
		dataCadastro: REGISTERED_AT,
		serie: 3,
		ordem: 4,
	},
	editoras: [
		{ ideditora: 1, nome: 'Editora Aurora', dataCadastro: REGISTERED_AT },
		{ ideditora: 2, nome: 'Editora Batuíra', dataCadastro: REGISTERED_AT },
	],
	colecoes: [{ idserie: 3, nome: 'Coleção Caminhos', dataCadastro: REGISTERED_AT }],
};

type BookForm = { status?: number; field?: string; message?: string } | null;

const renderEditPage = (form: BookForm) => parseRenderedBody(render(Page, { props: { data, form } }).body);

describe('book edit page', () => {
	it('fills the form with the current book', () => {
		const document = renderEditPage(null);

		expect(getRenderedInput(document, '#tombo').value).toBe('00012345');
		expect(getRenderedInput(document, '#titulo').value).toBe('Caminhos da Luz');
		expect(document.querySelector('#editora option[selected]')?.getAttribute('value')).toBe('2');
		expect(document.querySelector('#colecao option[selected]')?.getAttribute('value')).toBe('3');
		expect(getRenderedInput(document, '#ordem').value).toBe('4');
	});

	it('shows the title error returned by the server', () => {
		const document = renderEditPage({ field: 'titulo', message: 'Título inválido' });

		expect(getRenderedInput(document, '#titulo').closest('form')?.textContent).toContain('Título inválido');
	});

	it('shows the publisher error returned by the server', () => {
		const document = renderEditPage({ field: 'editora', message: 'Editora inválida' });

		expect(document.querySelector('form')?.textContent).toContain('Editora inválida');
	});

	it('notifies the successful update', () => {
		const document = renderEditPage({ status: 200 });

		expect(document.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe(
			'Livro atualizado com sucesso!',
		);
	});
});
