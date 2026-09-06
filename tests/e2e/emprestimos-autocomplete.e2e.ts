import { test, expect } from './fixtures';
import { openLoanForm, prepareRejectedLoan, submitRejectedLoan } from './emprestimos-browser';

test('renderiza os campos no servidor e encontra o nome acentuado pela busca sem acentos', async ({ page, e2e }) => {
	const reader = await e2e.createParticipant('Clício Fogaça');
	const html = await openLoanForm(page, e2e);
	const input = page.getByRole('combobox', { name: 'Leitor', exact: true });

	await input.fill(`CLICIO FOGACA-${e2e.token}`);
	await expect(page.getByRole('option', { name: reader.name, exact: true })).toBeVisible();
	await input.press('ArrowDown');
	await input.press('Enter');

	expect(html.match(/role="combobox"/g)).toHaveLength(2);
	expect(html).not.toContain('Carregando leitores');
	expect(html).not.toContain('Carregando exemplares');
	await expect(input).toHaveValue(reader.name);
	await expect(page.locator('input[name="leitorid"]')).toHaveValue(String(reader.id));
});

test('mantém os campos e suas seleções após rejeição sem recarregar as listas', async ({ page, e2e }) => {
	const reader = await prepareRejectedLoan(page, e2e);
	const fields = await page
		.locator('form.card')
		.evaluateHandle((form) => [...form.querySelectorAll('[role="combobox"]')]);
	const copyId = await page.locator('input[name="exemplarid"]').inputValue();
	const dataRequests: string[] = [];
	page.on('request', (request) => {
		if (new URL(request.url()).pathname.endsWith('/emprestimos/novo/__data.json')) dataRequests.push(request.url());
	});

	await submitRejectedLoan(page);

	expect(await fields.evaluate((inputs) => inputs.length === 2 && inputs.every((input) => input.isConnected))).toBe(
		true,
	);
	expect(dataRequests).toEqual([]);
	await expect(page.getByRole('combobox', { name: 'Leitor', exact: true })).toHaveValue(reader.name);
	await expect(page.locator('input[name="leitorid"]')).toHaveValue(String(reader.id));
	await expect(page.locator('input[name="exemplarid"]')).toHaveValue(copyId);
	await expect(page.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
});
