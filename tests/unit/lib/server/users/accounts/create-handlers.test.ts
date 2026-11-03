import { afterEach, describe, expect, it, vi } from 'vitest';

import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { createUserCreateHandlers } from '#lib/server/users/accounts/create-handlers.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { createInMemoryUsers } from '../in-memory-users';

const SUPERUSER = 'superuser';
const accountForm = {
	username: 'Nova.Pessoa@Exemplo.dev',
	name: 'Nova Pessoa',
	password: 'senha-segura',
	'access-secretaria': 'volunteer',
	'access-tesouraria': 'coordination',
};

const createDependencies = () => ({
	users: createInMemoryUsers(),
	hashPassword: vi.fn(async (password: string) => `hash:${password}`),
});

const submit = (dependencies = createDependencies(), form = accountForm, roles = SUPERUSER) =>
	runHandler(createUserCreateHandlers(dependencies).actions.default, { roles, form });

describe('user creation handlers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(createUserCreateHandlers(createDependencies()).load);

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('opens the page for a superuser', async () => {
		const { result } = await runHandler(createUserCreateHandlers(createDependencies()).load, { roles: SUPERUSER });

		expect(result).toBeUndefined();
	});

	it('TU-10 forbids a user without the superuser role before reading the form', async () => {
		const dependencies = createDependencies();
		const createSpy = vi.spyOn(dependencies.users, 'create');

		const { event, error } = await expectHttpError(createUserCreateHandlers(dependencies).actions.default, {
			roles: 'comunicacao:admin',
			form: accountForm,
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
		expect(createSpy).not.toHaveBeenCalled();
	});

	it('TU-11 validates before hashing the password or saving', async () => {
		const dependencies = createDependencies();
		const createSpy = vi.spyOn(dependencies.users, 'create');

		const { result } = await submit(dependencies, { ...accountForm, password: '123' });

		expect(result).toMatchObject({ status: 400, data: { errors: { password: [expect.any(String)] } } });
		expect(dependencies.hashPassword).not.toHaveBeenCalled();
		expect(createSpy).not.toHaveBeenCalled();
	});

	it('TU-12 creates the user with the chosen roles and the password hash', async () => {
		const dependencies = createDependencies();
		const createSpy = vi.spyOn(dependencies.users, 'create');

		const { result } = await submit(dependencies);

		expect(result).toEqual({ status: 201 });
		expect(createSpy).toHaveBeenCalledWith({
			id: expect.any(String),
			username: 'nova.pessoa@exemplo.dev',
			name: 'Nova Pessoa',
			passwordHash: 'hash:senha-segura',
			roles: 'secretaria,tesouraria:admin',
		});
	});

	it('TU-13 reports a login already in use with the submitted values and without the password', async () => {
		const dependencies = createDependencies();
		vi.spyOn(dependencies.users, 'create').mockRejectedValue(new DuplicateUsernameError());

		const { result } = await submit(dependencies);

		expect(result).toMatchObject({
			status: 400,
			data: {
				values: { username: 'Nova.Pessoa@Exemplo.dev', name: 'Nova Pessoa' },
				errors: { username: ['Já existe um usuário com este login.'] },
			},
		});
		expect(JSON.stringify(result)).not.toContain('senha-segura');
	});

	it('fails when the user cannot be saved', async () => {
		const dependencies = createDependencies();
		vi.spyOn(dependencies.users, 'create').mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createUserCreateHandlers(dependencies).actions.default, {
			roles: SUPERUSER,
			form: accountForm,
		});

		expect(error.status).toBe(500);
	});
});
