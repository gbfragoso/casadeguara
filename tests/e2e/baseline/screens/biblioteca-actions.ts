import { expect, type Page } from '@playwright/test';

import { closeDatabase, createDatabase } from '../../cadastros-database';
import { searchBookByTombo, submitBookSearch } from '../../livros-browser';
import { DISPOSABLE_BOOK, SEARCH_TITLE_PREFIX } from '../seed/library';
import { AUTOCOMPLETE_PREFIX } from '../seed/people';

const SEARCHED_BOOK = 'Caminhos da Luz';
const SUGGESTED_READER = 'Marina Fontes Fictícia';

export const searchBooksByTitle = async (page: Page) => {
	await page.getByLabel('Título').fill(SEARCH_TITLE_PREFIX);
	expect((await submitBookSearch(page)).ok()).toBe(true);
	await expect(page.getByRole('cell', { name: SEARCHED_BOOK, exact: true })).toBeVisible();
};

const insertDisposableBook = async () => {
	const database = createDatabase();
	try {
		await database`
			insert into livro (tombo, titulo) values (${DISPOSABLE_BOOK.tombo}, ${DISPOSABLE_BOOK.titulo})
			on conflict (tombo) do nothing
		`;
	} finally {
		await closeDatabase(database);
	}
};

const confirmDeletion = async (page: Page, title: string) => {
	const dialog = page.getByRole('dialog', { name: 'Excluir livro' });
	await expect(dialog).toBeVisible();
	const response = page.waitForResponse(
		(candidate) =>
			candidate.request().method() === 'POST' && new URL(candidate.url()).pathname === '/biblioteca/livros',
	);
	await dialog.getByRole('button', { name: `Confirmar exclusão do livro ${title}` }).click();
	expect((await response).ok()).toBe(true);
};

export const deleteDisposableBook = async (page: Page) => {
	await insertDisposableBook();
	await searchBookByTombo(page, DISPOSABLE_BOOK.tombo);
	await page.getByRole('button', { name: `Excluir livro ${DISPOSABLE_BOOK.titulo}` }).click();
	await confirmDeletion(page, DISPOSABLE_BOOK.titulo);
	await expect(page.getByText('Livro excluído com sucesso.')).toBeVisible();
};

export const openDeleteDialog = async (page: Page) => {
	await searchBooksByTitle(page);
	await page.getByRole('button', { name: `Excluir livro ${SEARCHED_BOOK}` }).click();
	await expect(page.getByRole('dialog', { name: 'Excluir livro' })).toBeVisible();
};

export const openReaderSuggestions = async (page: Page) => {
	const reader = page.getByRole('combobox', { name: 'Leitor', exact: true });
	await reader.focus();
	await reader.pressSequentially(AUTOCOMPLETE_PREFIX);
	await expect(page.getByRole('option', { name: SUGGESTED_READER, exact: true })).toBeVisible();
};

export const advancePasswordStrength = async (page: Page) => {
	await page.getByLabel('Senha').fill('Forca-da-Senha-2026');
	await expect(page.getByRole('progressbar')).not.toHaveAttribute('value', '0');
};

export const openUserMenu = async (page: Page) => {
	await page.locator('[aria-controls="dropdown-menu"]').click();
	await expect(page.getByRole('link', { name: 'Configurações' })).toBeVisible();
};

export const openSidebar = async (page: Page) => {
	await page.getByRole('button', { name: 'menu', exact: true }).click();
	await expect(page.getByTestId('regiao-menu-lateral').getByRole('link', { name: 'livros' })).toBeVisible();
};
