import { test, expect, waitForHydration } from './fixtures';
import { getPdfPageCount, millimetersToPixels, openReceipt } from './emprestimos-recibo-browser';

const PRINT_COLUMN_MM = 72;
const PAPER_ROLL_WIDTH_MM = 80;
const PDF_PAGE_HEIGHT = '297mm';
const WIDTH_TOLERANCE_PX = 1;
const BLACK = 'rgb(0, 0, 0)';

test('E2E-05 imprime somente o recibo em preto na coluna de 72 mm', async ({ page, e2e }) => {
	await openReceipt(page, e2e);
	const receipt = page.getByTestId('recibo-termico');

	await page.emulateMedia({ media: 'print' });

	await expect(page.getByTestId('regiao-menu-lateral')).toBeHidden();
	await expect(page.getByRole('button', { name: 'menu', exact: true })).toBeHidden();
	await expect(page.getByRole('navigation', { name: 'breadcrumbs' })).toBeHidden();
	await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
	await expect(page.getByRole('button', { name: 'Imprimir recibo' })).toBeHidden();
	expect((await receipt.boundingBox())?.width).toBeLessThanOrEqual(millimetersToPixels(PRINT_COLUMN_MM));
	const colors = await receipt.evaluate((root) =>
		[root, ...root.querySelectorAll('*')].map((element) => getComputedStyle(element).color),
	);
	expect(new Set(colors)).toEqual(new Set([BLACK]));
	await expect(page.locator('img:visible')).toHaveCount(0);
});

test('E2E-06 gera em 80 mm uma página com as vias em ordem', async ({ page, e2e }) => {
	await openReceipt(page, e2e);

	const pdf = await page.pdf({ width: `${PAPER_ROLL_WIDTH_MM}mm`, height: PDF_PAGE_HEIGHT });

	expect(await getPdfPageCount(pdf)).toBe(1);
	await page.emulateMedia({ media: 'print' });
	const text = await page.getByTestId('recibo-termico').innerText();
	const positions = ['VIA DA BIBLIOTECA', 'CORTE AQUI', 'VIA DO LEITOR'].map((part) =>
		text.toUpperCase().indexOf(part),
	);
	expect(positions.every((position) => position >= 0)).toBe(true);
	expect(positions).toEqual([...positions].sort((first, second) => first - second));
});

test('E2E-07 mostra título de 80 e nome de 60 caracteres inteiros e sem overflow', async ({ page, e2e }) => {
	const loan = await openReceipt(page, e2e);
	const receipt = page.getByTestId('recibo-termico');
	const hasOverflow = () => receipt.evaluate((element) => element.scrollWidth > element.clientWidth);

	const copies = [
		page.getByRole('region', { name: 'Via da biblioteca' }),
		page.getByRole('region', { name: 'Via do leitor' }),
	];

	await Promise.all(
		copies.flatMap((copy) => [expect(copy).toContainText(loan.title), expect(copy).toContainText(loan.readerName)]),
	);
	expect(await hasOverflow()).toBe(false);
	await page.emulateMedia({ media: 'print' });
	expect(await hasOverflow()).toBe(false);
});

test('E2E-08 não vaza a página nomeada para outra tela impressa', async ({ page, e2e }) => {
	await openReceipt(page, e2e, 'admin');

	await page.getByRole('link', { name: 'cobranças' }).click();
	await page.waitForURL('**/biblioteca/cobrancas');
	await waitForHydration(page);
	await page.emulateMedia({ media: 'print' });

	const namedPages = await page.evaluate(() =>
		[...document.querySelectorAll('*')]
			.map((element) => getComputedStyle(element).getPropertyValue('page'))
			.filter((value) => value !== 'auto'),
	);
	expect(namedPages).toEqual([]);
});

test('E2E-09 pré-visualiza a tira com a largura da bobina', async ({ page, e2e }) => {
	await openReceipt(page, e2e);

	const width = (await page.getByTestId('recibo-termico').boundingBox())?.width ?? 0;

	expect(Math.abs(width - millimetersToPixels(PAPER_ROLL_WIDTH_MM))).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
	await expect(page.getByRole('region', { name: 'Via da biblioteca' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Via do leitor' })).toBeVisible();
});
