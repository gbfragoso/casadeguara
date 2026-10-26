import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { withTalkFixtures } from '../../../lib/server/models/palestra-test-support';
import { createJpeg } from '../../../lib/server/models/palestrante-photo-support';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';
import { actions } from '../../../../../src/routes/(protected)/comunicacao/palestras/+page.server';
import { GET } from '../../../../../src/routes/(protected)/comunicacao/palestras/[id=integer]/arte/+server';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { db } from '#lib/server/database/connection.js';

const FUTURE_DATE = '2099-03-09';
const ART_SIZE = 1080;
const LEGACY_NOTES_LENGTH = 120;
const BOARD_URL = 'http://localhost/comunicacao/palestras';
const speakers = new PalestranteModel(db);

const createUser = (roles: string): TestUser => ({ id: 'integration-arte', username: 'arte', name: 'Arte', roles });

const artEvent = (id: number, versao: number, user: TestUser | null) =>
	createRequestEvent({
		locals: { user, session: null },
		params: { id: `${id}` },
		url: new URL(`${BOARD_URL}/${id}/arte?versao=${versao}`),
	});

const updateTitle = (id: number, titulo: string) => {
	const form = new FormData();
	Object.entries({ id: `${id}`, versao: '1', campo: 'titulo', valor: titulo }).forEach(([key, value]) =>
		form.set(key, value),
	);
	const request = new Request(BOARD_URL, { method: 'POST', body: form });
	return invoke(
		actions.atualizar,
		createRequestEvent({ locals: { user: createUser('comunicacao'), session: null }, request }),
	);
};

type TalkFixtures = Parameters<Parameters<typeof withTalkFixtures>[0]>[0];

const insertReadyTalk = async ({ insertSpeaker, insertTalk, token }: TalkFixtures, observacoes?: string) => {
	const palestranteId = await insertSpeaker(`Arte Soledade ${token}`);
	const photo = await createJpeg();
	await speakers.replacePhoto(
		palestranteId,
		{ original: photo, quadrada: photo, miniatura: photo },
		'integration-arte',
	);
	return insertTalk({ data: FUTURE_DATE, horario: '08:45', titulo: 'A prece', observacoes, palestranteId });
};

describe('talk art route', () => {
	it('TI-06 serves the art PNG to a non-admin Comunicação user', async () => {
		await withTalkFixtures(async (fixtures) => {
			const id = await insertReadyTalk(fixtures);

			const response = await invoke(GET, artEvent(id, 1, createUser('comunicacao')));

			expect(response.status).toBe(200);
			const metadata = await sharp(new Uint8Array(await response.arrayBuffer())).metadata();
			expect(metadata).toMatchObject({ format: 'png', width: ART_SIZE, height: ART_SIZE });
		});
	});

	it.each([
		[null, 401],
		[createUser('secretaria'), 403],
	])('TI-07 denies the art to the user %o', async (user, status) => {
		await withTalkFixtures(async (fixtures) => {
			const id = await insertReadyTalk(fixtures);

			const response = await invoke(GET, artEvent(id, 1, user));

			expect(response.status).toBe(status);
		});
	});

	it('TI-08 generates the art with the newly saved title without changing the talk', async () => {
		await withTalkFixtures(async (fixtures) => {
			const id = await insertReadyTalk(fixtures);
			await updateTitle(id, 'O Evangelho no lar');
			const saved = await fixtures.readTalk(id);

			const response = await invoke(GET, artEvent(id, 2, createUser('comunicacao')));

			expect(response.status).toBe(200);
			expect(saved).toMatchObject({ titulo: 'O Evangelho no lar', versao: 2 });
			expect(await fixtures.readTalk(id)).toEqual(saved);
		});
	});

	it('TI-09 refuses the art of a legacy talk above the limits', async () => {
		await withTalkFixtures(async (fixtures) => {
			const id = await insertReadyTalk(fixtures, 'o'.repeat(LEGACY_NOTES_LENGTH));

			const response = await invoke(GET, artEvent(id, 1, createUser('comunicacao')));

			expect(response.status).toBe(422);
			expect(await response.json()).toEqual({
				message: 'As observações estão maiores do que cabe na arte. Encurte-as no card para gerar a arte.',
			});
		});
	});
});
