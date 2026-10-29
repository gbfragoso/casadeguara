import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComunicacaoUserCreateHandlers } from '#lib/server/comunicacao/usuarios/create-handlers.js';
import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { createInMemoryUsers } from './in-memory-users';

const COORDINATOR = 'comunicacao:admin';
const volunteerForm = {
	username: 'novo@exemplo.dev',
	password: 'senha-segura',
	name: 'Novo Voluntário',
	roles: 'comunicacao',
};

const createHandlers = (users = createInMemoryUsers()) => createComunicacaoUserCreateHandlers({ users });

const submitAsCoordinator = (users = createInMemoryUsers(), form = volunteerForm) =>
	runHandler(createHandlers(users).actions.default, { roles: COORDINATOR, form });

describe('comunicacao user creation handlers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('TU-23 creates a volunteer with a hashed password', async () => {
		const users = createInMemoryUsers();
		const createSpy = vi.spyOn(users, 'create');

		const { result } = await submitAsCoordinator(users);

		expect(result).toEqual({ status: 201 });
		expect(createSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				username: 'novo@exemplo.dev',
				roles: 'comunicacao',
				passwordHash: expect.not.stringContaining('senha'),
			}),
		);
	});

	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(createHandlers().load);

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('forbids a volunteer before reading the form', async () => {
		const { event, error } = await expectHttpError(createHandlers().actions.default, {
			roles: 'comunicacao',
			form: volunteerForm,
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('opens the page for the coordination', async () => {
		const { result } = await runHandler(createHandlers().load, { roles: COORDINATOR });

		expect(result).toBeUndefined();
	});

	it('rejects a role from another area', async () => {
		const { result } = await submitAsCoordinator(undefined, { ...volunteerForm, roles: 'tesouraria:admin' });

		expect(result).toMatchObject({ status: 400, field: 'roles' });
	});

	it('reports a login already in use', async () => {
		const users = createInMemoryUsers();
		vi.spyOn(users, 'create').mockRejectedValue(new DuplicateUsernameError());

		const { result } = await submitAsCoordinator(users);

		expect(result).toEqual({ status: 400, field: 'username', message: 'Já existe um usuário com este login.' });
	});

	it('fails when the user cannot be saved', async () => {
		const users = createInMemoryUsers();
		vi.spyOn(users, 'create').mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createHandlers(users).actions.default, {
			roles: COORDINATOR,
			form: volunteerForm,
		});

		expect(error.status).toBe(500);
	});
});
