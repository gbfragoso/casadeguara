import { afterEach, describe, expect, it, vi } from 'vitest';

import { createUserListHandlers } from '#lib/server/users/accounts/list-handlers.js';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { createInMemoryUsers } from '../in-memory-users';

const storeUsers = () =>
	createInMemoryUsers([
		{ id: 'alvaro', username: 'alvaro@exemplo.dev', name: 'Álvaro Lima', roles: 'biblioteca:admin,superuser' },
		{ id: 'bruna', username: 'bruna@exemplo.dev', name: 'Bruna Reis', roles: '' },
	]);

describe('user list handlers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('TU-09 forbids a user without the superuser role before querying the model', async () => {
		const users = storeUsers();
		const listSpy = vi.spyOn(users, 'listAll');

		const { error } = await expectHttpError(createUserListHandlers({ users }).load, { roles: 'comunicacao:admin' });

		expect(error.status).toBe(403);
		expect(listSpy).not.toHaveBeenCalled();
	});

	it('TU-09 lists every user with an access summary', async () => {
		const { result } = await runHandler(createUserListHandlers({ users: storeUsers() }).load, {
			roles: 'superuser',
		});

		expect(result).toEqual({
			usuarios: [
				{
					id: 'alvaro',
					name: 'Álvaro Lima',
					username: 'alvaro@exemplo.dev',
					accessSummary: 'Biblioteca: Coordenação, Superusuário',
				},
				{ id: 'bruna', name: 'Bruna Reis', username: 'bruna@exemplo.dev', accessSummary: 'Sem acesso' },
			],
		});
	});

	it('fails when the users cannot be read', async () => {
		const users = storeUsers();
		vi.spyOn(users, 'listAll').mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createUserListHandlers({ users }).load, { roles: 'superuser' });

		expect(error.status).toBe(500);
	});
});
