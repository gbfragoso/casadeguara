import type { Page } from '@playwright/test';

import type { LivroCatalog } from './livros-database';
import { expect, waitForHydration } from './fixtures';

export const openBooksPage = async (page: Page) => {
	await page.goto('/biblioteca/livros');
	await waitForHydration(page);
};

export const submitBookSearch = async (page: Page) => {
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/biblioteca/livros',
	);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	return responsePromise;
};

export const searchBookByTombo = async (page: Page, tombo: string) => {
	await page.getByLabel('Tombo').fill(tombo);
	const response = await submitBookSearch(page);
	expect(response.ok()).toBe(true);
};

export const findCatalogBookRow = async (page: Page, book: LivroCatalog['livros']['primary']) => {
	await openBooksPage(page);
	await searchBookByTombo(page, book.tombo);
	return page.locator('tbody tr').filter({ hasText: book.titulo });
};

export const openBookAuthors = async (page: Page, title: string, idlivro: number) => {
	const popupPromise = page.waitForEvent('popup');
	await page.getByRole('link', { name: `Autores do livro ${title}` }).click();
	const authorsPage = await popupPromise;
	try {
		await expect(authorsPage).toHaveURL(new RegExp(`/biblioteca/livros/${idlivro}/autores$`));
	} finally {
		await authorsPage.close();
	}
};
