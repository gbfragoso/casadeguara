import { afterEach, describe, expect, it, vi } from 'vitest';

import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { createUserEditHandlers } from '#lib/server/users/accounts/edit-handlers.js';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { createInMemoryUsers } from '../in-memory-users';

const EDITOR_ID = 'editor';
const SUPERUSER = 'superuser';
const params = { id: 'rui' };
const accountForm = {
	username: 'rui@exemplo.dev',
	name: 'Rui Souza',
	password: '',
	'access-biblioteca': 'coordination',
};

const createDependencies = (roles = 'biblioteca,legado') => ({
	users: createInMemoryUsers([
		{ id: 'rui', username: 'rui@exemplo.dev', name: 'Rui', roles, passwordHash: 'hash-antigo' },
		{
			id: EDITOR_ID,
			username: 'editor@exemplo.dev',
			name: 'Editor',
			roles: SUPERUSER,
			passwordHash: 'hash-editor',
		},
	]),
	hashPassword: vi.fn(async (password: string) => `hash:${password}`),
});

type Dependencies = ReturnType<typeof createDependencies>;

const submit = (dependencies: Dependencies, form: Record<string, string> = accountForm, target = params) =>
	runHandler(createUserEditHandlers(dependencies).actions.default, {
		roles: SUPERUSER,
		userId: EDITOR_ID,
		form,
		params: target,
	});

describe('user edit handlers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('TU-14 answers 404 for an unknown user', async () => {
		const { load } = createUserEditHandlers(createDependencies());

		const { error } = await expectHttpError(load, { roles: SUPERUSER, params: { id: 'ninguem' } });

		expect(error.status).toBe(404);
	});

	it('TU-14 fills the form with the current access levels without the roles', async () => {
		const { load } = createUserEditHandlers(createDependencies('biblioteca,secretaria:admin,superuser'));

		const { result } = await runHandler(load, { roles: SUPERUSER, params });

		expect(result).toEqual({
			usuario: {
				id: 'rui',
				username: 'rui@exemplo.dev',
				name: 'Rui',
				access: {
					modules: {
						biblioteca: 'volunteer',
						secretaria: 'coordination',
						tesouraria: 'none',
						comunicacao: 'none',
					},
					superuser: true,
				},
			},
		});
	});

	it('forbids a user without the superuser role before reading the form', async () => {
		const dependencies = createDependencies();

		const { event, error } = await expectHttpError(createUserEditHandlers(dependencies).actions.default, {
			roles: 'biblioteca:admin',
			form: accountForm,
			params,
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('rejects an invalid login before looking up the user', async () => {
		const dependencies = createDependencies();
		const getSpy = vi.spyOn(dependencies.users, 'get');

		const { result } = await submit(dependencies, { ...accountForm, username: 'rui' });

		expect(result).toMatchObject({ status: 400, data: { errors: { username: [expect.any(String)] } } });
		expect(getSpy).not.toHaveBeenCalled();
	});

	it('TU-15 keeps the password when it is left blank', async () => {
		const dependencies = createDependencies();
		const updateSpy = vi.spyOn(dependencies.users, 'update');

		const { result } = await submit(dependencies);

		expect(result).toEqual({ status: 200 });
		expect(dependencies.hashPassword).not.toHaveBeenCalled();
		expect(updateSpy).toHaveBeenCalledWith('rui', {
			username: 'rui@exemplo.dev',
			name: 'Rui Souza',
			roles: 'biblioteca:admin,legado',
		});
	});

	it('TU-16 saves the hash of a new password', async () => {
		const dependencies = createDependencies();

		await submit(dependencies, { ...accountForm, password: 'nova-senha' });

		expect(dependencies.users.find('rui')?.passwordHash).toBe('hash:nova-senha');
	});

	it('TU-17 refuses to remove the editor own superuser role without saving', async () => {
		const dependencies = createDependencies();
		const updateSpy = vi.spyOn(dependencies.users, 'update');

		const { result } = await submit(dependencies, accountForm, { id: EDITOR_ID });

		expect(result).toMatchObject({
			status: 400,
			data: { errors: { superuser: ['Você não pode retirar a sua própria role de superusuário.'] } },
		});
		expect(updateSpy).not.toHaveBeenCalled();
	});

	it('TU-18 grants the superuser role to another user', async () => {
		const dependencies = createDependencies();

		await submit(dependencies, { ...accountForm, superuser: 'on' });

		expect(dependencies.users.find('rui')?.roles).toBe('biblioteca:admin,superuser,legado');
	});

	it('reports a login already in use with the submitted values', async () => {
		const dependencies = createDependencies();
		vi.spyOn(dependencies.users, 'update').mockRejectedValue(new DuplicateUsernameError());

		const { result } = await submit(dependencies, { ...accountForm, password: 'nova-senha' });

		expect(result).toMatchObject({
			status: 400,
			data: { errors: { username: ['Já existe um usuário com este login.'] } },
		});
		expect(JSON.stringify(result)).not.toContain('nova-senha');
	});

	it('fails when the user cannot be read', async () => {
		const dependencies = createDependencies();
		vi.spyOn(dependencies.users, 'get').mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createUserEditHandlers(dependencies).load, {
			roles: SUPERUSER,
			params,
		});

		expect(error.status).toBe(500);
	});
});
