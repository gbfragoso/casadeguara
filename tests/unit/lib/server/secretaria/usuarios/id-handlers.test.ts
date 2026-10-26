import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { describeUserEditHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaUsuariosIdAlphanumericHandlers } =
	await import('#lib/server/secretaria/usuarios/id-handlers.js');

const admin = { roles: 'secretaria:admin', params: { id: 'user-9' } };
const form = { username: 'novo@example.com', name: 'Novo Usuário', password: 'senha-segura', roles: 'secretaria' };
const secretaryCommunicator = { id: 'user-9', name: 'Secretária', roles: 'secretaria,comunicacao' };
const communicatorOnly = { id: 'user-9', name: 'Comunicadora', roles: 'comunicacao' };

describe('createSecretariaUsuariosIdAlphanumericHandlers', () => {
	describeUserEditHandlers({ domain: 'secretaria', createHandlers: createSecretariaUsuariosIdAlphanumericHandlers });
});

describe('createSecretariaUsuariosIdAlphanumericHandlers area scope', () => {
	afterEach(() => {
		fakeDatabase.reset();
	});

	it('changes the Secretaria role while keeping the Comunicação role', async () => {
		fakeDatabase.resolveWith([secretaryCommunicator]);

		const { result } = await runHandler(createSecretariaUsuariosIdAlphanumericHandlers().actions.default, {
			...admin,
			form: { ...form, roles: 'secretaria:admin' },
		});

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.argumentsOf('set')).toEqual([
			expect.objectContaining({ roles: 'secretaria:admin,comunicacao' }),
		]);
	});

	it('shows only the Secretaria roles of the edited user', async () => {
		fakeDatabase.resolveWith([secretaryCommunicator]);

		const { result } = await runHandler(createSecretariaUsuariosIdAlphanumericHandlers().load, admin);

		expect(result).toEqual({ usuario: { ...secretaryCommunicator, roles: 'secretaria' } });
	});

	it('hides a user who belongs only to Comunicação', async () => {
		fakeDatabase.resolveWith([communicatorOnly]);

		const { error } = await expectHttpError(createSecretariaUsuariosIdAlphanumericHandlers().load, admin);

		expect(error.status).toBe(404);
	});

	it('refuses to update a user who belongs only to Comunicação', async () => {
		fakeDatabase.resolveWith([communicatorOnly]);

		const { error } = await expectHttpError(createSecretariaUsuariosIdAlphanumericHandlers().actions.default, {
			...admin,
			form,
		});

		expect(error.status).toBe(404);
		expect(fakeDatabase.queries().map((query) => query.operation)).toEqual(['select']);
	});

	it.each(['comunicacao:admin', 'secretaria,biblioteca:admin'])('refuses to grant the roles %s', async (roles) => {
		const { result } = await runHandler(createSecretariaUsuariosIdAlphanumericHandlers().actions.default, {
			...admin,
			form: { ...form, roles },
		});

		expect(result).toMatchObject({ status: 400, field: 'roles' });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});
});
