import { expect, type Page } from '@playwright/test';

import type { RepresentativeScreen } from '../types';

const NOT_FOUND_STATUS = 404;
const MODULES = ['biblioteca', 'secretaria', 'tesouraria'];

const submitInvalidLogin = async (page: Page) => {
	await page.getByLabel('Email').fill('nao.cadastrado@exemplo.dev');
	await page.getByLabel('Senha').fill('credencial-invalida');
	await page.getByRole('button', { name: 'Entrar' }).click();
	await expect(page.getByText('Email ou senha inválidos')).toBeVisible();
};

const showModules = async (page: Page) => {
	for (const module of MODULES) await expect(page.getByRole('link', { name: module, exact: true })).toBeVisible();
};

export const ACCESS_SCREENS: readonly RepresentativeScreen[] = [
	{
		id: 'login',
		role: 'public',
		path: () => '/',
		states: [{ id: 'inicial' }, { id: 'validacao', prepare: submitInvalidLogin }],
	},
	{
		id: 'sistemas',
		role: 'admin',
		path: () => '/sistemas',
		states: [{ id: 'inicial', prepare: showModules }],
	},
	{
		id: 'erro-404',
		role: 'public',
		status: NOT_FOUND_STATUS,
		path: () => '/rota-inexistente',
		states: [{ id: 'inicial' }],
	},
];
