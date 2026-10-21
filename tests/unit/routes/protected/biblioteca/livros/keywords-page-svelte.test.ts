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

		const current = target.querySelector('nav[aria-label="breadcrumbs"] [aria-current="page"]');

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
});
