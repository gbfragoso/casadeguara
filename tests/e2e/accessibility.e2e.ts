import type { Page } from '@playwright/test';

import { expect, test, type E2EData } from './fixtures';
import { auditTextContrast, findFocusIndicatorGaps, findLowContrastControls } from './support/accessibility';
import { searchLancamentosByDescription } from './lancamentos-browser';
import { openReversedReceipt } from './recibo-support';
import { openCatalogRoute, shellRegions } from './support/module-shell';
import { NOT_FOUND_PATH, selectRoutes, type CatalogRoute } from './support/route-catalog';

type AuditScreen = {
	name: string;
	route: CatalogRoute | null;
	viewport?: { width: number; height: number };
	open?: (page: Page, e2e: E2EData) => Promise<unknown>;
	prepare?: (page: Page, e2e: E2EData) => Promise<void>;
};

const COLOR_SCHEMES = ['light', 'dark'] as const;
const SIDEBAR_OVERLAY_VIEWPORT = { width: 390, height: 844 };
const REPRESENTATIVE_ROUTES = selectRoutes([
	'login',
	'sistemas',
	'biblioteca-inicio',
	'biblioteca-livros',
	'biblioteca-livros-novo',
	'biblioteca-livros-exemplares',
	'biblioteca-emprestimos-novo',
	'biblioteca-usuarios-novo',
	'biblioteca-emprestimos-recibo',
	'secretaria-inicio',
	'secretaria-cadastros-edicao',
	'secretaria-aniversariantes',
	'tesouraria-inicio',
	'comunicacao-palestras',
	'comunicacao-palestrantes-edicao',
	'comunicacao-palestrantes-importar',
	'comunicacao-usuarios-novo',
	'recibo',
]);
const [LIBRARY_HOME, LAUNCHES, NEW_LAUNCH, ACERVO] = selectRoutes([
	'biblioteca-inicio',
	'tesouraria-lancamentos',
	'tesouraria-lancamentos-novo',
	'acervo',
]);

const openUserMenu = async (page: Page) => {
	const { userMenuTrigger, userMenu } = shellRegions(page);
	await userMenuTrigger.click();
	await expect(userMenu).toBeVisible();
};

const openSidebar = async (page: Page) => {
	const { menuButton, sidebar } = shellRegions(page);
	await menuButton.click();
	await expect(sidebar).toBeVisible();
};

const searchLaunches = async (page: Page, e2e: E2EData) => {
	await searchLancamentosByDescription(page, e2e.token);
};

const typeAmount = async (page: Page) => {
	await page.getByLabel('Valor').fill('1234,56');
};

const searchAcervo = async (page: Page, e2e: E2EData) => {
	await page.getByLabel('Título').fill(`Livro Relacionado ${e2e.token.toUpperCase()}`);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	await expect(page.locator('tbody tr').first()).toBeVisible();
};

const SCREENS: readonly AuditScreen[] = [
	...REPRESENTATIVE_ROUTES.map((route) => ({ name: route.id, route })),
	{ name: 'erro-404', route: null },
	{ name: 'menus-abertos-menu-usuario', route: LIBRARY_HOME, prepare: openUserMenu },
	{
		name: 'menus-abertos-menu-lateral',
		route: LIBRARY_HOME,
		viewport: SIDEBAR_OVERLAY_VIEWPORT,
		prepare: openSidebar,
	},
	{ name: 'tesouraria-lancamentos-resultados', route: LAUNCHES, prepare: searchLaunches },
	{ name: 'tesouraria-lancamentos-novo-valor', route: NEW_LAUNCH, prepare: typeAmount },
	{ name: 'acervo-resultados', route: ACERVO, prepare: searchAcervo },
	{ name: 'recibo-estornado', route: null, open: openReversedReceipt },
];

const openScreen = async (page: Page, e2e: E2EData, screen: AuditScreen, scheme: 'light' | 'dark') => {
	await page.emulateMedia({ colorScheme: scheme });
	if (screen.viewport) await page.setViewportSize(screen.viewport);
	if (screen.open) await screen.open(page, e2e);
	else if (screen.route) await openCatalogRoute(page, e2e, screen.route);
	else await page.goto(NOT_FOUND_PATH);
	await expect(page.locator('main')).toBeVisible();
	await screen.prepare?.(page, e2e);
};

test.describe('acessibilidade das telas migradas', () => {
	for (const screen of SCREENS) {
		for (const scheme of COLOR_SCHEMES) {
			test(`E2E-19 mostra indicador de foco em ${screen.name} no tema ${scheme}`, async ({ page, e2e }) => {
				await openScreen(page, e2e, screen, scheme);

				const gaps = await findFocusIndicatorGaps(page);

				expect(gaps).toEqual([]);
			});

			test(`E2E-20 não tem violação de contraste de texto em ${screen.name} no tema ${scheme}`, async ({
				page,
				e2e,
			}) => {
				await openScreen(page, e2e, screen, scheme);

				const { violations, unresolved } = await auditTextContrast(page);

				expect(violations).toEqual([]);
				expect(unresolved).toEqual([]);
			});

			test(`E2E-20 mantém contraste de 3:1 nos controles em ${screen.name} no tema ${scheme}`, async ({
				page,
				e2e,
			}) => {
				await openScreen(page, e2e, screen, scheme);

				const controls = await findLowContrastControls(page);

				expect(controls).toEqual([]);
			});
		}
	}
});
