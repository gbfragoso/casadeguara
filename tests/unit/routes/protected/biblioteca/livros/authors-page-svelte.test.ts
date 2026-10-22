// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/[id=integer]/autores/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

const REGISTERED_AT = new Date('2026-01-10T00:00:00Z');
const BOOK = {
	idlivro: 3,
	tombo: '1001',
	titulo: 'Caminhos da Luz',
	editora: 1,
	dataCadastro: REGISTERED_AT,
	serie: null,
	ordem: null,
};
const AUTHORS = [
	{ idautor: 7, nome: 'Conceição Evaristo', dataCadastro: REGISTERED_AT },
	{ idautor: 8, nome: 'Machado de Assis', dataCadastro: REGISTERED_AT },
];

const renderAuthors = (isAdmin: boolean) =>
	renderComponent(Page, {
		data: {
			livros: Promise.resolve([BOOK]),
			autores: Promise.resolve(AUTHORS),
			autoresLivro: Promise.resolve([{ idautor: 7, nome: 'Conceição Evaristo' }]),
			isAdmin,
		},
		params: { id: '3' },
	});

const waitForAuthorRows = (target: HTMLElement) =>
	vi.waitFor(() => expect(target.querySelector('tbody td')?.textContent).toBe('Conceição Evaristo'));

describe('book authors page', () => {
	it('shows the book as read-only context and the authors available to add', async () => {
		const target = await renderAuthors(false);

		await waitForAuthorRows(target);

		const tombo = target.querySelector<HTMLInputElement>('#tombo');
		const options = [...target.querySelectorAll('#autor option')].map((option) => option.textContent);
		expect([tombo?.value, tombo?.disabled]).toEqual(['1001', true]);
		expect(target.querySelector<HTMLInputElement>('#titulo')?.value).toBe('Caminhos da Luz');
		expect(options).toEqual(['', 'Conceição Evaristo', 'Machado de Assis']);
	});

	it('marks the authors page of the book as the current breadcrumb', async () => {
		const target = await renderAuthors(false);

		const current = target.querySelector('nav[aria-label="Trilha de navegação"] [aria-current="page"]');

		expect(current?.textContent).toBe('Autores');
		expect(current?.getAttribute('href')).toBe('/biblioteca/livros/3/autores');
	});

	it('hides the author removal from a non-administrator', async () => {
		const target = await renderAuthors(false);

		await waitForAuthorRows(target);

		expect(target.querySelectorAll('tbody form')).toHaveLength(0);
	});

	it('lets an administrator remove an author from the book', async () => {
		const target = await renderAuthors(true);

		await waitForAuthorRows(target);

		const removal = target.querySelector('tbody form');
		expect(removal?.getAttribute('action')).toBe('?/excluir&autor=7');
		expect(removal?.querySelector('button[type="submit"]')?.getAttribute('aria-label')).toBe(
			'Remover autor Conceição Evaristo do livro',
		);
	});

	it('explains that the book no longer exists instead of failing', async () => {
		const target = await renderComponent(Page, {
			data: {
				livros: Promise.resolve([]),
				autores: Promise.resolve(AUTHORS),
				autoresLivro: Promise.resolve([]),
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

	it('tells that the authors to add could not be loaded', async () => {
		const target = await renderComponent(Page, {
			data: {
				livros: Promise.resolve([]),
				autores: Promise.reject(new Error('database offline')),
				autoresLivro: Promise.resolve([]),
				isAdmin: false,
			},
			params: { id: '3' },
		});

		await vi.waitFor(() =>
			expect(target.querySelector('#autor option[disabled]')?.textContent).toBe(
				'Não foi possível carregar os autores',
			),
		);
	});
});
