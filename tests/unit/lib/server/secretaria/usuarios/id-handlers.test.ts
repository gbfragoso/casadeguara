import { describe, vi } from 'vitest';

import { describeUserEditHandlers } from '../../../../support/user-management-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaUsuariosIdAlphanumericHandlers } =
	await import('#lib/server/secretaria/usuarios/id-handlers.js');

describe('createSecretariaUsuariosIdAlphanumericHandlers', () => {
	describeUserEditHandlers({ domain: 'secretaria', createHandlers: createSecretariaUsuariosIdAlphanumericHandlers });
});
