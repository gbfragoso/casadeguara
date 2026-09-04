import type { Page } from '@playwright/test';

import { expect, waitForHydration } from './fixtures';

const getCounterpartLabel = (tipo: 'entrada' | 'saida') =>
	tipo === 'entrada' ? 'Doador (obrigatório)' : 'Favorecido (opcional)';

const getDateLabel = (tipo: 'entrada' | 'saida') => (tipo === 'entrada' ? 'Data do recebimento' : 'Data do pagamento');

export const openLancamentosPage = async (page: Page) => {
	await page.goto('/tesouraria/lancamentos');
	await waitForHydration(page);
};

export const submitLancamentosSearch = async (page: Page) => {
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/tesouraria/lancamentos',
	);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	return responsePromise;
};

export const searchLancamentosByDescription = async (page: Page, description: string) => {
	await page.getByLabel('Descrição').fill(description);
	const response = await submitLancamentosSearch(page);
	expect(response.ok()).toBe(true);
	await expect(page.locator('tbody')).toContainText(description);
};

export const submitAuditSearch = async (page: Page) => {
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/tesouraria/estornos',
	);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	return responsePromise;
};

export const findLancamentoRow = (page: Page, description: string) =>
	page.locator('tbody tr').filter({ hasText: description });

export const openLancamentoForm = async (page: Page) => {
	await page.goto('/tesouraria/lancamentos/novo');
	await waitForHydration(page);
};

export const fillLancamentoForm = async (
	page: Page,
	input: {
		tipo: 'entrada' | 'saida';
		contraparteId?: number;
		descricao: string;
		valor: string;
		dataLancamento: string;
	},
) => {
	const form = page.locator('form.card');
	await form.getByLabel('Tipo').selectOption(input.tipo);
	if (input.contraparteId !== undefined) {
		await form.getByLabel(getCounterpartLabel(input.tipo)).selectOption(`${input.contraparteId}`);
	}
	await form.getByLabel('Descrição').fill(input.descricao);
	await form.getByLabel('Valor').fill(input.valor);
	await form.getByLabel(getDateLabel(input.tipo)).fill(input.dataLancamento);
};

export const reverseFromRow = async (page: Page, row: ReturnType<typeof findLancamentoRow>, reason: string) => {
	await row.getByRole('link', { name: 'Estornar' }).click();
	await expect(page).toHaveURL(/\/tesouraria\/lancamentos\/\d+\/estorno$/);
	await page.getByLabel('Motivo do estorno').fill(reason);
	await page.getByRole('button', { name: 'Confirmar estorno' }).click();
	await expect(page.getByRole('alert')).toContainText('estornado com sucesso');
};
