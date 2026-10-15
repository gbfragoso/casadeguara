import { describe, vi } from 'vitest';

import { describeUserCreationHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaUsuariosNovoHandlers } = await import('#lib/server/biblioteca/usuarios/novo-handlers.js');

describe('createBibliotecaUsuariosNovoHandlers', () => {
	describeUserCreationHandlers({ domain: 'biblioteca', createHandlers: createBibliotecaUsuariosNovoHandlers });
});
