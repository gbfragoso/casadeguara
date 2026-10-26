import { db } from '#lib/server/database/connection.js';
import { palestrantes } from '#lib/server/database/schema.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { DuplicatePalestranteNameError } from '#lib/server/models/palestrante-error.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';

const model = new PalestranteModel(db);
const talks = new PalestraModel(db);
const CREATOR_ID = 'creator-integration';
const EDITOR_ID = 'editor-integration';
const USAGE_TALKS = 3;

const readSpeaker = async (id: number) => (await db.select().from(palestrantes).where(eq(palestrantes.id, id))).at(0);

describe('TI-12 PalestranteModel.create', () => {
	it('records the creator and the search name', async () => {
		await withTalkFixtures(async ({ token }) => {
			const { id } = await model.create(`Carmélia Amorim ${token}`, CREATOR_ID);

			expect(await readSpeaker(id)).toMatchObject({
				nomeBusca: `carmelia amorim ${token}`,
				userCadastro: CREATOR_ID,
			});
		});
	});

	it('rejects a name that differs only by accents and case', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			await insertSpeaker(`Carmélia Amorim ${token}`);

			const creation = model.create(`carmelia AMORIM ${token}`, CREATOR_ID);

			await expect(creation).rejects.toBeInstanceOf(DuplicatePalestranteNameError);
		});
	});
});

describe('TI-12 PalestranteModel reads', () => {
	it('searches a name fragment in alphabetical order', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const paulo = await insertSpeaker(`Paulo Amorim ${token}`);
			const ana = await insertSpeaker(`Ana Amorim ${token}`);
			await insertSpeaker(`Bruno Silva ${token}`);

			const speakers = await model.list(`AMORIM ${token}`);

			expect(speakers).toEqual([
				{ id: ana, nome: `Ana Amorim ${token}`, temFoto: false, importado: false },
				{ id: paulo, nome: `Paulo Amorim ${token}`, temFoto: false, importado: false },
			]);
		});
	});

	it('treats LIKE wildcards in the search as plain text', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			await insertSpeaker(`Ana Amorim ${token}`);

			expect(await model.list(`%${token}`)).toEqual([]);
		});
	});

	it('gets a speaker and lists it among the options', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Ana Amorim ${token}`);

			expect(await model.get(id)).toEqual({
				id,
				nome: `Ana Amorim ${token}`,
				temFoto: false,
				importado: false,
				fotoVersao: null,
			});
			expect(await model.listOptions()).toContainEqual({ id, nome: `Ana Amorim ${token}` });
		});
	});

	it('finds no speaker for an unknown identifier', async () => {
		expect(await model.get(-1)).toBeUndefined();
	});
});

describe('TI-12 PalestranteModel.rename', () => {
	it('shows the new name on the board and records the editor', async () => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			const id = await insertSpeaker(`Ana Amorim ${token}`);
			const talkId = await insertTalk({ data: '2401-03-02', horario: '08:45', palestranteId: id });

			const renamed = await model.rename(id, `Ana Souza ${token}`, EDITOR_ID);

			const [card] = (await talks.listAgenda('2401-03-02')).filter((talk) => talk.id === talkId);
			expect(renamed).toBe(true);
			expect(card.palestrante).toEqual({ id, nome: `Ana Souza ${token}`, temFoto: false });
			expect(await readSpeaker(id)).toMatchObject({
				nomeBusca: `ana souza ${token}`,
				userAlteracao: EDITOR_ID,
				dataAlteracao: expect.any(Date),
			});
		});
	});

	it('rejects a name used by another speaker', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			await insertSpeaker(`Ana Amorim ${token}`);
			const id = await insertSpeaker(`Paulo Amorim ${token}`);

			await expect(model.rename(id, `ANA amorim ${token}`, EDITOR_ID)).rejects.toBeInstanceOf(
				DuplicatePalestranteNameError,
			);
		});
	});

	it('reports a speaker that does not exist', async () => {
		expect(await model.rename(-1, 'Ninguém', EDITOR_ID)).toBe(false);
	});
});

describe('TI-12 PalestranteModel.remove', () => {
	it('refuses a speaker used by 3 talks and reports the count', async () => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			const id = await insertSpeaker(`Ana Amorim ${token}`);
			const days = Array.from({ length: USAGE_TALKS }, (_, index) => `2401-04-0${index + 1}`);
			await Promise.all(days.map((data) => insertTalk({ data, horario: '08:45', palestranteId: id })));

			const removal = await model.remove(id);

			expect(removal).toEqual({ status: 'in-use', palestras: USAGE_TALKS });
			expect(await readSpeaker(id)).toBeDefined();
		});
	});

	it('removes a speaker without talks and then reports it missing', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Ana Amorim ${token}`);

			expect(await model.remove(id)).toEqual({ status: 'removed' });
			expect(await model.remove(id)).toEqual({ status: 'missing' });
		});
	});
});
