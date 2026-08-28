import { randomUUID } from 'node:crypto';

import { expect, test, type Locator, type Page } from '@playwright/test';
import { signIn } from './cadastros-browser';
import { createTestUsers, deleteTestUsers, readCadastro, type TestUsers } from './cadastros-database';
import {
	createName,
	createPhoto,
	createParticipant,
	deleteParticipants,
	setAmigoFraterno,
	setDisincarnated,
	setWorker,
} from './amigo-fraterno-support';

const token = randomUUID().slice(0, 8);
const names: string[] = [];
let users: TestUsers | undefined;

const photoPath = (id: number, original = false) => `/secretaria/cadastros/${id}/foto${original ? '/original' : ''}`;

const waitForPhotoResponse = (page: Page, id: number, original = false) =>
	page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).pathname === photoPath(id, original) &&
			response.status() === 200,
	);

const expectLoadedPhoto = async (photo: Locator, path: string) => {
	await expect(photo).toBeVisible();
	await expect
		.poll(async () =>
			photo.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
		)
		.toBe(true);
	await expect
		.poll(async () =>
			photo.evaluate((image) => (image instanceof HTMLImageElement ? new URL(image.currentSrc).pathname : '')),
		)
		.toBe(path);
};

test.describe.serial('Amigo Fraterno participation and eligibility', () => {
	test.beforeAll(async () => {
		users = await createTestUsers(token);
	});

	test.afterAll(async () => {
		await deleteParticipants(names);
		if (users) await deleteTestUsers(users);
	});

	test('E2E-01 manages participation and the complete photo lifecycle', async ({ page }) => {
		const name = createName('foto');
		names.push(name);
		const id = await createParticipant(name);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria/cadastros');
		await page.getByLabel('Nome do trabalhador').fill(name);
		const response = page.waitForResponse(
			(candidate) => candidate.url().endsWith('/api/cadastros') && candidate.status() === 200,
		);
		await page.getByRole('button', { name: 'Pesquisar' }).click();
		await page.getByLabel(`Marcar ${name} para o Amigo Fraterno`).check();
		await response;
		await expect.poll(async () => (await readCadastro(name)).amigo_fraterno).toBe(true);
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		const photoResponse = waitForPhotoResponse(page, id);
		await page.getByRole('button', { name: 'Salvar foto' }).click();
		await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();
		await photoResponse;
		await expectLoadedPhoto(page.getByRole('img', { name: `Foto de ${name}` }), photoPath(id));
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		await page.getByRole('button', { name: 'Salvar foto' }).click();
		await page.getByRole('button', { name: 'Remover foto' }).click();
		await expect(page.getByText('Foto removida com sucesso!')).toBeVisible();
		await expect(page.getByText('Pendente', { exact: true })).toBeVisible();
		expect((await readCadastro(name)).foto).toBeNull();
	});

	test('E2E-02 refreshes the eligible list when each condition changes', async ({ page }) => {
		const name = createName('eligibilidade');
		names.push(name);
		const id = await createParticipant(name);
		await setAmigoFraterno(id, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria');
		await page.locator('a[aria-label="amigo fraterno"]').click();
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

	test('E2E-08 selects, moves, zooms, and saves a landscape photo', async ({ page }) => {
		const name = createName('paisagem');
		names.push(name);
		const id = await createParticipant(name);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.waitForLoadState('networkidle');
		await page.getByLabel('Incluir ou substituir foto').setInputFiles({
			name: 'paisagem.jpeg',
			mimeType: 'image/jpeg',
			buffer: await createPhoto({ width: 900, height: 500 }),
		});
		await expect(page.getByTestId('photo-cropper')).toBeVisible();
		await page.getByRole('button', { name: 'Área de enquadramento da foto' }).press('ArrowRight');
		await page.getByLabel('Ampliação da foto').press('ArrowRight');
		await expect(page.getByTestId('photo-cropper').locator('input[name="focalX"]')).toHaveValue('0.52');
		await expect(page.getByTestId('photo-cropper').locator('input[name="zoom"]')).toHaveValue('1.01');
		const photoResponse = waitForPhotoResponse(page, id);
		await page.getByRole('button', { name: 'Confirmar enquadramento' }).click();
		await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();
		await photoResponse;
		await expectLoadedPhoto(page.getByRole('img', { name: `Foto de ${name}` }), photoPath(id));
		const reloadedPhotoResponse = waitForPhotoResponse(page, id);
		await page.reload();
		await reloadedPhotoResponse;
		await expectLoadedPhoto(page.getByRole('img', { name: `Foto de ${name}` }), photoPath(id));
	});

	test('E2E-09 cancels inclusion and reframing without changing the current photo', async ({ page }) => {
		const name = createName('cancelamento');
		names.push(name);
		const id = await createParticipant(name, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		const photoResponse = waitForPhotoResponse(page, id);
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.waitForLoadState('networkidle');
		await photoResponse;
		await expectLoadedPhoto(page.getByRole('img', { name: `Foto de ${name}` }), photoPath(id));
		const before = await (await page.request.get(`/secretaria/cadastros/${id}/foto`)).body();
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		await page.getByRole('button', { name: 'Cancelar' }).click();
		await expect(page.getByTestId('photo-cropper')).toBeHidden();
		await expect(page.getByRole('img', { name: `Foto de ${name}` })).toBeVisible();
		const originalPhotoResponse = waitForPhotoResponse(page, id, true);
		await page.getByRole('button', { name: 'Reenquadrar foto' }).click();
		await originalPhotoResponse;
		await expectLoadedPhoto(page.locator('.photo-cropper img'), photoPath(id, true));
		await page.getByRole('button', { name: 'Cancelar' }).click();
		await expect(page.getByRole('button', { name: 'Reenquadrar foto' })).toBeFocused();
		const after = await (await page.request.get(`/secretaria/cadastros/${id}/foto`)).body();
		expect(Buffer.compare(before, after)).toBe(0);
	});

	test('E2E-10 reframes, replaces, and removes one current photo', async ({ page }) => {
		const name = createName('operacoes');
		names.push(name);
		const id = await createParticipant(name, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.waitForLoadState('networkidle');
		await page.getByRole('button', { name: 'Reenquadrar foto' }).click();
		await page.getByRole('button', { name: 'Confirmar enquadramento' }).click();
		await expect(page.getByText('Foto reenquadrada com sucesso!')).toBeVisible();
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		await page.getByRole('button', { name: 'Salvar foto' }).click();
		await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();
		await page.getByRole('button', { name: 'Remover foto' }).click();
		await expect(page.getByText('Foto removida com sucesso!')).toBeVisible();
		expect((await readCadastro(name)).foto).toBeNull();
	});

	test('E2E-11 keeps crop controls keyboard-operable on a mobile viewport', async ({ page }) => {
		const name = createName('teclado-mobile');
		names.push(name);
		const id = await createParticipant(name);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.waitForLoadState('networkidle');
		await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
		const cropRegion = page.getByRole('button', { name: 'Área de enquadramento da foto' });
		await cropRegion.focus();
		await cropRegion.press('ArrowDown');
		const cropBox = await cropRegion.boundingBox();
		if (!cropBox) throw new Error('A moldura de enquadramento não foi medida.');
		await cropRegion.dispatchEvent('pointerdown', {
			pointerId: 7,
			pointerType: 'touch',
			clientX: cropBox.x + cropBox.width / 2,
			clientY: cropBox.y + cropBox.height / 2,
		});
		await cropRegion.dispatchEvent('pointermove', {
			pointerId: 7,
			pointerType: 'touch',
			clientX: cropBox.x + cropBox.width / 2 + 12,
			clientY: cropBox.y + cropBox.height / 2 + 8,
		});
		await cropRegion.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch' });
		await page.getByLabel('Ampliação da foto').press('ArrowRight');
		await expect(page.getByRole('button', { name: 'Confirmar enquadramento' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
	});

	test('E2E-13 rejects an invalid file while preserving the current photo', async ({ page }) => {
		const name = createName('invalida');
		names.push(name);
		const id = await createParticipant(name, true);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto(`/secretaria/cadastros/${id}`);
		await page.waitForLoadState('networkidle');
		await page.getByLabel('Incluir ou substituir foto').setInputFiles({
			name: 'arquivo.txt',
			mimeType: 'text/plain',
			buffer: Buffer.from('não é uma imagem'),
		});
		await expect(page.getByRole('alert')).toContainText('A foto deve ser JPEG ou PNG');
		await expect(page.getByRole('img', { name: `Foto de ${name}` })).toBeVisible();
	});
});
