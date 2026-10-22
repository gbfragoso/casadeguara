// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/[id=integer]/keywords/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

const BOOK = {
	idlivro: 3,
	tombo: '1001',
	titulo: 'Caminhos da Luz',
	editora: 1,
	dataCadastro: new Date('2026-01-10T00:00:00Z'),
	serie: null,
	ordem: null,
};
const KEYWORDS = [
	{ idkeyword: 4, chave: 'Caridade' },
	{ idkeyword: 5, chave: 'Mediunidade' },
];

const renderKeywords = (
	isAdmin: boolean,
	keywordsLivro = Promise.resolve([{ ...KEYWORDS[0], referencia: 'Cap. 3' }]),
) =>
	renderComponent(Page, {
		data: { livros: Promise.resolve([BOOK]), keywords: Promise.resolve(KEYWORDS), keywordsLivro, isAdmin },
		params: { id: '3' },
	});

const waitForKeywordRows = (target: HTMLElement) =>
	vi.waitFor(() => expect(target.querySelector('tbody td')?.textContent).toBe('Caridade'));

describe('book keywords page', () => {
	it('shows a loading placeholder while the book keywords are pending', async () => {
		const target = await renderKeywords(false, new Promise(() => undefined));

		const cells = target.querySelectorAll('tbody tr td');

		expect(cells).toHaveLength(3);
		expect([...cells].every((cell) => cell.querySelector('[aria-hidden="true"]'))).toBe(true);
	});

	it('lists the book keywords with their references and the keywords available to add', async () => {
		const target = await renderKeywords(false);

		await waitForKeywordRows(target);

		const options = [...target.querySelectorAll('#keyword option')].map((option) => option.textContent);
		expect(target.querySelector('tbody tr')?.textContent).toContain('Cap. 3');
		expect(options).toEqual(['', 'Caridade', 'Mediunidade']);
		expect(target.querySelector<HTMLInputElement>('#referencia')?.required).toBe(true);
	});

	it('marks the keywords page of the book as the current breadcrumb', async () => {
		const target = await renderKeywords(false);

		const current = target.querySelector('nav[aria-label="Trilha de navegação"] [aria-current="page"]');

		expect(current?.textContent).toBe('Palavras-Chave');
		expect(current?.getAttribute('href')).toBe('/biblioteca/livros/3/keywords');
	});

	it('hides the keyword removal from a non-administrator', async () => {
		const target = await renderKeywords(false);

		await waitForKeywordRows(target);

		expect(target.querySelectorAll('tbody form')).toHaveLength(0);
	});

	it('lets an administrator remove a keyword from the book', async () => {
		const target = await renderKeywords(true);

		await waitForKeywordRows(target);

		expect(target.querySelector('tbody form')?.getAttribute('action')).toBe('?/excluir&keyword=4');
	});

	it('limits the reference to the size stored for the book keyword', async () => {
		const target = await renderKeywords(false);

		expect(target.querySelector('#referencia')?.getAttribute('maxlength')).toBe('100');
	});

	it('shows the server rejection next to the reference field', async () => {
		const target = await renderComponent(Page, {
			data: {
				livros: Promise.resolve([BOOK]),
				keywords: Promise.resolve(KEYWORDS),
				keywordsLivro: Promise.resolve([]),
				isAdmin: false,
			},
			form: { errors: { referencia: ['A referência deve ter até 100 caracteres.'] } },
			params: { id: '3' },
		});

		const reference = target.querySelector('#referencia');

		expect(reference?.getAttribute('aria-invalid')).toBe('true');
		expect(target.querySelector('#referencia-errors')?.textContent).toContain(
			'A referência deve ter até 100 caracteres.',
		);
	});

	it('explains that the book no longer exists instead of failing', async () => {
		const target = await renderComponent(Page, {
			data: {
				livros: Promise.resolve([]),
				keywords: Promise.resolve(KEYWORDS),
				keywordsLivro: Promise.resolve([]),
				isAdmin: false,
			},
			params: { id: '3' },
		});

		await vi.waitFor(() =>
			expect(target.querySelector('[role="alert"]')?.textContent).toBe(
				'Livro não encontrado. Ele pode ter sido excluído.',
			),
		);
	});

	it('tells that the keywords to add could not be loaded', async () => {
		const target = await renderComponent(Page, {
			data: {
				livros: Promise.resolve([BOOK]),
				keywords: Promise.reject(new Error('database offline')),
				keywordsLivro: Promise.resolve([]),
				isAdmin: false,
			},
			params: { id: '3' },
		});

		await vi.waitFor(() =>
			expect(target.querySelector('#keyword option[disabled]')?.textContent).toBe(
				'Não foi possível carregar as palavras-chave',
			),
		);
	});
});
