import type { Page } from '@playwright/test';

import { waitForHydration, type E2EData } from '../fixtures';
import type { CatalogRoute } from './route-catalog';
import { createRouteEntities } from './route-entities';

export const MODULE_HOME = '/biblioteca';
const EXTRA_CONTENT_HEIGHT = '3000px';

export const shellRegions = (page: Page) => ({
	sidebar: page.getByTestId('regiao-menu-lateral'),
	topbar: page.getByTestId('regiao-barra-superior'),
	menuButton: page.getByTestId('regiao-barra-superior').getByRole('button', { name: 'menu', exact: true }),
	themeToggle: page.getByTestId('regiao-barra-superior').locator('[data-theme-toggle]'),
	userMenuTrigger: page.getByTestId('regiao-barra-superior').getByRole('button', { name: 'Menu do usuário' }),
	userMenu: page.locator('#dropdown-menu'),
});

export const openModulePage = async (page: Page, e2e: E2EData, path = MODULE_HOME) => {
	await e2e.authenticate(page, 'fullAdmin');
	await page.goto(path);
	await waitForHydration(page);
};

export const extendDocumentHeight = (page: Page) =>
	page.evaluate((height) => {
		const filler = document.createElement('div');
		filler.style.height = height;
		document.querySelector('main section')?.append(filler);
	}, EXTRA_CONTENT_HEIGHT);

export const scrollDocumentToEnd = (page: Page) =>
	page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

export const openCatalogRoute = async (page: Page, e2e: E2EData, route: CatalogRoute) => {
	const entities = await createRouteEntities(e2e);
	if (route.role === 'admin') await e2e.authenticate(page, 'fullAdmin');
	await page.goto(route.path(entities));
	await waitForHydration(page);
};
