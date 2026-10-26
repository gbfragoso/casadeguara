import { describe, expect, it, vi } from 'vitest';

import { expectHttpError } from '../../../../support/handler-event';
import { describeUserListHandlers } from '../../../../support/user-list-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaUsuariosHandlers } = await import('#lib/server/secretaria/usuarios/page-handlers.js');

describe('createSecretariaUsuariosHandlers', () => {
	describeUserListHandlers({ viewerRoles: 'secretaria:admin', createHandlers: createSecretariaUsuariosHandlers });

	it('hides the user list from a secretary without coordination access', async () => {
		const { error } = await expectHttpError(createSecretariaUsuariosHandlers().load, {
			roles: 'secretaria',
			url: 'http://localhost/secretaria/usuarios',
		});

		expect(error.status).toBe(401);
	});
});
