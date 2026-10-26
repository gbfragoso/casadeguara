import { db } from '#lib/server/database/connection.js';
import { palestrantes, palestras } from '#lib/server/database/schema.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import type { TalkCreateData } from '#lib/validation/comunicacao/palestras.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';

const model = new PalestraModel(db);
const CREATOR_ID = 'creator-integration';
const TODAY = '2351-03-01';
const MISSING_SPEAKER_ID = -1;

const EMPTY_TALK: TalkCreateData = {
	data: '2351-03-09',
	horario: '08:45',
	titulo: null,
	palestranteId: null,
	novoPalestrante: null,
	observacoes: null,
	local: null,
	reuniaoCom: [],
};

const findSpeaker = async (nome: string) =>
	(await db.select().from(palestrantes).where(eq(palestrantes.nome, nome))).at(0);

const countTalksTitled = async (titulo: string) =>
	(await db.select({ id: palestras.id }).from(palestras).where(eq(palestras.titulo, titulo))).length;

describe('PalestraModel.create', () => {
	it('creates a talk to define in the agenda and records its creator', async () => {
		await withTalkFixtures(async ({ readTalk, trackTalk }) => {
			const outcome = await model.create(EMPTY_TALK, CREATOR_ID);
			if (outcome.status !== 'created') throw new Error(outcome.status);
			trackTalk(outcome.id);

			const [card] = (await model.listAgenda(TODAY)).filter((talk) => talk.id === outcome.id);
			expect(card).toMatchObject({ titulo: null, palestrante: null, versao: 1 });
			expect(await readTalk(outcome.id)).toMatchObject({
				userCadastro: CREATOR_ID,
				dataCadastro: expect.any(Date),
			});
		});
	});

	it('creates a talk with its title, notes and an existing speaker', async () => {
		await withTalkFixtures(async ({ insertSpeaker, readTalk, trackTalk, token }) => {
			const palestranteId = await insertSpeaker(`Ana Amorim ${token}`);
			const input = { ...EMPTY_TALK, titulo: `A prece ${token}`, observacoes: 'Cap. 20', palestranteId };

			const outcome = await model.create(input, CREATOR_ID);
			if (outcome.status !== 'created') throw new Error(outcome.status);
			trackTalk(outcome.id);

			expect(await readTalk(outcome.id)).toMatchObject({
				titulo: `A prece ${token}`,
				observacoes: 'Cap. 20',
				palestranteId,
			});
		});
	});

	it('registers a new speaker together with the talk', async () => {
		await withTalkFixtures(async ({ readTalk, trackTalk, token }) => {
			const nome = `Novo Nome ${token}`;

			const outcome = await model.create({ ...EMPTY_TALK, novoPalestrante: nome }, CREATOR_ID);
			if (outcome.status !== 'created') throw new Error(outcome.status);
			trackTalk(outcome.id);

			const speaker = await findSpeaker(nome);
			expect(speaker).toMatchObject({ userCadastro: CREATOR_ID });
			expect(await readTalk(outcome.id)).toMatchObject({ palestranteId: speaker?.id });
		});
	});

	it('creates neither the talk nor the speaker when the new name already exists', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			await insertSpeaker(`Carmélia Amorim ${token}`);
			const input = { ...EMPTY_TALK, titulo: `Duplicada ${token}`, novoPalestrante: `carmelia AMORIM ${token}` };

			const outcome = await model.create(input, CREATOR_ID);

			expect(outcome).toEqual({ status: 'duplicate-speaker' });
			expect(await countTalksTitled(`Duplicada ${token}`)).toBe(0);
		});
	});

	it('rejects a speaker that does not exist', async () => {
		await withTalkFixtures(async ({ token }) => {
			const input = { ...EMPTY_TALK, titulo: `Sem palestrante ${token}`, palestranteId: MISSING_SPEAKER_ID };

			const outcome = await model.create(input, CREATOR_ID);

			expect(outcome).toEqual({ status: 'missing-speaker' });
			expect(await countTalksTitled(`Sem palestrante ${token}`)).toBe(0);
		});
	});
});
