import { describe, vi } from 'vitest';

import { describeUserListHandlers } from '../../../../support/user-list-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaUsuariosHandlers } = await import('#lib/server/biblioteca/usuarios/page-handlers.js');

describe('createBibliotecaUsuariosHandlers', () => {
	describeUserListHandlers({ domain: 'biblioteca', createHandlers: createBibliotecaUsuariosHandlers });
});
