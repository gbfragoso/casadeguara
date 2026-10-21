import { expect, test } from './fixtures';
import { isInsideViewport } from './support/geometry';
import { extendDocumentHeight, openModulePage, scrollDocumentToEnd, shellRegions } from './support/module-shell';

const DESKTOP_WIDTHS = [1024, 1366];
const TOUCH_WIDTHS = [390, 820];
const VIEWPORT_HEIGHT = 768;
const SHORT_VIEWPORT_HEIGHT = 480;
const WHEEL_DISTANCE = 2000;
const PRIMARY_COLOR = 'rgb(1, 127, 192)';
const MARKER_COLOR = 'rgb(255, 183, 15)';

test.describe('menu lateral dos módulos', () => {
	for (const width of DESKTOP_WIDTHS) {
		test(`E2E-01 exibe o menu fixo sem botão de menu em ${width} px`, async ({ page, e2e }) => {
			await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
			await openModulePage(page, e2e);

			const { sidebar, menuButton } = shellRegions(page);

			await expect(sidebar).toBeVisible();
			await expect(menuButton).toBeHidden();
		});
	}

	for (const width of TOUCH_WIDTHS) {
		test(`E2E-01 alterna o menu pelo botão de menu em ${width} px`, async ({ page, e2e }) => {
			await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
			await openModulePage(page, e2e);
			const { sidebar, menuButton } = shellRegions(page);
			await expect(sidebar).toBeHidden();

			await menuButton.click();
			await expect(sidebar).toBeVisible();
			await menuButton.click();

			await expect(sidebar).toBeHidden();
			await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
		});
	}

	test('E2E-01 recolhe o menu aberto depois de navegar por um item', async ({ page, e2e }) => {
		await page.setViewportSize({ width: TOUCH_WIDTHS[0], height: VIEWPORT_HEIGHT });
		await openModulePage(page, e2e);
		const { sidebar, menuButton } = shellRegions(page);
		await menuButton.click();

		await sidebar.getByRole('link', { name: 'livros' }).click();

		await expect(page).toHaveURL(/\/biblioteca\/livros$/);
		await expect(sidebar).toBeHidden();
		await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
	});

	test('E2E-02 mantém o menu na janela após rolar o documento até o fim', async ({ page, e2e }) => {
		await page.setViewportSize({ width: 1366, height: VIEWPORT_HEIGHT });
		await openModulePage(page, e2e);
		await extendDocumentHeight(page);

		await scrollDocumentToEnd(page);

		const { sidebar } = shellRegions(page);
		expect(await isInsideViewport(sidebar)).toBe(true);
		await sidebar.getByRole('link', { name: 'usuários' }).click({ trial: true });
	});

	test('E2E-02 rola o menu sozinho quando os itens não cabem na janela', async ({ page, e2e }) => {
		await page.setViewportSize({ width: 1366, height: SHORT_VIEWPORT_HEIGHT });
		await openModulePage(page, e2e);
		await extendDocumentHeight(page);
		const { sidebar } = shellRegions(page);
		const lastItem = sidebar.getByRole('link', { name: 'usuários' });
		expect(await sidebar.evaluate((nav) => nav.scrollHeight > nav.clientHeight)).toBe(true);

		await sidebar.hover();
		await page.mouse.wheel(0, WHEEL_DISTANCE);

		await expect.poll(() => isInsideViewport(lastItem)).toBe(true);
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
	});

	test('E2E-04 destaca o item ativo com a cor primária e o marcador dourado', async ({ page, e2e }) => {
		await page.setViewportSize({ width: 1366, height: VIEWPORT_HEIGHT });
		await openModulePage(page, e2e, '/biblioteca/livros');

		const active = shellRegions(page).sidebar.locator('[aria-current="page"]');

		await expect(active).toHaveAccessibleName('livros');
		await expect(active.locator('i')).toHaveCSS('color', PRIMARY_COLOR);
		await expect(active.locator('span[aria-hidden="true"]')).toHaveCSS('background-color', MARKER_COLOR);
	});

	test('E2E-04 muda o fundo do item sob o cursor', async ({ page, e2e }) => {
		await page.setViewportSize({ width: 1366, height: VIEWPORT_HEIGHT });
		await openModulePage(page, e2e, '/biblioteca/livros');
		const item = shellRegions(page).sidebar.getByRole('link', { name: 'autores' });
		const readBackground = () => item.evaluate((link) => getComputedStyle(link).backgroundColor);
		const idle = await readBackground();

		await item.hover();

		await expect.poll(readBackground).not.toBe(idle);
	});
});
