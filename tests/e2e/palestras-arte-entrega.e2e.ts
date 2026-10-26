import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

import { test, expect } from './fixtures';
import { artDialog, openArt, readPreviewBytes } from './palestras-browser';
import { ART_SIZE_PX, artFileName, openReadyCard } from './palestras-arte-support';

type SharedFile = { name: string; type: string };
type ShareWindow = Window & { __sharedFiles?: SharedFile[] };

test('E2E-05 baixa a arte com o nome datado', async ({ page, e2e }) => {
	const card = await openReadyCard(page, e2e);
	const preview = await openArt(page, card);
	const previewBytes = await readPreviewBytes(preview);

	const [download] = await Promise.all([
		page.waitForEvent('download'),
		artDialog(page).getByRole('link', { name: 'Baixar' }).click(),
	]);

	const file = await readFile(await download.path());
	const { width, height } = await sharp(file).metadata();
	expect(download.suggestedFilename()).toBe(artFileName(e2e));
	expect({ width, height }).toEqual({ width: ART_SIZE_PX, height: ART_SIZE_PX });
	expect([...file]).toEqual(previewBytes);
});

test('E2E-06 copia a arte para a área de transferência', async ({ page, e2e }) => {
	await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
	const card = await openReadyCard(page, e2e);
	await openArt(page, card);

	await artDialog(page).getByRole('button', { name: 'Copiar' }).click();

	await expect(artDialog(page).getByRole('status')).toHaveText('Imagem copiada.');
	const types = await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((item) => item.types));
	expect(types).toContain('image/png');
});

test('E2E-07 compartilha a arte como arquivo PNG onde o dispositivo permite', async ({ page, e2e }) => {
	await page.addInitScript(() => {
		const shareWindow: ShareWindow = window;
		shareWindow.__sharedFiles = [];
		Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
		Object.defineProperty(navigator, 'share', {
			configurable: true,
			value: async ({ files = [] }: ShareData) => {
				shareWindow.__sharedFiles?.push(...files.map(({ name, type }) => ({ name, type })));
			},
		});
	});
	const card = await openReadyCard(page, e2e);
	await openArt(page, card);

	await artDialog(page).getByRole('button', { name: 'Compartilhar' }).click();

	const readSharedFiles = () =>
		page.evaluate(() => {
			const shareWindow: ShareWindow = window;
			return shareWindow.__sharedFiles;
		});
	await expect.poll(readSharedFiles).toEqual([{ name: artFileName(e2e), type: 'image/png' }]);
});

test('E2E-07 esconde o compartilhamento onde o dispositivo não compartilha arquivos', async ({ page, e2e }) => {
	await page.addInitScript(() => {
		Reflect.deleteProperty(Navigator.prototype, 'share');
		Reflect.deleteProperty(Navigator.prototype, 'canShare');
	});
	const card = await openReadyCard(page, e2e);

	await openArt(page, card);

	await expect(artDialog(page).getByRole('link', { name: 'Baixar' })).toBeVisible();
	await expect(artDialog(page).getByRole('button', { name: 'Compartilhar' })).toHaveCount(0);
});
