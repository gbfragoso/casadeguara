import { test, expect, waitForHydration } from './fixtures';
import {
	createLoanThroughForm,
	installPrintCounter,
	prepareReceiptLoan,
	readPrintCount,
	receiptPath,
} from './emprestimos-recibo-browser';

test.beforeEach(async ({ page }) => {
	await installPrintCounter(page);
});

test('E2E-01 abre o diálogo uma vez no recibo criado pelo cadastro', async ({ page, e2e }) => {
	const loan = await prepareReceiptLoan(e2e);

	const loanId = await createLoanThroughForm(page, e2e, loan);

	await expect(page).toHaveURL(receiptPath(loanId));
	await expect.poll(() => readPrintCount(page)).toBe(1);
});

test('E2E-02 reabre o diálogo pelo botão depois de fechado', async ({ page, e2e }) => {
	const loan = await prepareReceiptLoan(e2e);
	await createLoanThroughForm(page, e2e, loan);
	await expect.poll(() => readPrintCount(page)).toBe(1);

	await page.getByRole('button', { name: 'Imprimir recibo' }).click();

	await expect.poll(() => readPrintCount(page)).toBe(2);
});

test('E2E-03 não abre o diálogo ao recarregar o recibo', async ({ page, e2e }) => {
	const loan = await prepareReceiptLoan(e2e);
	await createLoanThroughForm(page, e2e, loan);
	await expect.poll(() => readPrintCount(page)).toBe(1);

	await page.reload();
	await waitForHydration(page);

	await expect(page.getByRole('button', { name: 'Imprimir recibo' })).toBeVisible();
	expect(await readPrintCount(page)).toBe(0);
});

test('E2E-04 não abre o diálogo ao abrir o recibo pela lista', async ({ page, e2e }) => {
	const loan = await prepareReceiptLoan(e2e);
	const loanId = await createLoanThroughForm(page, e2e, loan);
	await page.goto('/biblioteca/emprestimos');
	await waitForHydration(page);
	await page.getByRole('textbox', { name: 'Leitor', exact: true }).fill(loan.readerName);
	await page.getByRole('button', { name: 'Pesquisar' }).click();

	await page.getByRole('link', { name: 'Recibo', exact: true }).click();

	await expect(page).toHaveURL(receiptPath(loanId));
	await expect(page.getByRole('button', { name: 'Imprimir recibo' })).toBeVisible();
	expect(await readPrintCount(page)).toBe(0);
});
