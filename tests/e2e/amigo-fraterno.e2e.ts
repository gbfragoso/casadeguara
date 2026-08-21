import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { signIn } from './cadastros-browser';
import { closeDatabase, createTestUsers, deleteTestUsers, readCadastro, type TestUsers } from './cadastros-database';
import {
	createName,
	createParticipant,
	deleteParticipants,
	setAmigoFraterno,
	setDisincarnated,
	setWorker,
} from './amigo-fraterno-support';

const token = randomUUID().slice(0, 8);
const names: string[] = [];
let users: TestUsers | undefined;

test.describe.serial('Amigo Fraterno participation and eligibility', () => {
	test.beforeAll(async () => {
		users = await createTestUsers(token);
	});

	test.afterAll(async () => {
		await deleteParticipants(names);
		if (users) await deleteTestUsers(users);
		await closeDatabase();
	});

	test('E2E-01 manages participation and the complete photo lifecycle', async ({ page }) => {
		const name = createName('foto');
		names.push(name);
		const id = await createParticipant(name);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria/cadastros');
		await page.getByLabel('Nome do trabalhador').fill(name);
		await page.getByRole('button', { name: 'Pesquisar' }).click();
		const response = page.waitForResponse(
			(candidate) => candidate.url().endsWith('/api/cadastros') && candidate.status() === 200,
		);
		await page.getByLabel(`Marcar ${name} para o Amigo Fraterno`).check();
		await response;
		await expect.poll(async () => (await readCadastro(name)).amigo_fraterno).toBe(true);
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		await page.getByRole('button', { name: 'Salvar foto' }).click();
		await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();
		await expect(page.getByRole('img', { name: `Foto de ${name}` })).toBeVisible();
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		await page.getByRole('button', { name: 'Salvar foto' }).click();
		await page.getByRole('button', { name: 'Remover foto' }).click();
		await expect(page.getByText('Foto removida com sucesso!')).toBeVisible();
		expect((await readCadastro(name)).foto).toBeNull();
	});

	test('E2E-02 refreshes the eligible list when each condition changes', async ({ page }) => {
		const name = createName('eligibilidade');
		names.push(name);
		const id = await createParticipant(name);
		await setAmigoFraterno(id, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.getByRole('link', { name: 'Amigo Fraterno' }).click();
		await expect(page).toHaveURL(/\/secretaria\/amigofraterno$/);
		await expect(page.getByText(name, { exact: true })).toBeVisible();
		await setWorker(id, false);
		await page.reload();
		await expect(page.getByText(name, { exact: true })).toBeHidden();
		await setWorker(id, true);
		await setDisincarnated(id, true);
		await page.reload();
		await expect(page.getByText(name, { exact: true })).toBeHidden();
		await setDisincarnated(id, false);
		await page.reload();
		await expect(page.getByText(name, { exact: true })).toBeVisible();
	});
});
