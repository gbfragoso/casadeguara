import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { runHandler } from '../../../../support/handler-event';
import { describeUserCreationHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaUsuariosNovoHandlers } = await import('#lib/server/biblioteca/usuarios/novo-handlers.js');

const form = { username: 'novo@example.com', name: 'Novo Usuário', password: 'senha-segura' };

describe('createBibliotecaUsuariosNovoHandlers', () => {
	describeUserCreationHandlers({ domain: 'biblioteca', createHandlers: createBibliotecaUsuariosNovoHandlers });
});

describe('createBibliotecaUsuariosNovoHandlers library scope', () => {
	afterEach(() => {
		fakeDatabase.reset();
	});

	it.each(['', 'biblioteca,tesouraria:admin', 'secretaria:admin'])(
		'refuses to create a user with the roles "%s"',
		async (roles) => {
			const { actions } = createBibliotecaUsuariosNovoHandlers();

			const { result } = await runHandler(actions.default, {
				roles: 'biblioteca:admin',
				form: { ...form, roles },
			});

			expect(result).toMatchObject({ status: 400, field: 'roles' });
			expect(fakeDatabase.queries()).toHaveLength(0);
		},
	);
});
