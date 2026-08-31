import { test, expect, waitForHydration } from './fixtures';

import { createPhoto } from './amigo-fraterno-support';
import { photoPath, submitPhotoAction, waitForPhoto } from './amigo-fraterno-photo-support';

test('E2E-06 cancels reframing without changing the current photo', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('cancelamento', true);
	await e2e.authenticate(page);
	const loaded = waitForPhoto(page, participant.id);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	expect((await loaded).ok()).toBe(true);
	const before = await (await page.request.get(photoPath(participant.id))).body();
	await page.getByLabel('Incluir ou substituir foto').setInputFiles('tests/fixtures/amigo-fraterno-photo.jpeg');
	await page.getByRole('button', { name: 'Cancelar' }).click();
	await expect(page.getByTestId('photo-cropper')).toBeHidden();
	const original = waitForPhoto(page, participant.id, true);
	await page.getByRole('button', { name: 'Reenquadrar foto' }).click();
	expect((await original).ok()).toBe(true);
	await page.getByRole('button', { name: 'Cancelar' }).click();
	await expect(page.getByRole('button', { name: 'Reenquadrar foto' })).toBeFocused();
	const after = await (await page.request.get(photoPath(participant.id))).body();
	expect(Buffer.compare(before, after)).toBe(0);
});

test('E2E-08 reframes the current photo without replacing its source', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('reenquadramento', true);
	await e2e.authenticate(page);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	const before = await (await page.request.get(photoPath(participant.id, true))).body();
	const original = waitForPhoto(page, participant.id, true);
	await page.getByRole('button', { name: 'Reenquadrar foto' }).click();
	expect((await original).ok()).toBe(true);
	await submitPhotoAction(page, participant.id, () =>
		page.getByRole('button', { name: 'Confirmar enquadramento' }).click(),
	);
	await expect(page.getByText('Foto reenquadrada com sucesso!')).toBeVisible();
	const after = await (await page.request.get(photoPath(participant.id, true))).body();
	expect(Buffer.compare(before, after)).toBe(0);
});

test('E2E-10 removes the current photo and persists the placeholder state', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('remocao', true);
	await e2e.authenticate(page);
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	await submitPhotoAction(page, participant.id, () => page.getByRole('button', { name: 'Remover foto' }).click());
	await expect(page.getByText('Foto removida com sucesso!')).toBeVisible();
	await expect(page.getByText('Pendente', { exact: true })).toBeVisible();
	expect((await e2e.readCadastro(participant.name)).foto).toBeNull();
});

test('E2E-11 operates crop controls with the keyboard on mobile', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('teclado-mobile');
	await e2e.authenticate(page);
	await page.setViewportSize({ width: 375, height: 667 });
	await page.goto(`/secretaria/cadastros/${participant.id}`);
	await waitForHydration(page);
	await page.getByLabel('Incluir ou substituir foto').setInputFiles({
		name: 'mobile.jpeg',
		mimeType: 'image/jpeg',
		buffer: await createPhoto({ width: 900, height: 500 }),
	});
	const cropRegion = page.getByRole('button', { name: 'Área de enquadramento da foto' });
	await cropRegion.focus();
	await cropRegion.press('ArrowDown');
	await page.getByLabel('Ampliação da foto').press('ArrowRight');
	await expect(page.getByRole('button', { name: 'Confirmar enquadramento' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
});
