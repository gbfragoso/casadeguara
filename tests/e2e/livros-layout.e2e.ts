import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { findCatalogBookRow, openBooksPage, submitBookSearch } from './livros-browser';
import type { LivroCatalog } from './livros-database';
import { findPrintBackgroundViolations, readTokenColor } from './support/computed-colors';
import { readBox } from './support/geometry';
import { shellRegions } from './support/module-shell';

const STACKED_WIDTH = 768;
const SIDE_BY_SIDE_WIDTH = 769;
const VIEWPORT_HEIGHT = 900;
const WIDTH_TOLERANCE = 1;
const CORNER_GAP_LIMIT = 32;
const SEARCH_FIELDS = ['Tombo', 'Título', 'Autor', 'Editora', 'Coleção', 'Palavra-chave'];

type CatalogBook = LivroCatalog['livros']['primary'];

const searchControls = (page: Page): Locator[] => [
	...SEARCH_FIELDS.map((label) => page.getByLabel(label, { exact: true })),
	page.getByRole('button', { name: 'Pesquisar' }),
	page.getByRole('link', { name: 'Novo' }),
];

const readCardContentWidth = (page: Page) =>
	page
		.locator('form')
		.filter({ has: page.getByLabel('Tombo', { exact: true }) })
		.evaluate((form) => {
			const style = getComputedStyle(form);
			return form.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		});

const openSearchAt = async (page: Page, width: number) => {
	await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
	await openBooksPage(page);
};

const openDeleteDialog = async (page: Page, book: CatalogBook) => {
	const row = await findCatalogBookRow(page, book);
	await row.getByRole('button', { name: `Excluir livro ${book.titulo}` }).click();
	return page.getByRole('dialog', { name: 'Excluir livro' });
};

test.describe('consulta de livros', () => {
	test('E2E-07 empilha campos e ações da consulta até 768 px', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'admin');
		await openSearchAt(page, STACKED_WIDTH);

		const cardWidth = await readCardContentWidth(page);
		const boxes = await Promise.all(searchControls(page).map(readBox));

		for (const box of boxes) expect(Math.abs(box.width - cardWidth)).toBeLessThanOrEqual(WIDTH_TOLERANCE);
		for (const [index, box] of boxes.slice(1).entries()) expect(box.y).toBeGreaterThan(boxes[index].y);
	});

	test('E2E-07 põe campos e ações lado a lado a partir de 769 px', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'admin');
		await openSearchAt(page, SIDE_BY_SIDE_WIDTH);

		const [tombo, titulo, autor, , , , search, create] = await Promise.all(searchControls(page).map(readBox));

		expect([titulo.y, autor.y]).toEqual([tombo.y, tombo.y]);
		expect(titulo.x).toBeGreaterThan(tombo.x + tombo.width);
		expect(create.y).toBe(search.y);
		expect(create.x).toBeGreaterThan(search.x + search.width);
	});

	test('E2E-13 mostra a mensagem de validação abaixo do campo na cor de perigo', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'admin');
		await openBooksPage(page);
		const tombo = page.getByLabel('Tombo', { exact: true });

		await tombo.fill('abc');
		await submitBookSearch(page);

		const message = page.locator('#tombo-errors');
		await expect(message).toBeVisible();
		await expect(tombo).toHaveAttribute('aria-invalid', 'true');
		await expect(tombo).toHaveAttribute('aria-describedby', 'tombo-errors');
		expect((await readBox(message)).y).toBeGreaterThanOrEqual(
			(await readBox(tombo)).y + (await readBox(tombo)).height,
		);
		await expect(message).toHaveCSS('color', await readTokenColor(page, '--color-danger-ink'));
	});

	test('E2E-14 posiciona e fecha a notificação flutuante após excluir um livro', async ({ page, e2e }) => {
		const catalog = await e2e.createBookCatalog();
		await e2e.authenticate(page, 'admin');
		const dialog = await openDeleteDialog(page, catalog.livros.primary);
		await dialog
			.getByRole('button', { name: `Confirmar exclusão do livro ${catalog.livros.primary.titulo}` })
			.click();

		const notification = page.getByTestId('regiao-notificacao');
		await expect(notification).toContainText('Livro excluído com sucesso.');
		const box = await readBox(notification);
		const viewport = page.viewportSize();
		const maxWidth = await page.evaluate(() =>
			parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--container-notification')),
		);
		const rootFontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
		await expect(notification).toHaveCSS('position', 'fixed');
		await expect(notification).toHaveCSS('background-color', await readTokenColor(page, '--color-success'));
		expect((viewport?.width ?? 0) - (box.x + box.width)).toBeLessThanOrEqual(CORNER_GAP_LIMIT);
		expect((viewport?.height ?? 0) - (box.y + box.height)).toBeLessThanOrEqual(CORNER_GAP_LIMIT);
		expect(box.width).toBeLessThanOrEqual(maxWidth * rootFontSize + WIDTH_TOLERANCE);

		await notification.getByRole('button', { name: 'open' }).click();
		await expect(notification).toBeHidden();
	});

	test('E2E-15 abre o modal sobre o fundo escurecido e fecha em Cancelar', async ({ page, e2e }) => {
		const catalog = await e2e.createBookCatalog();
		await e2e.authenticate(page, 'admin');

		const dialog = await openDeleteDialog(page, catalog.livros.primary);

		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText(`Confirma a exclusão de “${catalog.livros.primary.titulo}”?`);
		await expect(
			dialog.getByRole('button', { name: `Confirmar exclusão do livro ${catalog.livros.primary.titulo}` }),
		).toBeVisible();
		const backdrop = await dialog.evaluate((element) => getComputedStyle(element, '::backdrop').backgroundColor);
		expect(backdrop).not.toMatch(/^(transparent|rgba\(0, 0, 0, 0\))$/);
		await dialog.getByRole('button', { name: 'Cancelar' }).click();
		await expect(dialog).toBeHidden();
	});

	test('E2E-15 fecha o modal de confirmação com Escape', async ({ page, e2e }) => {
		const catalog = await e2e.createBookCatalog();
		await e2e.authenticate(page, 'admin');
		const dialog = await openDeleteDialog(page, catalog.livros.primary);
		await expect(dialog).toBeVisible();

		await page.keyboard.press('Escape');

		await expect(dialog).toBeHidden();
		expect(await e2e.countBooksByTitle(catalog.livros.primary.titulo)).toBe(1);
	});

	test('E2E-16 oculta navegação, formulário e ações e remove fundos ao imprimir a consulta', async ({
		page,
		e2e,
	}) => {
		const catalog = await e2e.createBookCatalog();
		await e2e.authenticate(page, 'admin');
		await findCatalogBookRow(page, catalog.livros.primary);

		await page.emulateMedia({ media: 'print' });

		const { sidebar, topbar } = shellRegions(page);
		for (const region of [sidebar, topbar, page.getByRole('navigation', { name: 'breadcrumbs' })]) {
			await expect(region).toBeHidden();
		}
		await expect(page.locator('form').first()).toBeHidden();
		await expect(page.getByRole('columnheader', { name: 'Ações' })).toBeHidden();
		await expect(page.getByRole('link', { name: `Editar livro ${catalog.livros.primary.titulo}` })).toBeHidden();
		await expect(page.getByRole('cell', { name: catalog.livros.primary.titulo })).toBeVisible();
		expect(await findPrintBackgroundViolations(page)).toEqual([]);
	});
});
