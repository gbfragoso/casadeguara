import { expect, type Page } from '@playwright/test';

import { SEARCH_TITLE_PREFIX } from '../seed/library';
import { RECEIPT_UUID, REVERSED_RECEIPT_UUID } from '../seed/treasury';
import type { RepresentativeScreen } from '../types';

const SEARCHED_BOOK = 'Caminhos da Luz';

const searchCollection = async (page: Page) => {
	await page.getByLabel('Título').fill(SEARCH_TITLE_PREFIX);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	await expect(page.getByRole('row', { name: new RegExp(`^${SEARCHED_BOOK} `) })).toBeVisible();
};

export const PUBLIC_SCREENS: readonly RepresentativeScreen[] = [
	{
		id: 'acervo',
		role: 'public',
		path: () => '/acervo',
		states: [{ id: 'resultados', prepare: searchCollection }],
	},
	{
		id: 'recibo',
		role: 'public',
		print: true,
		path: () => `/recibo/${RECEIPT_UUID}`,
		states: [{ id: 'inicial', prepare: (page) => expect(page.getByRole('img', { name: 'qrcode' })).toBeVisible() }],
	},
	{
		id: 'recibo-estornado',
		role: 'public',
		print: true,
		path: () => `/recibo/${REVERSED_RECEIPT_UUID}`,
		states: [
			{
				id: 'inicial',
				prepare: (page) => expect(page.getByRole('heading', { name: 'Recibo estornado' })).toBeVisible(),
			},
		],
	},
];
