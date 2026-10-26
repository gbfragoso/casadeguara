import { test, expect } from './fixtures';
import { scheduleName, waitForTalkAction } from './palestras-browser';

const MONDAY = 0;
const NOTES = 'Livro: Jesus e Atualidade';

test('cria a palestra já com título, palestrante novo e observações', async ({ page, e2e }) => {
	const date = e2e.talkDate(MONDAY);
	const title = `${e2e.token} nova`;
	const speaker = `Novo Nome ${e2e.token}`;
	await e2e.authenticate(page, 'comunicacao');

	await page.getByRole('button', { name: 'Nova palestra' }).click();
	await page.getByLabel('Data', { exact: true }).fill(date);
	await page.getByLabel('Título', { exact: true }).fill(title);
	await page.getByRole('combobox', { name: 'Palestrante' }).fill(speaker);
	await page.getByRole('option', { name: `Cadastrar «${speaker}»` }).click();
	await page.getByLabel('Observações', { exact: true }).fill(NOTES);
	const created = waitForTalkAction(page, 'criar');
	await page.getByRole('button', { name: 'Criar palestra' }).click();
	expect((await created).ok()).toBe(true);

	const card = page.getByRole('article', { name: scheduleName(date, '08:45', title) });
	await expect(card.getByRole('button', { name: `Editar palestrante: ${speaker}` })).toBeVisible();
	await expect(card.getByRole('button', { name: `Editar observações: ${NOTES}` })).toBeVisible();
});
