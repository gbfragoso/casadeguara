import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComunicacaoUserEditHandlers } from '#lib/server/comunicacao/usuarios/edit-handlers.js';
import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { createInMemoryUsers, type InMemoryUsers } from './in-memory-users';

const COORDINATOR = 'comunicacao:admin';
const params = { id: 'rui' };
const form = { username: 'rui@exemplo.dev', password: 'senha-segura', name: 'Rui Souza', roles: 'comunicacao:admin' };

const storeTarget = (roles: string) =>
	createInMemoryUsers([{ id: 'rui', username: 'rui@exemplo.dev', name: 'Rui', roles }]);

const editAs = (roles: string, users: InMemoryUsers, submitted = form) =>
	runHandler(createComunicacaoUserEditHandlers({ users }).actions.default, { roles, form: submitted, params });

const failEditAs = (roles: string, users: InMemoryUsers) =>
	expectHttpError(createComunicacaoUserEditHandlers({ users }).actions.default, { roles, form, params });

describe('comunicacao user edit handlers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('TU-23 promotes a volunteer to coordination keeping the other areas', async () => {
		const users = storeTarget('tesouraria,comunicacao');

		const { result } = await editAs(COORDINATOR, users);

		expect(result).toEqual({ status: 200 });
		expect(users.find('rui')).toMatchObject({ name: 'Rui Souza', roles: 'comunicacao:admin,tesouraria' });
	});

	it('TU-23 hides a user outside Comunicação', async () => {
		const { error } = await failEditAs(COORDINATOR, storeTarget('secretaria'));

		expect(error.status).toBe(404);
	});

	it('TU-23 forbids editing a coordinator of another area', async () => {
		const { error } = await failEditAs(COORDINATOR, storeTarget('comunicacao,biblioteca:admin'));

		expect(error.status).toBe(403);
	});

	it('forbids a volunteer before reading the form', async () => {
		const { event, error } = await failEditAs('comunicacao', storeTarget('comunicacao'));

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('keeps the current roles when none are submitted', async () => {
		const users = storeTarget('comunicacao,secretaria');

		await editAs(COORDINATOR, users, { ...form, roles: '' });

		expect(users.find('rui')?.roles).toBe('comunicacao,secretaria');
	});

	it('rejects an invalid e-mail before looking up the user', async () => {
		const users = storeTarget('comunicacao');
		const getSpy = vi.spyOn(users, 'get');

		const { result } = await editAs(COORDINATOR, users, { ...form, username: 'rui' });

		expect(result).toMatchObject({ status: 400, field: 'username' });
		expect(getSpy).not.toHaveBeenCalled();
	});

	it('reports a login already in use', async () => {
		const users = storeTarget('comunicacao');
		vi.spyOn(users, 'update').mockRejectedValue(new DuplicateUsernameError());

		const { result } = await editAs(COORDINATOR, users);

		expect(result).toMatchObject({ status: 400, field: 'username' });
	});

	it('returns only the Comunicação roles of the edited user', async () => {
		const users = storeTarget('tesouraria,comunicacao');

		const { result } = await runHandler(createComunicacaoUserEditHandlers({ users }).load, {
			roles: COORDINATOR,
			params,
		});

		expect(result).toEqual({
			usuario: { id: 'rui', username: 'rui@exemplo.dev', name: 'Rui', roles: 'comunicacao' },
		});
	});

	it('fails when the user cannot be read', async () => {
		const users = storeTarget('comunicacao');
		vi.spyOn(users, 'get').mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createComunicacaoUserEditHandlers({ users }).load, {
			roles: COORDINATOR,
			params,
		});

		expect(error.status).toBe(500);
	});
});
