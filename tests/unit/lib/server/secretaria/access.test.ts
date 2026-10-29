import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { describe, expect, it } from 'vitest';

import { requireSecretariaAccess, requireSecretariaAdminAccess } from '#lib/server/secretaria/access.js';

describe('requireSecretariaAccess', () => {
	it('redirects an unauthenticated request', () => {
		expect(() => requireSecretariaAccess(null)).toThrow(
			expect.objectContaining({ status: 302, location: LOGIN_PATH }),
		);
	});

	it('rejects a user without secretaria access', () => {
		expect(() => requireSecretariaAccess({ id: 'user-1', roles: 'biblioteca' })).toThrow(
			expect.objectContaining({ status: 401 }),
		);
	});

	it('allows a secretaria user', () => {
		const user = { id: 'user-1', roles: 'secretaria' };

		expect(requireSecretariaAccess(user)).toBe(user);
	});
});

describe('requireSecretariaAdminAccess', () => {
	it('rejects a secretaria user without administrative access', () => {
		expect(() => requireSecretariaAdminAccess({ id: 'user-1', roles: 'secretaria,biblioteca:admin' })).toThrow(
			expect.objectContaining({
				status: 401,
				body: { message: 'Usuário não possui acesso administrativo à secretaria.', status: 401 },
			}),
		);
	});

	it('allows a secretaria administrator', () => {
		const user = { id: 'user-1', roles: 'secretaria, secretaria:admin' };

		expect(requireSecretariaAdminAccess(user)).toBe(user);
	});
});
