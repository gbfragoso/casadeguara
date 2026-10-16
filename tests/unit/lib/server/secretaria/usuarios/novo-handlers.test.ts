import { describe, vi } from 'vitest';

import { describeUserCreationHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaUsuariosNovoHandlers } = await import('#lib/server/secretaria/usuarios/novo-handlers.js');

describe('createSecretariaUsuariosNovoHandlers', () => {
	describeUserCreationHandlers({ domain: 'secretaria', createHandlers: createSecretariaUsuariosNovoHandlers });
});
