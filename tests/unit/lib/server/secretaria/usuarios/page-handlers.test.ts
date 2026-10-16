import { describe, vi } from 'vitest';

import { describeUserListHandlers } from '../../../../support/user-list-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaUsuariosHandlers } = await import('#lib/server/secretaria/usuarios/page-handlers.js');

describe('createSecretariaUsuariosHandlers', () => {
	describeUserListHandlers({ viewerRoles: 'secretaria', createHandlers: createSecretariaUsuariosHandlers });
});
