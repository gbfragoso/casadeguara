import { expect, test } from './fixtures';
import { findCatalogBookRow, openBooksPage } from './livros-browser';

const CENTER_TOLERANCE = 1.5;

test.describe('aparência do resultado da consulta de livros', () => {
	test('mantém sem sublinhado o link Novo com aparência de botão sob o cursor', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'admin');
		await openBooksPage(page);
		const create = page.getByRole('link', { name: 'Novo' });

		await create.hover();

		await expect(create).toHaveCSS('text-decoration-line', 'none');
	});

	test('centraliza verticalmente o conteúdo de cada célula da linha', async ({ page, e2e }) => {
		const catalog = await e2e.createBookCatalog();
		await e2e.authenticate(page, 'admin');

		const row = await findCatalogBookRow(page, catalog.livros.primary);
		const offsets = await row.evaluate((element: HTMLTableRowElement) => {
			const rowBox = element.getBoundingClientRect();
			const rowCenter = rowBox.top + rowBox.height / 2;
			return [...element.cells].map((cell) => {
				const contents = document.createRange();
				contents.selectNodeContents(cell);
				const box = contents.getBoundingClientRect();
				return box.top + box.height / 2 - rowCenter;
			});
		});

		expect(offsets.filter((offset) => Math.abs(offset) > CENTER_TOLERANCE)).toEqual([]);
	});
});
