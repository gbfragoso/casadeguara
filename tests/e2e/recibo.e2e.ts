import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { readBox, readDocumentWidth } from './support/geometry';
import { openActiveReceipt, openReversedReceipt, REVERSAL_REASON } from './recibo-support';

const PHONE_VIEWPORT = { width: 390, height: 844 };
const A4_VIEWPORT = { width: 794, height: 1123 };
const TOLERANCE = 1;

const receiptOf = (page: Page) => page.locator('#recibo');

const findClippedTexts = (receipt: Locator) =>
	receipt.evaluate((element) =>
		[...element.querySelectorAll('*')]
			.filter((node) => node.children.length === 0 && (node.textContent ?? '').trim() !== '')
			.filter((node) => node.scrollWidth > node.clientWidth + 1)
			.map((node) => node.textContent?.trim()),
	);

const readBorder = (field: Locator) =>
	field.evaluate((element) => {
		const style = getComputedStyle(element);
		return { style: style.borderTopStyle, width: parseFloat(style.borderTopWidth) };
	});

test.describe('recibo de contribuição', () => {
	test('E2E-09 exibe o recibo sem rolagem horizontal em 390 px, com QR code e campos visíveis', async ({
		page,
		e2e,
	}) => {
		await page.setViewportSize(PHONE_VIEWPORT);
		const { contributor, entry } = await openActiveReceipt(page, e2e);
		const receipt = receiptOf(page);

		const { scrollWidth, innerWidth } = await readDocumentWidth(page);

		expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
		await expect(receipt.getByRole('img', { name: 'QR Code para conferir este recibo' })).toBeVisible();
		for (const text of [contributor.name.toUpperCase(), entry.descricao.toUpperCase(), 'R$ 150,00']) {
			await expect(receipt.getByText(text, { exact: true })).toBeVisible();
		}
		expect(await findClippedTexts(receipt)).toEqual([]);
	});

	test('E2E-18 mostra o aviso do recibo estornado com o motivo na tela e na impressão', async ({ page, e2e }) => {
		await openReversedReceipt(page, e2e);
		const notice = page.getByRole('status').filter({ hasText: 'Recibo estornado' });

		await expect(notice).toBeVisible();
		await expect(notice).toContainText(REVERSAL_REASON);
		await page.emulateMedia({ media: 'print' });
		await expect(notice).toBeVisible();
		await expect(notice).toContainText(REVERSAL_REASON);
		await expect(receiptOf(page)).toHaveCount(0);
	});

	test('E2E-18 imprime o recibo normal na largura da página, com QR code e molduras dos campos', async ({
		page,
		e2e,
	}) => {
		await page.setViewportSize(A4_VIEWPORT);
		const { contributor } = await openActiveReceipt(page, e2e);
		const receipt = receiptOf(page);

		await page.emulateMedia({ media: 'print' });

		expect(Math.abs((await readBox(receipt)).width - A4_VIEWPORT.width)).toBeLessThanOrEqual(TOLERANCE);
		await expect(receipt.getByRole('img', { name: 'QR Code para conferir este recibo' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Clique aqui para imprimir' })).toBeHidden();
		const border = await readBorder(receipt.getByText(contributor.name.toUpperCase(), { exact: true }));
		expect(border.style).toBe('solid');
		expect(border.width).toBeGreaterThan(0);
	});
});
