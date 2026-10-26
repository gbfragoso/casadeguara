import { db } from '#lib/server/database/connection.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';
import {
	createJpeg,
	deleteCadastrosBy,
	insertCadastro,
	readCadastroState,
	readImageSize,
	readSpeakerPhotos,
	readSpeakerRow,
	requireSpeakerPhotos,
} from './palestrante-photo-support';

const model = new PalestranteModel(db);
const ACTOR_ID = 'import-integration';

type Fixtures = Parameters<Parameters<typeof withTalkFixtures>[0]>[0];

const withImportFixtures = (callback: (fixtures: Fixtures) => Promise<void>) =>
	withTalkFixtures(async (fixtures) => {
		try {
			await callback(fixtures);
		} finally {
			await deleteCadastrosBy(fixtures.token);
		}
	});

describe('TI-13 PalestranteModel.importFromCadastro', () => {
	it('creates a speaker with the name and a centered square photo', async () => {
		await withImportFixtures(async ({ token }) => {
			const cadastroId = await insertCadastro({ nome: `Carmélia Amorim ${token}`, photo: await createJpeg() });

			const outcome = await model.importFromCadastro(cadastroId, ACTOR_ID);

			if (outcome.status !== 'created') throw new Error(`Unexpected outcome ${outcome.status}`);
			const photos = await requireSpeakerPhotos(outcome.palestranteId);
			expect(await readSpeakerRow(outcome.palestranteId)).toMatchObject({
				nome: `Carmélia Amorim ${token}`,
				cadastroId,
				userCadastro: ACTOR_ID,
			});
			expect(await readImageSize(photos.quadrada)).toEqual({ width: 800, height: 800 });
			expect(await readImageSize(photos.miniatura)).toEqual({ width: 128, height: 128 });
		});
	});

	it('leaves the Secretaria registration and its photo unchanged', async () => {
		await withImportFixtures(async ({ token }) => {
			const cadastroId = await insertCadastro({ nome: `Paulo Amorim ${token}`, photo: await createJpeg() });
			const before = await readCadastroState(cadastroId);

			await model.importFromCadastro(cadastroId, ACTOR_ID);

			expect(await readCadastroState(cadastroId)).toEqual(before);
		});
	});

	it('creates a speaker without photo from a registration without photo', async () => {
		await withImportFixtures(async ({ token }) => {
			const cadastroId = await insertCadastro({ nome: `Rui Sem Foto ${token}` });

			const outcome = await model.importFromCadastro(cadastroId, ACTOR_ID);

			if (outcome.status !== 'created') throw new Error(`Unexpected outcome ${outcome.status}`);
			expect(await model.get(outcome.palestranteId)).toMatchObject({ temFoto: false, importado: true });
		});
	});

	it('refuses a second import of the same registration', async () => {
		await withImportFixtures(async ({ token }) => {
			const cadastroId = await insertCadastro({ nome: `Ana Amorim ${token}` });
			await model.importFromCadastro(cadastroId, ACTOR_ID);

			expect(await model.importFromCadastro(cadastroId, ACTOR_ID)).toEqual({ status: 'already-imported' });
		});
	});

	it('links a homonym speaker without origin, keeping its name and adding the photo', async () => {
		await withImportFixtures(async ({ insertSpeaker, token }) => {
			const speakerId = await insertSpeaker(`carmelia amorim ${token}`);
			const cadastroId = await insertCadastro({ nome: `Carmélia Amorim ${token}`, photo: await createJpeg() });

			const outcome = await model.importFromCadastro(cadastroId, ACTOR_ID);

			expect(outcome).toEqual({ status: 'linked', palestranteId: speakerId });
			expect(await readSpeakerRow(speakerId)).toMatchObject({
				nome: `carmelia amorim ${token}`,
				cadastroId,
				userAlteracao: ACTOR_ID,
			});
			expect(await readSpeakerPhotos(speakerId)).toBeDefined();
		});
	});

	it('keeps the photo of a linked homonym that already has one', async () => {
		await withImportFixtures(async ({ insertSpeaker, token }) => {
			const speakerId = await insertSpeaker(`Bia Amorim ${token}`);
			const ownPhoto = await createJpeg({ r: 10, g: 200, b: 10 });
			await model.replacePhoto(
				speakerId,
				{ original: ownPhoto, quadrada: ownPhoto, miniatura: ownPhoto },
				ACTOR_ID,
			);
			const cadastroId = await insertCadastro({ nome: `Bia Amorim ${token}`, photo: await createJpeg() });

			await model.importFromCadastro(cadastroId, ACTOR_ID);

			expect(new Uint8Array((await requireSpeakerPhotos(speakerId)).original)).toEqual(ownPhoto);
		});
	});

	it('refuses a homonym already imported from another registration', async () => {
		await withImportFixtures(async ({ token }) => {
			const first = await insertCadastro({ nome: `Lia Amorim ${token}` });
			const second = await insertCadastro({ nome: `LIA AMORIM ${token}` });
			await model.importFromCadastro(first, ACTOR_ID);

			expect(await model.importFromCadastro(second, ACTOR_ID)).toEqual({ status: 'duplicate-name' });
		});
	});

	it('treats a disincarnated or unknown registration as missing', async () => {
		await withImportFixtures(async ({ token }) => {
			const cadastroId = await insertCadastro({ nome: `Eva Amorim ${token}`, desencarnado: true });

			expect(await model.importFromCadastro(cadastroId, ACTOR_ID)).toEqual({ status: 'missing' });
			expect(await model.importFromCadastro(-1, ACTOR_ID)).toEqual({ status: 'missing' });
		});
	});
});

describe('TI-13 PalestranteModel.searchImportCandidates', () => {
	it('hides disincarnated people and marks who was already imported', async () => {
		await withImportFixtures(async ({ token }) => {
			const imported = await insertCadastro({ nome: `Carmélia Amorim ${token}`, photo: await createJpeg() });
			const pending = await insertCadastro({ nome: `Paulo Amorim ${token}` });
			await insertCadastro({ nome: `Eva Amorim ${token}`, desencarnado: true });
			const outcome = await model.importFromCadastro(imported, ACTOR_ID);

			const candidates = await model.searchImportCandidates(`amorim ${token}`);

			expect(candidates).toEqual([
				{
					cadastroId: imported,
					nome: `Carmélia Amorim ${token}`,
					temFoto: true,
					palestranteId: outcome.status === 'created' ? outcome.palestranteId : null,
				},
				{ cadastroId: pending, nome: `Paulo Amorim ${token}`, temFoto: false, palestranteId: null },
			]);
		});
	});

	it('matches without accents and treats LIKE wildcards as text', async () => {
		await withImportFixtures(async ({ token }) => {
			await insertCadastro({ nome: `Carmélia Amorim ${token}` });

			expect(await model.searchImportCandidates(`carmelia amorim ${token}`)).toHaveLength(1);
			expect(await model.searchImportCandidates(`%${token}`)).toEqual([]);
		});
	});
});
