import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { describeUserEditHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaUsuariosIdAlphanumericHandlers } =
	await import('#lib/server/biblioteca/usuarios/id-handlers.js');

const admin = { roles: 'biblioteca:admin', params: { id: 'user-9' } };
const form = { username: 'novo@example.com', name: 'Novo Usuário', password: 'senha-segura', roles: 'biblioteca' };
const treasuryAdmin = { id: 'user-9', name: 'Tesoureiro', roles: 'tesouraria:admin' };
const librarianTreasurer = { id: 'user-9', name: 'Bibliotecária', roles: 'biblioteca,tesouraria:admin' };

describe('createBibliotecaUsuariosIdAlphanumericHandlers', () => {
	describeUserEditHandlers({ domain: 'biblioteca', createHandlers: createBibliotecaUsuariosIdAlphanumericHandlers });
});

describe('createBibliotecaUsuariosIdAlphanumericHandlers library scope', () => {
	afterEach(() => {
		fakeDatabase.reset();
	});

	it.each(['biblioteca,tesouraria:admin', 'secretaria:admin'])('refuses to grant the roles %s', async (roles) => {
		const { actions } = createBibliotecaUsuariosIdAlphanumericHandlers();

		const { result } = await runHandler(actions.default, { ...admin, form: { ...form, roles } });

		expect(result).toMatchObject({ status: 400, field: 'roles' });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('hides a user from another area', async () => {
		fakeDatabase.resolveWith([treasuryAdmin]);

		const { error } = await expectHttpError(createBibliotecaUsuariosIdAlphanumericHandlers().load, admin);

		expect(error.status).toBe(404);
	});

	it('refuses to update a user from another area', async () => {
		fakeDatabase.resolveWith([treasuryAdmin]);

		const { error } = await expectHttpError(createBibliotecaUsuariosIdAlphanumericHandlers().actions.default, {
			...admin,
			form,
		});

		expect(error.status).toBe(404);
		expect(fakeDatabase.queries().map((query) => query.operation)).toEqual(['select']);
	});

	it('lets a library user from another area be edited when that area is not administered', async () => {
		fakeDatabase.resolveWith([{ ...librarianTreasurer, roles: 'biblioteca,tesouraria' }]);

		const { result } = await runHandler(createBibliotecaUsuariosIdAlphanumericHandlers().actions.default, {
			...admin,
			form: { ...form, roles: 'biblioteca:admin' },
		});

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.argumentsOf('set')).toEqual([
			expect.objectContaining({ roles: 'biblioteca:admin,tesouraria' }),
		]);
	});
});

describe('createBibliotecaUsuariosIdAlphanumericHandlers administrators of other areas', () => {
	const treasuryAndLibraryAdmin = { ...admin, roles: 'biblioteca:admin,tesouraria:admin' };

	afterEach(() => {
		fakeDatabase.reset();
	});

	it('hides a treasury administrator from a library administrator who does not administer the treasury', async () => {
		fakeDatabase.resolveWith([librarianTreasurer]);

		const { error } = await expectHttpError(createBibliotecaUsuariosIdAlphanumericHandlers().load, admin);

		expect(error.status).toBe(401);
	});

	it('refuses to update a treasury administrator for a library administrator who does not administer the treasury', async () => {
		fakeDatabase.resolveWith([librarianTreasurer]);

		const { error } = await expectHttpError(createBibliotecaUsuariosIdAlphanumericHandlers().actions.default, {
			...admin,
			form,
		});

		expect(error.status).toBe(401);
		expect(fakeDatabase.queries().map((query) => query.operation)).toEqual(['select']);
	});

	it('shows only the library role to an editor who also administers the treasury', async () => {
		fakeDatabase.resolveWith([librarianTreasurer]);

		const { result } = await runHandler(
			createBibliotecaUsuariosIdAlphanumericHandlers().load,
			treasuryAndLibraryAdmin,
		);

		expect(result).toEqual({ usuario: { ...librarianTreasurer, roles: 'biblioteca' } });
	});

	it('changes the library role while keeping the treasury administration', async () => {
		fakeDatabase.resolveWith([librarianTreasurer]);

		const { result } = await runHandler(createBibliotecaUsuariosIdAlphanumericHandlers().actions.default, {
			...treasuryAndLibraryAdmin,
			form: { ...form, roles: 'biblioteca:admin' },
		});

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.argumentsOf('set')).toEqual([
			expect.objectContaining({ roles: 'biblioteca:admin,tesouraria:admin' }),
		]);
	});
});
