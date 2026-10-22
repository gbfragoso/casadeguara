import { expect, test } from './fixtures';
import { isInsideViewport, readBox } from './support/geometry';
import { extendDocumentHeight, openModulePage, scrollDocumentToEnd, shellRegions } from './support/module-shell';

const VIEWPORTS = [
	{ width: 1366, height: 768 },
	{ width: 390, height: 844 },
];
const EDGE_TOLERANCE = 1;
const LIGHT_PAGE = 'rgb(246, 247, 249)';
const DARK_PAGE = 'rgb(22, 26, 34)';

test.describe('barra superior dos módulos', () => {
	for (const viewport of VIEWPORTS) {
		test(`E2E-03 mantém a barra no topo ao rolar em ${viewport.width} px`, async ({ page, e2e }) => {
			await page.setViewportSize(viewport);
			await openModulePage(page, e2e);
			await extendDocumentHeight(page);

			await scrollDocumentToEnd(page);

			const { topbar, themeToggle, userMenuTrigger, userMenu } = shellRegions(page);
			expect((await readBox(topbar)).y).toBe(0);
			expect(await isInsideViewport(topbar)).toBe(true);
			await themeToggle.click();
			await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
			await userMenuTrigger.click();
			await expect(userMenu.getByRole('button', { name: 'sair' })).toBeVisible();
		});
	}

	test('E2E-05 abre o menu do usuário alinhado à direita do gatilho', async ({ page, e2e }) => {
		await page.setViewportSize(VIEWPORTS[0]);
		await openModulePage(page, e2e);
		const { userMenuTrigger, userMenu } = shellRegions(page);

		await userMenuTrigger.click();

		await expect(userMenu).toBeVisible();
		await expect(userMenu).toContainText('Bem-vindo(a),');
		await expect(userMenu.getByRole('link', { name: 'Meu cadastro' })).toBeVisible();
		const [menuBox, triggerBox] = [await readBox(userMenu), await readBox(userMenuTrigger)];
		expect(Math.abs(menuBox.x + menuBox.width - (triggerBox.x + triggerBox.width))).toBeLessThanOrEqual(
			EDGE_TOLERANCE,
		);
	});

	test('E2E-05 fecha o menu do usuário no segundo acionamento', async ({ page, e2e }) => {
		await page.setViewportSize(VIEWPORTS[0]);
		await openModulePage(page, e2e);
		const { userMenuTrigger, userMenu } = shellRegions(page);

		await userMenuTrigger.click();
		await userMenuTrigger.click();

		await expect(userMenu).toBeHidden();
	});

	test('E2E-05 encerra a sessão pelo menu do usuário', async ({ page, e2e }) => {
		await page.setViewportSize(VIEWPORTS[0]);
		await openModulePage(page, e2e);
		const { userMenuTrigger, userMenu } = shellRegions(page);

		await userMenuTrigger.click();
		await userMenu.getByRole('button', { name: 'sair' }).click();

		await expect(page).toHaveURL('/');
		await page.goto('/sistemas');
		await expect(page).toHaveURL('/');
	});

	test('E2E-06 alterna para o tema escuro e volta ao do sistema após recarregar', async ({ page, e2e }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await openModulePage(page, e2e);
		const body = page.locator('body');

		await shellRegions(page).themeToggle.click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		await expect(body).toHaveCSS('background-color', DARK_PAGE);
		await page.reload();

		await expect(page.locator('html')).not.toHaveAttribute('data-theme');
		await expect(body).toHaveCSS('background-color', LIGHT_PAGE);
	});
});
