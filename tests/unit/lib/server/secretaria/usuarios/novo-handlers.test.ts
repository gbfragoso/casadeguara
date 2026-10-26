import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { runHandler } from '../../../../support/handler-event';
import { describeUserCreationHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaUsuariosNovoHandlers } = await import('#lib/server/secretaria/usuarios/novo-handlers.js');

const form = { username: 'novo@example.com', name: 'Novo Usuário', password: 'senha-segura' };

describe('createSecretariaUsuariosNovoHandlers', () => {
	describeUserCreationHandlers({ domain: 'secretaria', createHandlers: createSecretariaUsuariosNovoHandlers });
});

describe('createSecretariaUsuariosNovoHandlers area scope', () => {
	afterEach(() => {
		fakeDatabase.reset();
	});

	it.each(['', 'comunicacao:admin', 'biblioteca'])('refuses to create a user with the roles "%s"', async (roles) => {
		const { result } = await runHandler(createSecretariaUsuariosNovoHandlers().actions.default, {
			roles: 'secretaria:admin',
			form: { ...form, roles },
		});

		expect(result).toMatchObject({ status: 400, field: 'roles' });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});
});
