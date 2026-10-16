import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../support/fake-database';
import { expectHttpError, expectRedirect, runHandler } from '../../../support/handler-event';

vi.mock('#lib/server/database/connection.js', () => import('../../../support/fake-database'));

const { createUsuarioDetailHandlers } = await import('#lib/server/usuario/detail-handlers.js');

const { load, actions } = createUsuarioDetailHandlers();
const owner = { roles: 'biblioteca', userId: 'user-1', params: { id: 'user-1' } };
const validForm = { name: 'Maria', password: 'senha-segura' };

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createUsuarioDetailHandlers load', () => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(load, { params: { id: 'user-1' } });

		expect(redirect).toMatchObject({ status: 302, location: '/' });
	});

	it("redirects a user viewing another user's account", async () => {
		const { redirect } = await expectRedirect(load, { ...owner, params: { id: 'user-2' } });

		expect(redirect).toMatchObject({ status: 302, location: '/' });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('returns the account of its owner', async () => {
		fakeDatabase.resolveWith([{ id: 'user-1', name: 'Maria' }]);

		const { result } = await runHandler(load, owner);

		expect(result).toEqual({ usuario: { id: 'user-1', name: 'Maria' } });
	});

	it('never selects the password hash', async () => {
		fakeDatabase.resolveWith([{ id: 'user-1' }]);

		await runHandler(load, owner);

		expect(Object.keys(fakeDatabase.argumentsOf('select')?.[0] as object)).toEqual(['id', 'username', 'name']);
	});

	it('responds 404 when the account does not exist', async () => {
		fakeDatabase.resolveWith([]);

		const { error } = await expectHttpError(load, owner);

		expect(error.status).toBe(404);
	});

	it('fails when the account cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fakeDatabase.failWith(new Error('database offline'));

		const { error } = await expectHttpError(load, owner);

		expect(error.status).toBe(500);
	});
});

describe('createUsuarioDetailHandlers default action', () => {
	it('redirects an anonymous request before reading the form', async () => {
		const { event } = await expectRedirect(actions.default, { form: validForm, params: { id: 'user-1' } });

		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it("refuses to change another user's password", async () => {
		const { event } = await expectRedirect(actions.default, {
			...owner,
			form: validForm,
			params: { id: 'user-2' },
		});

		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('rejects a password shorter than the minimum length', async () => {
		const { result } = await runHandler(actions.default, { ...owner, form: { name: 'Maria', password: '123' } });

		expect(result).toMatchObject({ status: 400, field: 'password' });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('stores the new name and a hashed password for the owner', async () => {
		const { result } = await runHandler(actions.default, { ...owner, form: validForm });

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.argumentsOf('set')).toEqual([
			{ name: 'Maria', passwordHash: expect.not.stringContaining('senha-segura') },
		]);
	});

	it('fails when the account cannot be updated', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fakeDatabase.failWith(new Error('database offline'));

		const { error } = await expectHttpError(actions.default, { ...owner, form: validForm });

		expect(error.status).toBe(500);
	});
});
