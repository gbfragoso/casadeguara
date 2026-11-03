import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { describe, expect, it } from 'vitest';

import { hasSuperuserAccess, requireSuperuserAccess } from '#lib/server/authorization/superuser.js';

describe('TU-01 superuser authorization', () => {
	it('redirects an anonymous user to the login page', () => {
		expect(() => requireSuperuserAccess(null)).toThrow(
			expect.objectContaining({ status: 302, location: LOGIN_PATH }),
		);
	});

	it('forbids a module coordinator without the superuser role', () => {
		expect(() => requireSuperuserAccess({ roles: 'biblioteca:admin,secretaria:admin' })).toThrow(
			expect.objectContaining({
				status: 403,
				body: expect.objectContaining({ message: 'Usuário não possui acesso à gestão de usuários.' }),
			}),
		);
	});

	it.each(['superuser', 'secretaria, superuser'])('accepts the user with roles %s', (roles) => {
		const user = { id: 'superusuario', roles };

		expect(requireSuperuserAccess(user)).toBe(user);
	});

	it('recognizes only the exact superuser role', () => {
		expect(hasSuperuserAccess({ roles: 'superuser:admin,notsuperuser' })).toBe(false);
	});

	it('denies the access check without a session', () => {
		expect(hasSuperuserAccess(undefined)).toBe(false);
	});
});
