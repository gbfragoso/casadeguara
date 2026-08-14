import { expect, type Page } from '@playwright/test';

import {
	assertPrivateCadastroViews,
	createBibliotecaCadastro,
	findCadastroInDashboards,
	signIn,
} from './cadastros-browser';
import { readCadastro, type CadastroSnapshot, type TestUser } from './cadastros-database';
import type { CadastroFixture } from './cadastros-fixture';
import {
	submitInvalidBibliotecaUpdate,
	updateBibliotecaCadastro,
	updateSecretariaCadastro,
	updateSecretariaFlags,
	updateTesourariaCadastro,
} from './cadastros-updates';

type OwnerJourney = { id: number; beforeInvalidUpdate: CadastroSnapshot };

const assertTesourariaUpdate = async (page: Page, id: number, fixture: CadastroFixture) => {
	await updateTesourariaCadastro(page, id, fixture);
	expect(await readCadastro(fixture.name)).toMatchObject({
		cpf: fixture.cpf,
		rg: fixture.rg,
		telefone: fixture.updatedPhone,
		logradouro: fixture.street,
		status: true,
	});
};

const assertSecretariaUpdate = async (page: Page, id: number, fixture: CadastroFixture) => {
	await updateSecretariaCadastro(page, id, fixture);
	await updateSecretariaFlags(page, fixture.name);
	expect(await readCadastro(fixture.name)).toMatchObject({
		aniversario: new Date(`${fixture.birthday}T00:00:00.000Z`),
		email: fixture.updatedEmail,
		frequencia: true,
		desencarnado: true,
		status: true,
		telefone: fixture.updatedPhone,
	});
};

const assertBibliotecaUpdate = async (page: Page, id: number, fixture: CadastroFixture) => {
	await updateBibliotecaCadastro(page, id, fixture);
	expect(await readCadastro(fixture.name)).toMatchObject({
		celular: fixture.updatedCellphone,
		status: false,
		aniversario: new Date(`${fixture.birthday}T00:00:00.000Z`),
		frequencia: true,
		desencarnado: true,
	});
};

export const runOwnerJourney = async (page: Page, fixture: CadastroFixture): Promise<OwnerJourney> => {
	await createBibliotecaCadastro(page, fixture);
	const created = await readCadastro(fixture.name);

	await findCadastroInDashboards(page, fixture.name);
	await assertPrivateCadastroViews(page, created.idleitor, fixture);
	await assertTesourariaUpdate(page, created.idleitor, fixture);
	await assertSecretariaUpdate(page, created.idleitor, fixture);
	await assertBibliotecaUpdate(page, created.idleitor, fixture);

	const beforeInvalidUpdate = await readCadastro(fixture.name);
	await submitInvalidBibliotecaUpdate(page, created.idleitor);
	expect(await readCadastro(fixture.name)).toEqual(beforeInvalidUpdate);

	return { id: created.idleitor, beforeInvalidUpdate };
};

export const assertUnauthorizedUpdate = async (
	page: Page,
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
	expect(await readCadastro(name)).toEqual(beforeUpdate);
};

export const assertMissingCadastro = async (page: Page, id: number) => {
	const response = await page.goto(`/biblioteca/leitores/${id}`);
	expect(response?.status()).toBe(404);
	await expect(page.getByText('Leitor não encontrado.')).toBeVisible();
};
