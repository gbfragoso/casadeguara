import { test, expect, waitForHydration } from './fixtures';

import { createPhoto } from './amigo-fraterno-support';
import { expectLoadedPhoto, photoPath, submitPhotoAction, waitForPhoto } from './amigo-fraterno-photo-support';

test('E2E-05 selects, moves, zooms, and saves a landscape photo', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('paisagem');
	await e2e.authenticate(page);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
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
	await submitPhotoAction(page, participant.id, () =>
		page.getByRole('button', { name: 'Confirmar enquadramento' }).click(),
	);
	await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();
	const response = waitForPhoto(page, participant.id);
	await page.reload();
	expect((await response).ok()).toBe(true);
	await expectLoadedPhoto(page.getByRole('img', { name: `Foto de ${participant.name}` }), photoPath(participant.id));
});

test('E2E-07 cancels an initial upload and restores focus', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('cancelamento-sem-foto');
	await e2e.authenticate(page);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	const fileInput = page.getByLabel('Incluir ou substituir foto');
	await fileInput.setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
	await expect(page.getByTestId('photo-cropper')).toBeVisible();
	await page.getByRole('button', { name: 'Cancelar' }).click();
	await expect(page.getByTestId('photo-cropper')).toBeHidden();
	await expect(fileInput).toBeFocused();
	await expect(page.getByText('Pendente', { exact: true })).toBeVisible();
});

test('E2E-09 replaces the current photo', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('substituicao', true);
	await e2e.authenticate(page);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	const before = await (await page.request.get(photoPath(participant.id, true))).body();
	await page.getByLabel('Incluir ou substituir foto').setInputFiles({
		name: 'nova-foto.jpeg',
		mimeType: 'image/jpeg',
		buffer: await createPhoto({ width: 640, height: 640 }),
	});
	await submitPhotoAction(page, participant.id, () => page.getByRole('button', { name: 'Salvar foto' }).click());
	await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();
	const after = await (await page.request.get(photoPath(participant.id, true))).body();
	expect(Buffer.compare(before, after)).not.toBe(0);
});

test('E2E-12 rejects an invalid file while preserving the current photo', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('invalida', true);
	await e2e.authenticate(page);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	const before = (await e2e.readCadastro(participant.name)).foto;
	await page.getByLabel('Incluir ou substituir foto').setInputFiles({
		name: 'arquivo.txt',
		mimeType: 'text/plain',
		buffer: Buffer.from('não é uma imagem'),
	});
	await expect(page.getByRole('alert')).toContainText('A foto deve ser JPEG ou PNG');
	await expect(page.getByRole('img', { name: `Foto de ${participant.name}` })).toBeVisible();
	expect((await e2e.readCadastro(participant.name)).foto).toEqual(before);
});
