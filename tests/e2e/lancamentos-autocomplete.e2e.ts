import { test, expect } from './fixtures';
import { fillLancamentoForm, openLancamentoForm } from './lancamentos-browser';
import { createEntrySeed } from './lancamentos-fixture';

test('pesquisa cadastro sem acento e caixa, seleciona pelo teclado e cadastra entrada', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('Clício Fogaça');
	const seed = createEntrySeed(e2e.token, 'autocomplete', counterpart.id);
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentoForm(page);
	await fillLancamentoForm(page, seed);
	const input = page.getByRole('combobox', { name: 'Doador (obrigatório)' });

	await input.fill(`CLICIO FOGACA-${e2e.token}`);
	await expect(page.getByRole('option', { name: counterpart.name, exact: true })).toBeVisible();
	await input.press('ArrowDown');
	await input.press('Enter');
	await expect(input).toHaveValue(counterpart.name);
	await page.getByRole('button', { name: 'Cadastrar' }).click();

	await expect(page).toHaveURL(/\/recibo\/[0-9a-f-]+$/);
	const created = await e2e.readLancamentoByDescription(seed.descricao);
	expect(created.idcontraparte).toBe(counterpart.id);
});

test('restaura o cadastro escolhido após erro de validação do lançamento', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('Clébio Medeiros Fragoso');
	const seed = createEntrySeed(e2e.token, 'autocomplete-validacao', counterpart.id, { valor: 'inválido' });
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentoForm(page);
	await fillLancamentoForm(page, seed);
	const input = page.getByRole('combobox', { name: 'Doador (obrigatório)' });

	await input.fill('clebio medeiros fragoso');
	await page.getByRole('option', { name: counterpart.name, exact: true }).click();
	await page.getByRole('button', { name: 'Cadastrar' }).click();

	await expect(page.locator('#valor-errors')).toBeVisible();
	await expect(input).toHaveValue(counterpart.name);
	await expect(page.locator('input[name="contraparteId"]')).toHaveValue(String(counterpart.id));
});

test('limpa a seleção editada e permite saída sem favorecido', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('Clício Fogaça');
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentoForm(page);
	const input = page.getByRole('combobox', { name: 'Doador (obrigatório)' });
	await input.fill(counterpart.name);
	await page.getByRole('option', { name: counterpart.name, exact: true }).click();

	await input.fill('cadastro inexistente');
	await expect(page.locator('input[name="contraparteId"]')).toHaveValue('');
	await expect(page.getByRole('status')).toHaveText('Nenhum cadastro encontrado.');
	await input.press('Tab');
	await page.getByLabel('Tipo', { exact: true }).selectOption('saida');

	const favored = page.getByRole('combobox', { name: 'Favorecido (opcional)' });
	await expect(favored).toHaveValue('');
	await expect(favored).not.toHaveAttribute('required');
});
