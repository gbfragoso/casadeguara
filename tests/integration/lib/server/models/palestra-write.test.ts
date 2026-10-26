import { db } from '#lib/server/database/connection.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';

const model = new PalestraModel(db);
const CREATOR_ID = 'creator-integration';
const EDITOR_ID = 'editor-integration';
const RULES = { today: '2351-03-01', allowPast: false };

describe('PalestraModel.create', () => {
	it('creates a talk to define in the agenda and records its creator', async () => {
		await withTalkFixtures(async ({ readTalk, trackTalk }) => {
			const { id } = await model.create(
				{ data: '2351-03-09', horario: '08:45', local: null, reuniaoCom: [] },
				CREATOR_ID,
			);
			trackTalk(id);

			const [card] = (await model.listAgenda(RULES.today)).filter((talk) => talk.id === id);
			expect(card).toMatchObject({
				data: '2351-03-09',
				horario: '08:45',
				titulo: null,
				palestrante: null,
				versao: 1,
			});
			expect(await readTalk(id)).toMatchObject({ userCadastro: CREATOR_ID, dataCadastro: expect.any(Date) });
		});
	});
});

describe('PalestraModel.update of a single field', () => {
	it.each([
		['titulo', 'A prece', { titulo: 'A prece' }],
		['observacoes', 'Livro: Jesus e Atualidade,\nCap. 20', { observacoes: 'Livro: Jesus e Atualidade,\nCap. 20' }],
		['local', 'Rua Major Dórea, 86', { local: 'Rua Major Dórea, 86' }],
		['horario', '14:30', { horario: '14:30:00' }],
	] as const)('saves %s and keeps the other fields', async (campo, valor, expected) => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const id = await insertTalk({ data: '2351-03-09', horario: '08:45', titulo: 'Antes', local: 'Antes' });
			const before = await readTalk(id);

			const outcome = await model.update({ id, versao: 1 }, { campo, valor }, RULES, EDITOR_ID);

			expect(outcome).toEqual({ status: 'updated', versao: 2 });
			expect(await readTalk(id)).toEqual({
				...before,
				...expected,
				versao: 2,
				userAlteracao: EDITOR_ID,
				dataAlteracao: expect.any(Date),
			});
		});
	});

	it('associates an existing speaker and clears it again', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, readTalk, token }) => {
			const speakerId = await insertSpeaker(`Ana Amorim ${token}`);
			const id = await insertTalk({ data: '2351-03-09', horario: '08:45' });

			await model.update({ id, versao: 1 }, { campo: 'palestranteId', valor: speakerId }, RULES, EDITOR_ID);
			await model.update({ id, versao: 2 }, { campo: 'palestranteId', valor: null }, RULES, EDITOR_ID);

			expect(await readTalk(id)).toMatchObject({ palestranteId: null, versao: 3 });
		});
	});
});
