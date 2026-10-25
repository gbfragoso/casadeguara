import { describe, expect, it } from 'vitest';

import { createComunicacaoUserListHandlers } from '#lib/server/comunicacao/usuarios/list-handlers.js';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { createInMemoryUsers } from './in-memory-users';

const listUrl = 'http://localhost/comunicacao/usuarios';
const COORDINATOR = 'comunicacao:admin';

describe('comunicacao user list handlers', () => {
	it('lists the Comunicação users matching the searched name and page', async () => {
		const users = createInMemoryUsers([
			{ id: 'ana', username: 'ana@exemplo.dev', name: 'Ana', roles: 'comunicacao' },
		]);

		const { result } = await runHandler(createComunicacaoUserListHandlers({ users }).load, {
			roles: COORDINATOR,
			url: `${listUrl}?nome=An&page=2`,
		});

		await expect((result as { usuarios: Promise<unknown> }).usuarios).resolves.toEqual([
			{ id: 'ana', name: 'Ana' },
		]);
		expect(users.listings).toEqual([
			{ areaRoles: ['comunicacao', 'comunicacao:admin'], filter: { name: 'An', page: 2 } },
		]);
	});

	it('starts at the first page without a name filter', async () => {
		const users = createInMemoryUsers();

		await runHandler(createComunicacaoUserListHandlers({ users }).load, { roles: COORDINATOR, url: listUrl });

		expect(users.listings.map(({ filter }) => filter)).toEqual([{ name: undefined, page: 1 }]);
	});

	it('forbids a volunteer', async () => {
		const handlers = createComunicacaoUserListHandlers({ users: createInMemoryUsers() });

		const { error } = await expectHttpError(handlers.load, { roles: 'comunicacao', url: listUrl });

		expect(error.status).toBe(403);
	});
});
