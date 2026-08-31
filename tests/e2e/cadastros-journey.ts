import { expect, type Page } from '@playwright/test';

import { signIn } from './cadastros-browser';
import { readCadastro, type CadastroSnapshot, type TestDatabase, type TestUser } from './cadastros-database';

export const assertUnauthorizedUpdate = async (
	page: Page,
	database: TestDatabase,
	user: TestUser,
	id: number,
	beforeUpdate: CadastroSnapshot,
	name: string,
) => {
	await signIn(page, user.email, user.password, '**/biblioteca');
	const response = await page.request.post('/api/cadastros', {
		data: { id, field: 'frequencia', value: false },
	});
	expect(response.status()).toBe(401);
	expect(await readCadastro(database, name)).toEqual(beforeUpdate);
};

export const assertMissingCadastro = async (page: Page, id: number) => {
	const response = await page.goto(`/biblioteca/leitores/${id}`);
	expect(response?.status()).toBe(404);
	await expect(page.getByText('Leitor não encontrado.')).toBeVisible();
};
