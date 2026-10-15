import { describe, vi } from 'vitest';

import { describeUserEditHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaUsuariosIdAlphanumericHandlers } =
	await import('#lib/server/biblioteca/usuarios/id-handlers.js');

describe('createBibliotecaUsuariosIdAlphanumericHandlers', () => {
	describeUserEditHandlers({ domain: 'biblioteca', createHandlers: createBibliotecaUsuariosIdAlphanumericHandlers });
});
