import type { Page } from '@playwright/test';

import { expect, test, type E2EData } from './fixtures';
import { findSmallTargets, readDocumentWidth } from './support/geometry';
import { openCatalogRoute, shellRegions } from './support/module-shell';
import { BIBLIOTECA_ROUTES } from './support/route-catalog/biblioteca';
import { SECRETARIA_ROUTES } from './support/route-catalog/secretaria';
import { NOT_FOUND_PATH, selectRoutes, type CatalogRoute } from './support/route-catalog';

const NARROW_VIEWPORT = { width: 320, height: 800 };
const TOUCH_WIDTHS = [390, 820];
const TOUCH_HEIGHT = 844;
const MIGRATED_ROUTES = [...selectRoutes(['login', 'sistemas']), ...BIBLIOTECA_ROUTES, ...SECRETARIA_ROUTES];

const openScreen = async (page: Page, e2e: E2EData, route: CatalogRoute | null) => {
	if (route) await openCatalogRoute(page, e2e, route);
	else await page.goto(NOT_FOUND_PATH);
	await expect(page.locator('main')).toBeVisible();
};

const expectNoHorizontalScroll = async (page: Page) => {
	const { scrollWidth, innerWidth } = await readDocumentWidth(page);
	expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
};

const SCREENS: readonly (CatalogRoute | null)[] = [...MIGRATED_ROUTES, null];
const screenName = (route: CatalogRoute | null) => route?.id ?? 'erro-404';

test.describe('responsividade das telas migradas', () => {
	for (const route of SCREENS) {
		test(`E2E-08 não exige rolagem horizontal em 320 px em ${screenName(route)}`, async ({ page, e2e }) => {
			await page.setViewportSize(NARROW_VIEWPORT);
			await openScreen(page, e2e, route);

			await expectNoHorizontalScroll(page);
			if (!route?.shell) return;
			await shellRegions(page).menuButton.click();
			await expectNoHorizontalScroll(page);
		});

		for (const width of TOUCH_WIDTHS) {
			test(`E2E-10 garante área de toque mínima em ${width} px em ${screenName(route)}`, async ({
				page,
				e2e,
			}) => {
				await page.setViewportSize({ width, height: TOUCH_HEIGHT });
				await openScreen(page, e2e, route);

				const violations = await findSmallTargets(page);

				expect(violations).toEqual([]);
			});
		}
	}
});
