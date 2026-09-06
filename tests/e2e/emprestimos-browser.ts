import type { Locator, Page } from '@playwright/test';
import { expect, waitForHydration, type E2EData } from './fixtures';

export const openLoanForm = async (page: Page, e2e: E2EData) => {
	await e2e.authenticate(page, 'wrongRole');
	const response = await page.goto('/biblioteca/emprestimos/novo');
	if (!response) throw new Error('Página de empréstimo não respondeu.');
	await waitForHydration(page);
	return response.text();
};

export const selectLoanOption = async (field: Locator, query: string) => {
	await field.fill(query);
	await field.press('ArrowDown');
	await field.press('Enter');
};

export const prepareRejectedLoan = async (page: Page, e2e: E2EData) => {
	const reader = await e2e.createParticipant('Clício Fogaça');
	const catalog = await e2e.createBookCatalog();
	await e2e.database`update cadastros set status = false where idleitor = ${reader.id}`;
	await openLoanForm(page, e2e);
	await selectLoanOption(page.getByRole('combobox', { name: 'Leitor', exact: true }), reader.name);
	await selectLoanOption(page.getByRole('combobox', { name: 'Exemplar', exact: true }), catalog.livros.related.tombo);
	return reader;
};

export const submitRejectedLoan = async (page: Page) => {
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/biblioteca/emprestimos/novo',
	);
	await page.getByRole('button', { name: 'Cadastrar' }).click();
	const response = await responsePromise;
	expect(await response.json()).toMatchObject({ type: 'failure', status: 400 });
	await expect(page.locator('#emprestimo-errors')).toContainText('Este leitor está inativo');
};
