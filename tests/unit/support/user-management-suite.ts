import { afterEach, expect, it, vi } from 'vitest';

import { fakeDatabase } from './fake-database';
import { expectHttpError, expectRedirect, runHandler } from './handler-event';

type Handler = (...args: never[]) => unknown;
type UserHandlers = { load: Handler; actions: Record<string, Handler> };
type SuiteOptions = { domain: string; createHandlers: () => UserHandlers };

const validForm = { username: 'novo@example.com', name: 'Novo Usuário', password: 'senha-segura', roles: 'biblioteca' };
const failingDatabase = () => {
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	fakeDatabase.failWith(new Error('database offline'));
};

const describeAccessRules = ({ domain, createHandlers }: SuiteOptions) => {
	const params = { id: 'user-9' };

	it.each(['load', 'action'] as const)('redirects an anonymous %s request', async (target) => {
		const { load, actions } = createHandlers();

		const { redirect } = await expectRedirect(target === 'load' ? load : actions.default, {
			form: validForm,
			params,
		});

		expect(redirect).toMatchObject({ status: 302, location: '/' });
	});

	it('rejects a non-administrator before reading the form', async () => {
		const { actions } = createHandlers();

		const { event, error } = await expectHttpError(actions.default, { roles: domain, form: validForm, params });

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('hides the page from a non-administrator', async () => {
		const { load } = createHandlers();

		const { error } = await expectHttpError(load, { roles: domain, params });

		expect(error.status).toBe(401);
	});
};

const describeCredentialValidation = ({ domain, createHandlers }: SuiteOptions) => {
	const admin = { roles: `${domain},${domain}:admin`, params: { id: 'user-9' } };

	it('rejects an invalid e-mail', async () => {
		const { result } = await runHandler(createHandlers().actions.default, {
			...admin,
			form: { ...validForm, username: 'x' },
		});

		expect(result).toMatchObject({ status: 400, field: 'username' });
	});

	it('rejects a password shorter than the minimum length', async () => {
		const { result } = await runHandler(createHandlers().actions.default, {
			...admin,
			form: { ...validForm, password: '1' },
		});

		expect(result).toMatchObject({ status: 400, field: 'password' });
	});

	it('fails when the user cannot be saved', async () => {
		failingDatabase();

		const { error } = await expectHttpError(createHandlers().actions.default, { ...admin, form: validForm });

		expect(error.status).toBe(500);
	});
};

export const describeUserCreationHandlers = (options: SuiteOptions) => {
	afterEach(() => {
		fakeDatabase.reset();
		vi.restoreAllMocks();
	});

	describeAccessRules(options);
	describeCredentialValidation(options);

	it('lets an administrator open the page', async () => {
		const { result } = await runHandler(options.createHandlers().load, { roles: `${options.domain}:admin` });

		expect(result).toBeUndefined();
	});

	it('creates the user with a hashed password', async () => {
		const admin = { roles: `${options.domain}:admin`, form: validForm };

		const { result } = await runHandler(options.createHandlers().actions.default, admin);

		expect(result).toEqual({ status: 201 });
		expect(fakeDatabase.argumentsOf('values')).toEqual([
			expect.objectContaining({
				username: 'novo@example.com',
				passwordHash: expect.not.stringContaining('senha'),
			}),
		]);
	});
};

export const describeUserEditHandlers = (options: SuiteOptions) => {
	const admin = { roles: `${options.domain}:admin`, params: { id: 'user-9' } };
	const editedUser = { id: 'user-9', name: 'Novo Usuário', roles: options.domain };

	afterEach(() => {
		fakeDatabase.reset();
		vi.restoreAllMocks();
	});

	describeAccessRules(options);
	describeCredentialValidation(options);

	it('returns the edited user to an administrator', async () => {
		fakeDatabase.resolveWith([editedUser]);

		const { result } = await runHandler(options.createHandlers().load, admin);

		expect(result).toEqual({ usuario: editedUser });
	});

	it('never selects the password hash', async () => {
		fakeDatabase.resolveWith([editedUser]);

		await runHandler(options.createHandlers().load, admin);

		expect(Object.keys(fakeDatabase.argumentsOf('select')?.[0] as object)).toEqual([
			'id',
			'username',
			'name',
			'roles',
		]);
	});

	it('responds 404 when the user does not exist', async () => {
		fakeDatabase.resolveWith([]);

		const { error } = await expectHttpError(options.createHandlers().load, admin);

		expect(error.status).toBe(404);
	});

	it('fails when the user cannot be read', async () => {
		failingDatabase();

		const { error } = await expectHttpError(options.createHandlers().load, admin);

		expect(error.status).toBe(500);
	});

	it.each([
		['the submitted roles', 'biblioteca', 'biblioteca'],
		['the current roles when none are submitted', '', undefined],
	])('updates the user keeping %s', async (_scenario, roles, storedRoles) => {
		fakeDatabase.resolveWith([editedUser]);

		const { result } = await runHandler(options.createHandlers().actions.default, {
			...admin,
			form: { ...validForm, roles },
		});

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.argumentsOf('set')).toEqual([expect.objectContaining({ roles: storedRoles })]);
	});
};
