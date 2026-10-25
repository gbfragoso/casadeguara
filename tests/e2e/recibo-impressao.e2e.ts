import type { Page } from '@playwright/test';

import { millimetersToPixels } from './emprestimos-recibo-browser';
import { expect, test } from './fixtures';
import { openActiveReceipt, openLongestReceipt, readPdfPageSizes } from './recibo-support';
import { readBox } from './support/geometry';

const A4_WIDTH_MM = 210;
const HALF_A4_HEIGHT_MM = 148.5;
const CHROME_DEFAULT_MARGIN_MM = 10.16;
const A4_HEIGHT_PX = 1123;
const A4_PORTRAIT_POINTS = { width: 595.28, height: 841.89 };
const PIXEL_TOLERANCE = 1;
const POINT_TOLERANCE = 1;
const QR_CODE_NAME = 'QR Code para conferir este recibo';

const PRINTABLE_A4_VIEWPORT = {
	width: Math.floor(millimetersToPixels(A4_WIDTH_MM - 2 * CHROME_DEFAULT_MARGIN_MM)),
	height: A4_HEIGHT_PX,
};

type Box = Awaited<ReturnType<typeof readBox>>;

const receiptOf = (page: Page) => page.locator('#recibo');
const isRightOf = (right: Box, left: Box) => right.x >= left.x + left.width;
const isSameRow = (first: Box, second: Box) => first.y < second.y + second.height && second.y < first.y + first.height;

test.describe('impressão do recibo de contribuição', () => {
	test('E2E-RI-01 mantém o arranjo da tela na largura útil de uma A4 com margens padrão', async ({ page, e2e }) => {
		await page.setViewportSize(PRINTABLE_A4_VIEWPORT);
		const { contributor } = await openActiveReceipt(page, e2e);
		const receipt = receiptOf(page);

		await page.emulateMedia({ media: 'print' });

		await expect(receipt.getByRole('img', { name: QR_CODE_NAME })).toBeVisible();
		const [qrCode, title, label, value, date, signature] = await Promise.all([
			readBox(receipt.getByRole('img', { name: QR_CODE_NAME })),
			readBox(receipt.getByRole('heading', { name: 'GRUPO ESPÍRITA CASA DE GUARÁ' })),
			readBox(receipt.getByText('Recebemos do Sr.(a)', { exact: true })),
			readBox(receipt.getByText(contributor.name.toUpperCase(), { exact: true })),
			readBox(receipt.getByText('Data', { exact: true })),
			readBox(receipt.getByText('Assinatura', { exact: true })),
		]);
		expect(isRightOf(qrCode, title)).toBe(true);
		expect(isRightOf(value, label) && isSameRow(value, label)).toBe(true);
		expect(isSameRow(date, signature)).toBe(true);
	});

	test('E2E-RI-02 ocupa exatamente meia folha A4 retrato com o conteúdo máximo', async ({ page, e2e }) => {
		await page.setViewportSize(PRINTABLE_A4_VIEWPORT);
		const { descricao } = await openLongestReceipt(page, e2e);
		const receipt = receiptOf(page);

		await page.emulateMedia({ media: 'print' });

		await expect(receipt.getByText(descricao.toUpperCase(), { exact: true })).toBeVisible();
		const box = await readBox(receipt);
		const overflow = await receipt.evaluate((element) => element.scrollHeight - element.clientHeight);
		expect(Math.abs(box.width - millimetersToPixels(A4_WIDTH_MM))).toBeLessThanOrEqual(PIXEL_TOLERANCE);
		expect(Math.abs(box.height - millimetersToPixels(HALF_A4_HEIGHT_MM))).toBeLessThanOrEqual(PIXEL_TOLERANCE);
		expect(overflow).toBe(0);
	});

	test('E2E-RI-03 gera o recibo em uma única folha A4 retrato', async ({ page, e2e }) => {
		await openActiveReceipt(page, e2e);
		await expect(receiptOf(page).getByRole('img', { name: QR_CODE_NAME })).toBeVisible();

		const sizes = await readPdfPageSizes(await page.pdf({ preferCSSPageSize: true }));

		expect(sizes).toHaveLength(1);
		expect(Math.abs(sizes[0].width - A4_PORTRAIT_POINTS.width)).toBeLessThanOrEqual(POINT_TOLERANCE);
		expect(Math.abs(sizes[0].height - A4_PORTRAIT_POINTS.height)).toBeLessThanOrEqual(POINT_TOLERANCE);
	});
});
