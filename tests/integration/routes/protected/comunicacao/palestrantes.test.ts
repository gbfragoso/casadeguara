import { isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from '../../../lib/server/models/palestra-test-support';
import {
	deleteCadastrosBy,
	insertCadastro,
	readSpeakerRow,
} from '../../../lib/server/models/palestrante-photo-support';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';
import { load as loadList } from '../../../../../src/routes/(protected)/comunicacao/palestrantes/+page.server';
import {
	actions as editActions,
	load as loadSpeaker,
} from '../../../../../src/routes/(protected)/comunicacao/palestrantes/[id=integer]/+page.server';
import {
	actions as importActions,
	load as loadImport,
} from '../../../../../src/routes/(protected)/comunicacao/palestrantes/importar/+page.server';
import { actions as createActions } from '../../../../../src/routes/(protected)/comunicacao/palestrantes/novo/+page.server';

const volunteer: TestUser = { id: 'integration-palestrantes', username: 'p', name: 'P', roles: 'comunicacao' };

const pageEvent = (path: string, params: Record<string, string> = {}) =>
	createRequestEvent({ locals: { user: volunteer, session: null }, params, url: new URL(`http://localhost${path}`) });

const actionEvent = (entries: Record<string, string>, params: Record<string, string> = {}) => {
	const body = new FormData();
	Object.entries(entries).forEach(([name, value]) => body.set(name, value));
	return createRequestEvent({
		locals: { user: volunteer, session: null },
		params,
		request: new Request('http://localhost/comunicacao/palestrantes', { method: 'POST', body }),
	});
};

const captureRedirect = async (run: () => unknown) => {
	const thrown = await Promise.resolve()
		.then(run)
		.catch((reason: unknown) => reason);
	if (!isRedirect(thrown)) throw new Error('Expected a redirect', { cause: thrown });
	return thrown.location;
};

describe('speaker routes', () => {
	it('lists the speakers matching the search', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Ana Amorim ${token}`);

			const data = await invoke(loadList, pageEvent(`/comunicacao/palestrantes?nome=${token}`));

			expect(data).toEqual({
				busca: token,
				palestrantes: [{ id, nome: `Ana Amorim ${token}`, temFoto: false, importado: false }],
			});
		});
	});

	it('creates a speaker and opens its page, then renames it there', async () => {
		await withTalkFixtures(async ({ token }) => {
			const location = await captureRedirect(() =>
				invoke(createActions.default, actionEvent({ nome: `Rui Amorim ${token}` })),
			);
			const id = location.split('/').at(-1) ?? '';

			const result = await invoke(editActions.salvar, actionEvent({ nome: `Rui A. Amorim ${token}` }, { id }));

			expect(result).toEqual({ status: 200 });
			expect(await invoke(loadSpeaker, pageEvent(location, { id }))).toMatchObject({
				palestrante: { nome: `Rui A. Amorim ${token}` },
				isAdmin: false,
			});
		});
	});

	it('imports a Secretaria registration found by name', async () => {
		await withTalkFixtures(async ({ token }) => {
			try {
				const cadastroId = await insertCadastro({ nome: `Lia Amorim ${token}` });
				const search = await invoke(
					loadImport,
					pageEvent(`/comunicacao/palestrantes/importar?nome=lia amorim ${token}`),
				);

				const location = await captureRedirect(() =>
					invoke(importActions.importar, actionEvent({ cadastroId: `${cadastroId}` })),
				);

				expect(search).toMatchObject({ candidatos: [{ cadastroId, palestranteId: null }] });
				expect(await readSpeakerRow(Number(location.split('/').at(-1)))).toMatchObject({ cadastroId });
			} finally {
				await deleteCadastrosBy(token);
			}
		});
	});
});
