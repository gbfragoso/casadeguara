import type { Page } from '@playwright/test';

import { test, expect } from './fixtures';
import { openBookAuthors, openBooksPage, submitBookSearch } from './livros-browser';
import type { LivroCatalog } from './livros-database';

const filterPrimaryBook = async (page: Page, catalog: LivroCatalog) => {
	const searchForm = page.locator('form.card');
	await searchForm.getByLabel('Título').fill('arvore');
	await searchForm.getByLabel('Autor').fill('erico');
	await searchForm.getByLabel('Editora').fill('editora exito');
	await searchForm.getByLabel('Coleção').selectOption(`${catalog.colecao[0].id}`);
	await searchForm.getByLabel('Palavra-chave').fill('acao');
	expect((await submitBookSearch(page)).ok()).toBe(true);
	const row = page.locator('tbody tr').filter({ hasText: catalog.livros.primary.titulo });
	await expect(row).toBeVisible();
	await expect(row).toContainText(catalog.definition.keyword[0]);
	await expect(row).toContainText('capítulo inicial');
	await expect(page.locator('tbody tr')).toHaveCount(1);
	return row;
};

const assertCatalogOrder = async (page: Page, catalog: LivroCatalog) => {
	const searchForm = page.locator('form.card');
	for (const label of ['Título', 'Autor', 'Editora', 'Palavra-chave']) await searchForm.getByLabel(label).fill('');
	await searchForm.getByLabel('Coleção').selectOption(`${catalog.colecao[0].id}`);
	expect((await submitBookSearch(page)).ok()).toBe(true);
	await expect(page.locator('tbody tr')).toHaveCount(2);
	await expect(page.locator('tbody tr').nth(0)).toContainText(catalog.livros.primary.titulo);
	await expect(page.locator('tbody tr').nth(1)).toContainText(catalog.livros.secondary.titulo);
};

const assertEmptySearch = async (page: Page, token: string) => {
	const searchForm = page.locator('form.card');
	await searchForm.getByLabel('Coleção').selectOption('');
	await searchForm.getByLabel('Título').fill(`não existe ${token}`);
	expect((await submitBookSearch(page)).ok()).toBe(true);
	await expect(page.getByRole('status')).toHaveText('Nenhum livro encontrado.');
};

test('E2E-01 pesquisa e navega pelos resultados', async ({ page, e2e }) => {
	const catalog = await e2e.createBookCatalog();
	await e2e.authenticate(page, 'wrongRole');
	await openBooksPage(page);

	const primaryRow = await filterPrimaryBook(page, catalog);

	for (const name of ['Editar', 'Autores', 'Exemplares', 'Palavras-chave']) {
		await expect(
			primaryRow.getByRole('link', { name: new RegExp(`${name}.*${catalog.livros.primary.titulo}`) }),
		).toBeVisible();
	}
	await openBookAuthors(page, catalog.livros.primary.titulo, catalog.livros.primary.idlivro);

	await assertCatalogOrder(page, catalog);
	await assertEmptySearch(page, catalog.token);
});
