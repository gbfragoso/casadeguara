import { test, expect } from './fixtures';

import { assertBlockedSecretariaAccess } from './amigo-fraterno-access-support';

test('E2E-01 blocks Amigo Fraterno access for invalid sessions and roles', async ({ browser, page, e2e }) => {
	const participant = await e2e.createParticipant('acesso', true);
	await e2e.setAmigoFraterno(participant.id, true);
	await assertBlockedSecretariaAccess(page.request, e2e.database, participant.id, participant.name, 302);

	const bibliotecaContext = await browser.newContext();
	const tesourariaContext = await browser.newContext();
	try {
		const biblioteca = await bibliotecaContext.newPage();
		const tesouraria = await tesourariaContext.newPage();
		await e2e.authenticate(biblioteca, 'wrongRole');
		await e2e.authenticate(tesouraria, 'tesouraria');
		for (const rolePage of [biblioteca, tesouraria]) {
			await assertBlockedSecretariaAccess(rolePage.request, e2e.database, participant.id, participant.name, 401);
			await rolePage.goto('/secretaria/amigofraterno');
			await expect(rolePage.getByText(participant.name, { exact: true })).toBeHidden();
		}
	} finally {
		await bibliotecaContext.close();
		await tesourariaContext.close();
	}
});

test('E2E-02 keeps the Amigo Fraterno list keyboard-operable on mobile', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('mobile');
	await e2e.setAmigoFraterno(participant.id, true);
	await e2e.authenticate(page);
	await page.goto('/secretaria');
	await page.locator('a[aria-label="amigo fraterno"]').focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/secretaria\/amigofraterno$/);
	await expect(page.locator('[aria-live="polite"]')).toContainText('Sem foto:');
	await page.setViewportSize({ width: 375, height: 667 });
	await expect(page.locator('.table-container')).toBeVisible();
	await expect(page.getByText(participant.name, { exact: true })).toBeVisible();
});
