import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { readBox } from './support/geometry';
import { openCatalogRoute, shellRegions } from './support/module-shell';
import { NOT_FOUND_PATH, selectRoutes } from './support/route-catalog';

const VIEWPORTS = [
	{ width: 1366, height: 768 },
	{ width: 390, height: 844 },
];
const TOLERANCE = 1;

const accessCard = (page: Page) => page.locator('main > section > div').first();

const readContentWidth = (card: Locator) =>
	card.evaluate((element) => {
		const style = getComputedStyle(element);
		return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
	});

const expectCenteredCard = async (page: Page, width: number) => {
	const card = await readBox(accessCard(page));
	expect(Math.abs(card.x + card.width / 2 - width / 2)).toBeLessThanOrEqual(TOLERANCE);
};

const expectCardWidthButtons = async (page: Page, buttons: Locator) => {
	const contentWidth = await readContentWidth(accessCard(page));
	const widths = await buttons.evaluateAll((elements) =>
		elements.map((element) => element.getBoundingClientRect().width),
	);
	expect(widths.length).toBeGreaterThan(0);
	widths.forEach((width) => expect(Math.abs(width - contentWidth)).toBeLessThanOrEqual(TOLERANCE));
};

test.describe('telas de acesso e públicas', () => {
	for (const viewport of VIEWPORTS) {
		test(`E2E-21 centraliza o login com o botão na largura do cartão em ${viewport.width} px`, async ({
			page,
			e2e,
		}) => {
			await page.setViewportSize(viewport);
			await openCatalogRoute(page, e2e, selectRoutes(['login'])[0]);

			await expectCenteredCard(page, viewport.width);
			await expectCardWidthButtons(page, page.getByRole('button', { name: 'Entrar' }));
		});

		test(`E2E-21 centraliza a seleção de módulo com botões na largura do cartão em ${viewport.width} px`, async ({
			page,
			e2e,
		}) => {
			await page.setViewportSize(viewport);
			await openCatalogRoute(page, e2e, selectRoutes(['sistemas'])[0]);

			await expectCenteredCard(page, viewport.width);
			await expectCardWidthButtons(page, page.locator('main a'));
		});

		test(`E2E-21 centraliza o cartão da página de erro em ${viewport.width} px`, async ({ page }) => {
			await page.setViewportSize(viewport);
			await page.goto(NOT_FOUND_PATH);

			await expect(accessCard(page)).toContainText('404');
			await expectCenteredCard(page, viewport.width);
		});
	}

	for (const [id, content] of [
		['acervo', 'main'],
		['recibo', '#recibo'],
	]) {
		test(`E2E-21 exibe ${id} sem menu lateral nem barra superior`, async ({ page, e2e }) => {
			await openCatalogRoute(page, e2e, selectRoutes([id])[0]);

			const { sidebar, topbar } = shellRegions(page);

			await expect(page.locator(content)).toBeVisible();
			await expect(sidebar).toHaveCount(0);
			await expect(topbar).toHaveCount(0);
		});
	}
});
