import { test, expect, waitForHydration } from './fixtures';

test('E2E-03 changes Amigo Fraterno participation', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('participacao');
	await e2e.authenticate(page);
	await page.goto('/secretaria/cadastros');
	await waitForHydration(page);
	await page.getByLabel('Nome do trabalhador').fill(participant.name);
	const search = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/secretaria/cadastros',
	);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	expect((await search).ok()).toBe(true);
	const checkbox = page.getByLabel(`Marcar ${participant.name} para o Amigo Fraterno`);
	await expect(checkbox).not.toBeChecked();

	const enter = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/cadastros');
	await checkbox.check();
	expect((await enter).ok()).toBe(true);
	await expect.poll(async () => (await e2e.readCadastro(participant.name)).amigo_fraterno).toBe(true);

	const leave = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/cadastros');
	await checkbox.uncheck();
	expect((await leave).ok()).toBe(true);
	await expect.poll(async () => (await e2e.readCadastro(participant.name)).amigo_fraterno).toBe(false);
});
