import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../src/routes/acervo/+page.svelte';
import { parseRenderedBody } from '../../support/rendered-document';

const colecoes = Promise.resolve([{ idserie: 3, nome: 'Coleção Caminhos', dataCadastro: null }]);
const livro = { idlivro: 9, titulo: 'Caminhos da Luz', autores: ['Clara Ventura', 'Paulo Sereno'], disponiveis: 2 };

const renderOnServer = (form: { livros: (typeof livro)[] } | null) =>
	parseRenderedBody(render(Page, { props: { data: { colecoes }, form } }).body);

describe('public acervo page', () => {
	it('labels every search filter of the public catalog', () => {
		const document = renderOnServer(null);

		const labels = [...document.querySelectorAll('label')].map((label) => [
			label.getAttribute('for'),
			label.textContent,
		]);

		expect(labels).toEqual([
			['titulo', 'Título'],
			['autor', 'Autor'],
			['editora', 'Editora'],
			['serie', 'Coleção'],
			['keyword', 'Palavra-chave'],
		]);
	});

	it('offers only the empty choice while the collections load', () => {
		const document = renderOnServer(null);

		expect([...document.querySelectorAll('#serie option')].map((option) => option.textContent)).toEqual(['']);
	});

	it('shows only the search form before a search', () => {
		const document = renderOnServer(null);

		expect(document.querySelector('table')).toBeNull();
		expect(document.querySelector('button[type="submit"]')?.getAttribute('aria-busy')).toBe('false');
	});

	it('lists each found book with its authors and available copies', () => {
		const document = renderOnServer({ livros: [livro] });

		const cells = document.querySelectorAll('tbody tr td');

		expect(cells[0]?.querySelector('p')?.textContent).toBe('Caminhos da Luz');
		expect([...(cells[0]?.querySelectorAll('span') ?? [])].map((tag) => tag.textContent?.trim())).toEqual([
			'Clara Ventura',
			'Paulo Sereno',
		]);
		expect(cells[1]?.textContent).toBe('2');
	});
});
