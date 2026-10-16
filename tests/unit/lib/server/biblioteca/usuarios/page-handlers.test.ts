import { describe, expect, it, vi } from 'vitest';

import { expectHttpError } from '../../../../support/handler-event';
import { describeUserListHandlers } from '../../../../support/user-list-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaUsuariosHandlers } = await import('#lib/server/biblioteca/usuarios/page-handlers.js');

describe('createBibliotecaUsuariosHandlers', () => {
	describeUserListHandlers({ viewerRoles: 'biblioteca:admin', createHandlers: createBibliotecaUsuariosHandlers });

	it('hides the user list from a librarian without administrative access', async () => {
		const { error } = await expectHttpError(createBibliotecaUsuariosHandlers().load, {
			roles: 'biblioteca',
			url: 'http://localhost/biblioteca/usuarios',
		});

		expect(error.status).toBe(401);
	});
});
