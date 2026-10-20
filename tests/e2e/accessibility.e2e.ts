import type { Page } from '@playwright/test';

import { expect, test, type E2EData } from './fixtures';
import { auditTextContrast, findFocusIndicatorGaps, findLowContrastControls } from './support/accessibility';
import { openCatalogRoute } from './support/module-shell';
import { NOT_FOUND_PATH, selectRoutes, type CatalogRoute } from './support/route-catalog';

const COLOR_SCHEMES = ['light', 'dark'] as const;
const SCREENS: readonly (CatalogRoute | null)[] = [...selectRoutes(['login', 'sistemas']), null];
const screenName = (route: CatalogRoute | null) => route?.id ?? 'erro-404';

const openScreen = async (page: Page, e2e: E2EData, route: CatalogRoute | null, scheme: 'light' | 'dark') => {
	await page.emulateMedia({ colorScheme: scheme });
	if (route) await openCatalogRoute(page, e2e, route);
	else await page.goto(NOT_FOUND_PATH);
	await expect(page.locator('main')).toBeVisible();
};

test.describe('acessibilidade das telas migradas', () => {
	for (const route of SCREENS) {
		for (const scheme of COLOR_SCHEMES) {
			test(`E2E-19 mostra indicador de foco em ${screenName(route)} no tema ${scheme}`, async ({ page, e2e }) => {
				await openScreen(page, e2e, route, scheme);

				const gaps = await findFocusIndicatorGaps(page);

				expect(gaps).toEqual([]);
			});

			test(`E2E-20 não tem violação de contraste de texto em ${screenName(route)} no tema ${scheme}`, async ({
				page,
				e2e,
			}) => {
				await openScreen(page, e2e, route, scheme);

				const { violations, unresolved } = await auditTextContrast(page);

				expect(violations).toEqual([]);
				expect(unresolved).toEqual([]);
			});

			test(`E2E-20 mantém contraste de 3:1 nos controles em ${screenName(route)} no tema ${scheme}`, async ({
				page,
				e2e,
			}) => {
				await openScreen(page, e2e, route, scheme);

				const controls = await findLowContrastControls(page);

				expect(controls).toEqual([]);
			});
		}
	}
});
