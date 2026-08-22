import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

import { signIn } from './cadastros-browser';
import { createTestUsers, deleteTestUsers, type TestUsers } from './cadastros-database';
import { countNotices, createNoticeFixtures, createNoticeText, deleteNotices } from './avisos-support';

const token = randomUUID().replaceAll('-', '').slice(0, 12);
const createdText = createNoticeText(token, 'criado');
const updatedText = createNoticeText(token, 'atualizado');
let users: TestUsers | undefined;
let expectedFixtures: string[] = [];

test.describe.serial('notice journey', () => {
	test.beforeAll(async () => {
		users = await createTestUsers(token);
		expectedFixtures = await createNoticeFixtures(token);
	});

	test.afterAll(async () => {
		await deleteNotices(token);
		if (users) await deleteTestUsers(users);
	});

	test('E2E-01 creates, locates, and updates a notice', async ({ page }) => {
		const owner = users?.owner;
		if (!owner) throw new Error('Usuário Biblioteca E2E não foi preparado.');

		await signIn(page, owner.email, owner.password, '**/sistemas');
		await page.goto('/biblioteca/avisos');
		await expect(page.getByText(expectedFixtures[0], { exact: true })).toBeVisible();
		await expect(page.getByText(expectedFixtures[4], { exact: true })).toBeVisible();
		await page.goto('/biblioteca');
		await expect(page.locator('p').filter({ hasText: expectedFixtures[0] })).toBeVisible();
		await expect(page.locator('p').filter({ hasText: expectedFixtures[4] })).toBeVisible();
		await page.goto('/biblioteca/avisos');
		await page.getByLabel('Texto do aviso').fill(createdText);
		await page.getByRole('button', { name: 'Novo' }).click();
		await expect(page.getByText('Aviso criado com sucesso!')).toBeVisible();
		await expect(page.getByText(createdText, { exact: true })).toBeVisible();
		expect(await countNotices(createdText)).toBe(1);
		const editPath = await page
			.getByLabel(/^Editar aviso /)
			.first()
			.getAttribute('href');
		if (!editPath) throw new Error('Ação de edição não foi encontrada.');
		await page.goto(editPath);
		await page.getByLabel('Texto do aviso').fill(updatedText);
		await expect(page.getByLabel('Texto do aviso')).toHaveValue(updatedText);
		const updateRequest = page.waitForRequest(
			(candidate) =>
				candidate.method() === 'POST' && /\/biblioteca\/avisos\/\d+$/.test(new URL(candidate.url()).pathname),
		);
		await page.getByRole('button', { name: 'Atualizar' }).click();
		expect(new URLSearchParams((await updateRequest).postData() ?? '').get('texto')).toBe(updatedText);
		await expect(page.getByText('Aviso atualizado com sucesso!')).toBeVisible();
		await page.goto('/biblioteca/avisos');
		await expect(page.getByText(updatedText, { exact: true })).toBeVisible();
	});
});
