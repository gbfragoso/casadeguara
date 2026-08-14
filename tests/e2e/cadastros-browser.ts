import { expect, type Page } from '@playwright/test';

import type { CadastroFixture } from './cadastros-fixture';

export const signIn = async (page: Page, email: string, password: string, destination: string) => {
	await page.goto('/');
	const form = page.locator('form');
	await form.getByLabel('Email').fill(email);
	await form.getByLabel('Senha').fill(password);

	await Promise.all([page.waitForURL(destination), form.getByRole('button', { name: 'Entrar' }).click()]);
};

export const createBibliotecaCadastro = async (page: Page, fixture: CadastroFixture) => {
	await page.goto('/biblioteca/leitores/novo');
	const form = page.locator('form.card');
	await form.getByLabel('Nome').fill(fixture.name);
	await form.getByLabel('RG').fill(fixture.rg);
	await form.getByLabel('CPF').fill(fixture.cpf);
	await form.getByLabel('E-mail').fill(fixture.email);
	await form.getByLabel('Celular').fill(fixture.cellphone);
	await form.getByLabel('WhatsApp').fill(fixture.phone);
	await form.getByLabel('Logradouro').fill(fixture.street);
	await form.getByLabel('Bairro').fill(fixture.district);
	await form.getByLabel('Complemento').fill(fixture.complement);
	await form.getByLabel('Cidade').fill(fixture.city);
	await form.getByLabel('CEP').fill(fixture.postalCode);
	await form.getByLabel('Trabalhador').check();
	await form.getByRole('button', { name: 'Cadastrar' }).click();

	await expect(page.getByText('Leitor cadastrado com sucesso!')).toBeVisible();
};

const searchCadastro = async (page: Page, path: string, label: string, name: string) => {
	await page.goto(path);
	const form = page.locator('form.card');
	await form.getByLabel(label).fill(name);
	await expect(form.getByLabel(label)).toHaveValue(name);
	const request = page.waitForRequest(
		(candidate) => candidate.method() === 'POST' && new URL(candidate.url()).pathname === path,
	);

	await form.getByRole('button', { name: 'Pesquisar' }).click();
	const submittedName = new URLSearchParams((await request).postData() ?? '').get('nome');
	expect(submittedName).toBe(name);

	await expect(page.getByText(name, { exact: true })).toBeVisible();
};

export const findCadastroInDashboards = async (page: Page, name: string) => {
	await searchCadastro(page, '/biblioteca/leitores', 'Nome do leitor', name);
	await searchCadastro(page, '/secretaria/cadastros', 'Nome do trabalhador', name);
	await searchCadastro(page, '/tesouraria/contribuintes', 'Nome do contribuinte', name);
};

const assertNoRawIdentifiers = async (page: Page, fixture: CadastroFixture) => {
	const html = await page.content();

	expect(html).not.toContain(fixture.cpf);
	expect(html).not.toContain(fixture.rg);
	expect(page.url()).not.toContain(fixture.cpf);
	expect(page.url()).not.toContain(fixture.rg);
};

export const assertPrivateCadastroViews = async (page: Page, id: number, fixture: CadastroFixture) => {
	const cpfMask = `${fixture.cpf.slice(0, 3)}.***.***-${fixture.cpf.slice(-2)}`;
	const rgMask = `${fixture.rg.slice(0, 2)}.***.***-${fixture.rg.slice(-2)}`;

	await page.goto(`/biblioteca/leitores/${id}`);
	await expect(page.getByText(`CPF cadastrado: ${cpfMask}`)).toBeVisible();
	await expect(page.getByText(`RG cadastrado: ${rgMask}`)).toBeVisible();
	await expect(page.getByLabel('Novo CPF')).toHaveValue('');
	await expect(page.getByLabel('Novo RG')).toHaveValue('');
	await assertNoRawIdentifiers(page, fixture);

	await page.goto(`/secretaria/cadastros/${id}`);
	await assertNoRawIdentifiers(page, fixture);
	await page.goto(`/tesouraria/contribuintes/${id}`);
	await assertNoRawIdentifiers(page, fixture);
};
