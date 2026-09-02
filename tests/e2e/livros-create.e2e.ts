import type { Locator, Page } from '@playwright/test';

import { test, expect, waitForHydration } from './fixtures';
import { readBookAggregateByTitle, type LivroCatalog } from './livros-database';

const createTombo = (catalog: LivroCatalog, offset: number) =>
	`${Number(catalog.livros.unrelated.tombo) + offset}`.padStart(8, '0');

const openCreateForm = async (page: Page) => {
	await page.goto('/biblioteca/livros/novo');
	await waitForHydration(page);
	return page.locator('form.card');
};

const openAuthorsStep = async (form: Locator, catalog: LivroCatalog, title: string, tombo: string) => {
	await form.getByLabel('Tombo').fill(tombo);
	await form.getByLabel('Título').fill(title);
	await form.getByLabel('Editora').selectOption(`${catalog.editora[0].id}`);
	await form.getByRole('button', { name: 'Próximo: autores' }).click();
};

const openReviewStep = async (form: Locator, authorId: number) => {
	await form.getByLabel('Autores cadastrados').selectOption(`${authorId}`);
	await form.getByRole('button', { name: 'Próximo: revisão' }).click();
};

const waitForCreateResponse = (page: Page) =>
	page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' && new URL(response.url()).pathname === '/biblioteca/livros/novo',
	);

test('E2E-02 corrige e confirma um cadastro em etapas', async ({ page, e2e }) => {
	const catalog = await e2e.createBookCatalog();
	const createdTitle = `Livro Criado ${catalog.token.toUpperCase()}`;
	const tombo = createTombo(catalog, 11);
	await e2e.authenticate(page, 'wrongRole');
	const form = await openCreateForm(page);
	await openAuthorsStep(form, catalog, '123', tombo);
	await openReviewStep(form, catalog.autor[0].id);

	const invalidResponsePromise = waitForCreateResponse(page);
	await form.getByRole('button', { name: 'Cadastrar livro' }).click();
	expect((await invalidResponsePromise).ok()).toBe(true);
	await form.getByRole('button', { name: 'Voltar aos autores' }).click();
	await form.getByRole('button', { name: 'Voltar', exact: true }).click();
	await expect(form.getByLabel('Tombo')).toHaveValue(tombo);
	await expect(form.getByLabel('Título')).toHaveValue('123');
	await expect(page.getByText(/ao menos uma letra/)).toBeVisible();

	await form.getByLabel('Título').fill(createdTitle);
	await form.getByRole('button', { name: 'Próximo: autores' }).click();
	await form.getByRole('button', { name: 'Próximo: revisão' }).click();
	const createdResponsePromise = waitForCreateResponse(page);
	await form.getByRole('button', { name: 'Cadastrar livro' }).click();
	expect((await createdResponsePromise).ok()).toBe(true);
	await expect(page.getByText('Livro cadastrado com sucesso.')).toBeVisible();
	await expect.poll(() => e2e.countBooksByTitle(createdTitle)).toBe(1);
});

test('E2E-04 cadastra autores e exemplar inicial no mesmo fluxo', async ({ page, e2e }) => {
	const catalog = await e2e.createBookCatalog();
	const suffix = catalog.token.toUpperCase();
	const title = `Livro Completo ${suffix}`;
	const newAuthor = `Novo Autor ${suffix}`;
	const tombo = createTombo(catalog, 12);
	await e2e.authenticate(page, 'wrongRole');
	const form = await openCreateForm(page);
	await openAuthorsStep(form, catalog, title, tombo);
	await form.getByLabel('Autores cadastrados').selectOption(`${catalog.autor[0].id}`);
	await form.getByLabel('Novo autor (opcional)').fill(newAuthor);
	await form.getByRole('button', { name: 'Próximo: revisão' }).click();
	await expect(form.locator('p').filter({ hasText: 'Exemplar inicial:' })).toContainText('nº 1 — Disponível');

	const responsePromise = waitForCreateResponse(page);
	await form.getByRole('button', { name: 'Cadastrar livro' }).click();
	expect((await responsePromise).ok()).toBe(true);
	await expect(page.getByText('Livro cadastrado com sucesso.')).toBeVisible();
	await expect
		.poll(() => readBookAggregateByTitle(e2e.database, title))
		.toMatchObject({
			tombo,
			titulo: title,
			authors: expect.arrayContaining([catalog.autor[0].nome, newAuthor.toUpperCase()]),
			copies: [{ numero: 1, status: 'Disponível' }],
		});
});
