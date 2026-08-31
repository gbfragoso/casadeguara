import { test, expect, waitForHydration } from './fixtures';

import { createNoticeText } from './avisos-support';

test('E2E-15 creates and locates a notice', async ({ page, e2e }) => {
	const fixture = await e2e.createNotice();
	const createdText = createNoticeText(e2e.token, 'criado');
	await e2e.authenticate(page);
	await page.goto('/biblioteca/avisos');
	await waitForHydration(page);
	await expect(page.getByText(fixture.text, { exact: true })).toBeVisible();
	await page.goto('/biblioteca');
	await waitForHydration(page);
	await expect(page.locator('p').filter({ hasText: fixture.text })).toBeVisible();
	await page.getByRole('link', { name: 'avisos' }).click();
	await page.getByLabel('Texto do aviso').fill(createdText);
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/biblioteca/avisos',
	);
	await page.getByRole('button', { name: 'Novo' }).click();
	expect((await responsePromise).ok()).toBe(true);
	await expect(page.getByText('Aviso criado com sucesso!')).toBeVisible();
	await expect(page.getByText(createdText, { exact: true })).toBeVisible();
	expect(await e2e.countNotices(createdText)).toBe(1);
});

test('E2E-16 updates an existing notice', async ({ page, e2e }) => {
	const fixture = await e2e.createNotice();
	const updatedText = createNoticeText(e2e.token, 'atualizado');
	await e2e.authenticate(page);
	await page.goto(`/biblioteca/avisos/${fixture.id}`);
	await waitForHydration(page);
	await expect(page.getByLabel('Texto do aviso')).toHaveValue(fixture.text);
	await page.getByLabel('Texto do aviso').fill(updatedText);
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			/\/biblioteca\/avisos\/\d+$/.test(new URL(response.url()).pathname),
	);
	await page.getByRole('button', { name: 'Atualizar' }).click();
	expect((await responsePromise).ok()).toBe(true);
	await expect(page.getByText('Aviso atualizado com sucesso!')).toBeVisible();
	await page.goto('/biblioteca/avisos');
	await waitForHydration(page);
	await expect(page.getByText(updatedText, { exact: true })).toBeVisible();
});
