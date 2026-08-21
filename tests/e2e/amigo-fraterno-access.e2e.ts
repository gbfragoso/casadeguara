import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { signIn } from './cadastros-browser';
import { closeDatabase, createTestUsers, deleteTestUsers, type TestUsers } from './cadastros-database';
import { createName, createParticipant, deleteParticipants, setAmigoFraterno } from './amigo-fraterno-support';

const token = randomUUID().slice(0, 8);
const names: string[] = [];
let users: TestUsers | undefined;

test.describe.serial('Amigo Fraterno cross-access and accessibility', () => {
	test.beforeAll(async () => {
		users = await createTestUsers(token);
	});

	test.afterAll(async () => {
		await deleteParticipants(names);
		if (users) await deleteTestUsers(users);
		await closeDatabase();
	});

	test('E2E-05 blocks biblioteca, tesouraria, and unauthenticated direct access', async ({ browser, page }) => {
		const name = createName('acesso');
		names.push(name);
		const id = await createParticipant(name, true);
		await setAmigoFraterno(id, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		expect((await page.request.get('/secretaria/amigofraterno/pdf')).status()).toBe(401);
		const bibliotecaContext = await browser.newContext();
		const tesourariaContext = await browser.newContext();
		const biblioteca = await bibliotecaContext.newPage();
		const tesouraria = await tesourariaContext.newPage();
		try {
			await signIn(biblioteca, users.wrongRole.email, users.wrongRole.password, '**/biblioteca');
			await signIn(tesouraria, users.tesouraria.email, users.tesouraria.password, '**/tesouraria');
			for (const rolePage of [biblioteca, tesouraria]) {
				expect((await rolePage.request.get(`/secretaria/cadastros/${id}/foto`)).status()).toBe(401);
				expect((await rolePage.request.get('/secretaria/amigofraterno/pdf')).status()).toBe(401);
				await rolePage.goto('/secretaria/amigofraterno');
				await expect(rolePage.getByText(name, { exact: true })).toBeHidden();
			}
		} finally {
			await bibliotecaContext.close();
			await tesourariaContext.close();
		}
	});

	test('E2E-06 keeps controls keyboard-operable and the list usable on mobile', async ({ page }) => {
		const name = createName('mobile');
		names.push(name);
		const id = await createParticipant(name);
		await setAmigoFraterno(id, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.getByRole('link', { name: 'Amigo Fraterno' }).focus();
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(/\/secretaria\/amigofraterno$/);
		await expect(page.locator('[aria-live="polite"]')).toContainText('Sem foto: 1');
		await page.setViewportSize({ width: 375, height: 667 });
		await expect(page.locator('.table-container')).toBeVisible();
		await expect(page.getByText(name, { exact: true })).toBeVisible();
	});
});
