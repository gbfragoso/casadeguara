import { expect, type Page } from '@playwright/test';

import { submitLancamentosSearch } from '../../lancamentos-browser';
import type { BaselineSeed } from '../seed/state';
import type { RepresentativeScreen } from '../types';

const CURRENT_MONTH_EXIT = 'Conta de energia';
const TYPED_AMOUNT_DIGITS = '123456';

const showDashboardChart = async (page: Page) => {
	await expect(page.locator('canvas')).toBeVisible();
};

const searchCurrentMonth = async (page: Page, seed: BaselineSeed) => {
	await page.getByLabel('Data inicial').fill(seed.calendar.monthStart);
	await page.getByLabel('Data final').fill(seed.calendar.monthEnd);
	expect((await submitLancamentosSearch(page)).ok()).toBe(true);
	await expect(page.getByRole('cell', { name: CURRENT_MONTH_EXIT, exact: true })).toBeVisible();
};

const typeAmount = async (page: Page) => {
	const amount = page.getByLabel('Valor');
	await amount.pressSequentially(TYPED_AMOUNT_DIGITS);
	await expect(amount).not.toHaveValue('');
};

export const TESOURARIA_SCREENS: readonly RepresentativeScreen[] = [
	{
		id: 'tesouraria-painel',
		role: 'admin',
		shell: true,
		path: () => '/tesouraria',
		states: [{ id: 'inicial', prepare: showDashboardChart }],
	},
	{
		id: 'lancamentos',
		role: 'admin',
		shell: true,
		print: true,
		path: () => '/tesouraria/lancamentos',
		states: [{ id: 'resultados', prepare: searchCurrentMonth }],
	},
	{
		id: 'lancamento-novo',
		role: 'admin',
		shell: true,
		path: () => '/tesouraria/lancamentos/novo',
		states: [{ id: 'valor', prepare: typeAmount }],
	},
];
