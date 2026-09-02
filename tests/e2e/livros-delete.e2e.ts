import type { Locator, Page } from '@playwright/test';

import { test, expect } from './fixtures';
import { findCatalogBookRow } from './livros-browser';
import type { LivroCatalog } from './livros-database';

type CatalogBook = LivroCatalog['livros']['primary'];

const waitForDeleteResponse = (page: Page) =>
	page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/biblioteca/livros',
	);

const openDeleteDialog = async (page: Page, book: CatalogBook) => {
	const row = await findCatalogBookRow(page, book);
	await row.getByRole('button', { name: `Excluir livro ${book.titulo}` }).click();
	const dialog = page.getByRole('dialog', { name: 'Excluir livro' });
	await expect(dialog).toBeVisible();
	return dialog;
};

const confirmDeletion = async (page: Page, dialog: Locator, book: CatalogBook) => {
	const responsePromise = waitForDeleteResponse(page);
	await dialog.getByRole('button', { name: `Confirmar exclusão do livro ${book.titulo}` }).click();
	return responsePromise;
};

test('E2E-03 restringe a exclusão ao administrador', async ({ browser, page, e2e }) => {
	const catalog = await e2e.createBookCatalog();
	await e2e.authenticate(page, 'wrongRole');
	const commonRow = await findCatalogBookRow(page, catalog.livros.primary);
	await expect(commonRow.getByRole('button', { name: `Excluir livro ${catalog.livros.primary.titulo}` })).toHaveCount(
		0,
	);

	const unauthorized = await page.request.post('/biblioteca/livros?/excluir', {
		form: { idlivro: `${catalog.livros.primary.idlivro}` },
	});
	expect(unauthorized.status()).toBe(401);
	expect(await e2e.countBooksByTitle(catalog.livros.primary.titulo)).toBe(1);

	const adminContext = await browser.newContext();
	try {
		const adminPage = await adminContext.newPage();
		await e2e.authenticate(adminPage, 'admin');
		const adminRow = await findCatalogBookRow(adminPage, catalog.livros.primary);
		await expect(
			adminRow.getByRole('button', { name: `Excluir livro ${catalog.livros.primary.titulo}` }),
		).toBeVisible();
	} finally {
		await adminContext.close();
	}
});

test('E2E-05 cancela, confirma e comunica a exclusão', async ({ browser, e2e }) => {
	const catalog = await e2e.createBookCatalog();
	const adminContext = await browser.newContext();
	try {
		const page = await adminContext.newPage();
		await e2e.authenticate(page, 'admin');
		let dialog = await openDeleteDialog(page, catalog.livros.primary);
		await dialog.getByRole('button', { name: 'Cancelar' }).click();
		await expect(dialog).toBeHidden();
		expect(await e2e.countBooksByTitle(catalog.livros.primary.titulo)).toBe(1);

		dialog = await openDeleteDialog(page, catalog.livros.primary);
		expect((await confirmDeletion(page, dialog, catalog.livros.primary)).ok()).toBe(true);
		await expect(page.getByText('Livro excluído com sucesso.')).toBeVisible();
		expect(await e2e.countBooksByTitle(catalog.livros.primary.titulo)).toBe(0);

		dialog = await openDeleteDialog(page, catalog.livros.related);
		expect((await confirmDeletion(page, dialog, catalog.livros.related)).status()).toBe(409);
		await expect(page.getByText('Livro possui exemplares relacionados.')).toBeVisible();
		expect(await e2e.countBooksByTitle(catalog.livros.related.titulo)).toBe(1);
	} finally {
		await adminContext.close();
	}
});
