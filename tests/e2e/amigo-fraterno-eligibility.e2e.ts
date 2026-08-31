import { test, expect } from './fixtures';

test('E2E-04 updates eligibility when worker or disincarnated status changes', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('elegibilidade');
	await e2e.setAmigoFraterno(participant.id, true);
	await e2e.authenticate(page);
	await page.goto('/secretaria/amigofraterno');
	await expect(page.getByText(participant.name, { exact: true })).toBeVisible();

	await e2e.setWorker(participant.id, false);
	expect((await page.reload())?.ok()).toBe(true);
	await expect(page.getByText(participant.name, { exact: true })).toBeHidden();

	await e2e.setWorker(participant.id, true);
	await e2e.setDisincarnated(participant.id, true);
	expect((await page.reload())?.ok()).toBe(true);
	await expect(page.getByText(participant.name, { exact: true })).toBeHidden();

	await e2e.setDisincarnated(participant.id, false);
	expect((await page.reload())?.ok()).toBe(true);
	await expect(page.getByText(participant.name, { exact: true })).toBeVisible();
});
