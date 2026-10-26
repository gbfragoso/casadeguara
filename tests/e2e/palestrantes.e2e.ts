import sharp from 'sharp';

import { test, expect, waitForHydration } from './fixtures';
import { expectLoadedPhoto } from './amigo-fraterno-photo-support';
import { openBoard, talkCard, waitForTalkAction } from './palestras-browser';

const INVALID_PHOTO_MESSAGE = 'A foto deve ser JPEG ou PNG, ter até 3 MiB e pelo menos 300 × 300 pixels.';
const NOISE_WIDTH = 1_100;
const NOISE_HEIGHT = 700;
const RGB_CHANNELS = 3;
const TWO_MIB = 2 * 1024 * 1024;
const THREE_MIB = 3 * 1024 * 1024;
const LCG_MULTIPLIER = 1_103_515_245;
const LCG_INCREMENT = 12_345;
const BYTE_RANGE = 256;

const createNoisyPng = () => {
	let seed = 7;
	const pixels = Buffer.alloc(NOISE_WIDTH * NOISE_HEIGHT * RGB_CHANNELS);
	pixels.forEach((_, index) => {
		seed = (seed * LCG_MULTIPLIER + LCG_INCREMENT) >>> 0;
		pixels[index] = seed % BYTE_RANGE;
	});
	const raw = { width: NOISE_WIDTH, height: NOISE_HEIGHT, channels: RGB_CHANNELS } as const;
	return sharp(pixels, { raw }).png({ compressionLevel: 0 }).toBuffer();
};

const speakerPagePath = (id: number) => `/comunicacao/palestrantes/${id}`;

test('E2E-07 sugere o palestrante sem acento e cadastra um nome novo pelo card', async ({ page, e2e }) => {
	const title = `${e2e.token} palestra`;
	await e2e.createSpeaker({ nome: `Carmélia Amorim ${e2e.token}` });
	await e2e.createTalks([{ titulo: title, data: e2e.talkDate(0), horario: '08:45' }]);
	const newName = `Novo Nome ${e2e.token}`;
	await e2e.authenticate(page, 'comunicacao');

	const card = talkCard(page, title);
	await card.getByRole('button', { name: 'Editar palestrante: a definir' }).click();
	const combobox = card.getByRole('combobox');
	await combobox.fill('carmelia');
	await expect(card.getByRole('option', { name: `Carmélia Amorim ${e2e.token}` })).toBeVisible();

	await combobox.fill(newName);
	const saved = waitForTalkAction(page, 'atualizar');
	await card.getByRole('option', { name: `Cadastrar «${newName}»` }).click();
	expect((await saved).ok()).toBe(true);

	await openBoard(page);
	await expect(talkCard(page, title).getByRole('button', { name: `Editar palestrante: ${newName}` })).toBeVisible();
	await page.goto(`/comunicacao/palestrantes?nome=${encodeURIComponent(newName)}`);
	await expect(page.getByRole('list', { name: 'Palestrantes' }).getByRole('link', { name: newName })).toBeVisible();
});

test('E2E-08 mostra a foto enquadrada como miniatura circular e recusa um GIF', async ({ page, e2e }) => {
	const title = `${e2e.token} com foto`;
	const name = `Foto Amorim ${e2e.token}`;
	const speakerId = await e2e.createSpeaker({ nome: name });
	const [talk] = await e2e.createTalks([{ titulo: title, data: e2e.talkDate(0), horario: '08:45' }]);
	await e2e.assignSpeaker(talk.id, speakerId);
	const png = await createNoisyPng();
	expect(png.byteLength).toBeGreaterThan(TWO_MIB);
	expect(png.byteLength).toBeLessThan(THREE_MIB);
	await e2e.authenticate(page, 'comunicacao');

	await page.goto(speakerPagePath(speakerId));
	await waitForHydration(page);
	await page
		.getByLabel('Incluir ou substituir foto')
		.setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: png });
	await page.getByRole('button', { name: 'Área de enquadramento da foto' }).press('ArrowRight');
	await page.getByRole('button', { name: 'Confirmar enquadramento' }).click();
	await expect(page.getByText('Foto salva com sucesso!')).toBeVisible();

	await page.getByLabel('Incluir ou substituir foto').setInputFiles({
		name: 'foto.gif',
		mimeType: 'image/gif',
		buffer: Buffer.from('GIF89a'),
	});
	await expect(page.getByRole('alert')).toHaveText(INVALID_PHOTO_MESSAGE);
	await expect(page.getByText('Cadastrada', { exact: true })).toBeVisible();

	await openBoard(page);
	const avatar = talkCard(page, title).getByRole('img', { name: `Foto de ${name}` });
	await expectLoadedPhoto(avatar, `${speakerPagePath(speakerId)}/foto/miniatura`);
	const shape = await avatar.evaluate((image) => ({
		radius: Number.parseFloat(getComputedStyle(image).borderTopLeftRadius),
		width: image.getBoundingClientRect().width,
		height: image.getBoundingClientRect().height,
	}));
	expect(shape.width).toBe(shape.height);
	expect(shape.radius).toBeGreaterThanOrEqual(shape.width / 2);
});

test('E2E-09 importa do cadastro em até 3 ações e marca quem já foi importado', async ({ page, e2e }) => {
	const participant = await e2e.createParticipant('palestrante', true);
	await e2e.authenticate(page, 'comunicacao');
	await page.goto('/comunicacao/palestrantes/importar');
	await waitForHydration(page);

	await page.getByLabel('Nome no cadastro da Secretaria').fill(participant.name);
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	await page.getByRole('button', { name: `Importar ${participant.name}` }).click();

	await expect(page.getByRole('heading', { level: 1, name: participant.name })).toBeVisible();
	await expect(page.getByText('Cadastrada', { exact: true })).toBeVisible();
	await page.goto(`/comunicacao/palestrantes/importar?nome=${encodeURIComponent(participant.name)}`);
	const result = page.getByRole('list', { name: 'Cadastros encontrados' }).getByRole('listitem');
	await expect(result).toContainText('Já importado');
	await expect(result.getByRole('button')).toHaveCount(0);
});
