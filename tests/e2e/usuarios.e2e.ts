import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';

import { signIn } from './cadastros-browser';
import { deleteUserByUsername } from './comunicacao-database';
import { expect, test, waitForHydration, type E2EData } from './fixtures';
import { auditWcagViolations } from './support/accessibility';
import { readDocumentWidth } from './support/geometry';
import { openCatalogRoute, openModulePage, shellRegions } from './support/module-shell';
import { selectRoutes } from './support/route-catalog';

type NewAccount = { name: string; username: string; password: string };

const MODULE_SELECTION_URL = /\/sistemas$/;
const USER_MANAGEMENT_URL = /\/usuarios$/;
const COLOR_SCHEMES = ['light', 'dark'] as const;
const PHONE_VIEWPORT = { width: 390, height: 844 };
const USER_MANAGEMENT_ROUTES = selectRoutes(['usuarios', 'usuarios-novo', 'usuarios-edicao']);
const AREAS_WITHOUT_USER_SCREENS = ['/biblioteca', '/secretaria', '/comunicacao/palestras'];
const REMOVED_USER_PATHS = ['biblioteca', 'secretaria', 'comunicacao'].flatMap((area) => [
	`/${area}/usuarios`,
	`/${area}/usuarios/novo`,
	`/${area}/usuarios/abc123`,
]);

const chooseAccess = (page: Page, module: string, level: string) =>
	page.getByRole('group', { name: module }).getByRole('radio', { name: level }).check();

const createAccount = async (page: Page, account: NewAccount) => {
	await page.goto('/usuarios/novo');
	await waitForHydration(page);
	await page.getByLabel('Usuário', { exact: true }).fill(account.username);
	await page.getByLabel('Nome', { exact: true }).fill(account.name);
	await page.getByLabel('Senha', { exact: true }).fill(account.password);
	await chooseAccess(page, 'Secretaria', 'Voluntário');
	await chooseAccess(page, 'Tesouraria', 'Coordenação');

	await page.getByRole('button', { name: 'Cadastrar' }).click();

	await expect(page.getByText('Usuário cadastrado com sucesso!')).toBeVisible();
};

const openUserMenu = async (page: Page, e2e: E2EData, role: 'fullAdmin' | 'admin') => {
	await e2e.authenticate(page, role);
	await page.goto('/biblioteca');
	await waitForHydration(page);
	const { userMenuTrigger, userMenu } = shellRegions(page);
	await userMenuTrigger.click();
	await expect(userMenu).toBeVisible();
	return userMenu;
};

test.describe('gestão de usuários', () => {
	test('E2E-01 cria um usuário da Secretaria e da Tesouraria que entra no sistema', async ({
		browser,
		page,
		e2e,
	}) => {
		const account = {
			name: `Usuário ${e2e.token}`,
			username: `e2e-novo-${e2e.token}@t.dev`,
			password: randomUUID(),
		};
		const accountContext = await browser.newContext();
		try {
			await e2e.authenticate(page, 'superuser');
			await createAccount(page, account);

			const accountPage = await accountContext.newPage();
			await signIn(accountPage, account.username, account.password, '**/sistemas');

			await expect(accountPage).toHaveURL(MODULE_SELECTION_URL);
		} finally {
			await accountContext.close();
			await deleteUserByUsername(e2e.database, account.username);
		}
	});

	test('E2E-02 leva quem só tem superuser da seleção de módulos à lista de usuários', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'superuser');

		await page.getByRole('link', { name: 'Usuários' }).click();

		await expect(page).toHaveURL(USER_MANAGEMENT_URL);
		await expect(page.getByText(e2e.users.superuser.email, { exact: true })).toBeVisible();
	});

	test('E2E-03 mostra Usuários no menu do usuário ao superusuário', async ({ page, e2e }) => {
		const userMenu = await openUserMenu(page, e2e, 'fullAdmin');

		await expect(userMenu.getByRole('link', { name: 'Usuários' })).toBeVisible();
	});

	test('E2E-03 esconde Usuários do menu do usuário da coordenação sem superuser', async ({ page, e2e }) => {
		const userMenu = await openUserMenu(page, e2e, 'admin');

		await expect(userMenu.getByRole('link', { name: 'Meu cadastro' })).toBeVisible();
		await expect(userMenu.getByRole('link', { name: 'Usuários' })).toHaveCount(0);
	});

	test('E2E-05 não exige rolagem horizontal na lista de usuários em tela de celular', async ({ page, e2e }) => {
		await page.setViewportSize(PHONE_VIEWPORT);
		await e2e.authenticate(page, 'superuser');
		await page.goto('/usuarios');
		await waitForHydration(page);

		const { scrollWidth, innerWidth } = await readDocumentWidth(page);

		expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
	});

	for (const route of USER_MANAGEMENT_ROUTES) {
		for (const scheme of COLOR_SCHEMES) {
			test(`E2E-05 não tem violações do axe em ${route.id} no tema ${scheme}`, async ({ page, e2e }) => {
				await page.emulateMedia({ colorScheme: scheme });
				await openCatalogRoute(page, e2e, route);
				await expect(page.locator('main')).toBeVisible();

				const violations = await auditWcagViolations(page);

				expect(violations).toEqual([]);
			});
		}
	}
});

test.describe('telas de usuários removidas dos módulos', () => {
	for (const path of AREAS_WITHOUT_USER_SCREENS) {
		test(`E2E-04 esconde Usuários do menu lateral da coordenação em ${path}`, async ({ page, e2e }) => {
			await openModulePage(page, e2e, path);

			const { sidebar } = shellRegions(page);

			await expect(sidebar.getByRole('link').first()).toBeAttached();
			await expect(sidebar.getByRole('link', { name: 'usuários' })).toHaveCount(0);
		});
	}

	for (const path of REMOVED_USER_PATHS) {
		test(`E2E-04 responde 404 no endereço antigo ${path}`, async ({ page, e2e }) => {
			await e2e.authenticate(page, 'fullAdmin');

			const response = await page.goto(path);

			expect(response?.status()).toBe(404);
		});
	}
});
