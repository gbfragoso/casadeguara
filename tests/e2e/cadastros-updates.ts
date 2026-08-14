import { expect, type Page } from '@playwright/test';

import type { CadastroFixture } from './cadastros-fixture';

const visit = async (page: Page, path: string) => {
	await page.goto(path);
	await page.waitForLoadState('networkidle');
};

export const updateTesourariaCadastro = async (page: Page, id: number, fixture: CadastroFixture) => {
	await visit(page, `/tesouraria/contribuintes/${id}`);
	const form = page.locator('form.card');
	await form.getByLabel('WhatsApp (com DDD)').fill(fixture.updatedPhone);
	await form.getByRole('button', { name: 'Atualizar' }).click();

	await expect(page.getByText('Contribuinte atualizado com sucesso!')).toBeVisible();
};

export const updateSecretariaCadastro = async (page: Page, id: number, fixture: CadastroFixture) => {
	await visit(page, `/secretaria/cadastros/${id}`);
	const form = page.locator('form.card');
	await form.getByLabel('E-mail').fill(fixture.updatedEmail);
	await form.getByLabel('Aniversário').fill(fixture.birthday);
	await form.getByRole('button', { name: 'Atualizar' }).click();

	await expect(page.getByText('Trabalhador atualizado com sucesso!')).toBeVisible();
};

const updateFlag = async (page: Page, name: string, label: string) => {
	const response = page.waitForResponse(
		(candidate) => candidate.url().endsWith('/api/cadastros') && candidate.status() === 200,
	);

	await page.getByLabel(label.replace('{nome}', name)).check();
	await response;
};

export const updateSecretariaFlags = async (page: Page, name: string) => {
	await page.goto('/secretaria/cadastros');
	const form = page.locator('form.card');
	await form.getByLabel('Nome do trabalhador').fill(name);
	await form.getByRole('button', { name: 'Pesquisar' }).click();
	await updateFlag(page, name, 'Marcar {nome} na frequência');
	await updateFlag(page, name, 'Marcar {nome} como desencarnado');
};

export const updateBibliotecaCadastro = async (page: Page, id: number, fixture: CadastroFixture) => {
	await visit(page, `/biblioteca/leitores/${id}`);
	const form = page.locator('form.card');
	await form.getByLabel('Celular').fill(fixture.updatedCellphone);
	await form.getByLabel('Ativo').uncheck();
	await form.getByRole('button', { name: 'Atualizar' }).click();

	await expect(page.getByText('Leitor atualizado com sucesso!')).toBeVisible();
};

export const submitInvalidBibliotecaUpdate = async (page: Page, id: number) => {
	await visit(page, `/biblioteca/leitores/${id}`);
	const form = page.locator('form.card');
	await form.evaluate((element: HTMLFormElement) => element.setAttribute('novalidate', ''));
	await form.getByLabel('Nome').fill('123');
	await form.getByLabel('Novo RG').fill('12');
	await form.getByLabel('Novo CPF').fill('123');
	await form.getByLabel('E-mail').fill('invalido');
	await form.getByLabel('Celular').fill('1');
	await form.getByLabel('WhatsApp').fill('1');
	await form.getByLabel('CEP').fill('123');
	await form.getByRole('button', { name: 'Atualizar' }).click();

	await Promise.all(
		[
			'Nome do leitor inválido.',
			'RG inválido.',
			'CPF inválido.',
			'E-mail inválido.',
			'Celular inválido.',
			'Telefone inválido.',
			'CEP inválido.',
		].map((message) => expect(page.getByText(message, { exact: true })).toBeVisible()),
	);
};
