import { describe, expect, it } from 'vitest';

import { requireLibraryAccess, requireLibraryAdminAccess } from '$lib/server/authorization/biblioteca';

describe('requireLibraryAccess', () => {
	it('redirects an unauthenticated request', () => {
		expect(() => requireLibraryAccess(null)).toThrow(expect.objectContaining({ status: 302 }));
	});

	it('rejects a user without library access', () => {
		expect(() => requireLibraryAccess({ roles: 'secretaria' })).toThrow(
			expect.objectContaining({
				status: 401,
				body: { message: 'Usuário não possui acesso ao sistema da biblioteca' },
			}),
		);
	});

	it('allows library roles including administrators', () => {
		const user = { id: 'user-1', roles: 'biblioteca,biblioteca:admin', username: 'bibliotecaria' };

		expect(requireLibraryAccess(user)).toBe(user);
	});

	it('accepts only the exact administrative token', () => {
		const user = { roles: 'biblioteca:admin' };

		expect(requireLibraryAdminAccess(user)).toBe(user);
		expect(() => requireLibraryAdminAccess({ roles: 'biblioteca:administrator' })).toThrow(
			expect.objectContaining({ status: 401 }),
		);
	});

	it('rejects deceptive library role substrings', () => {
		expect(() => requireLibraryAccess({ roles: 'notbiblioteca' })).toThrow(
			expect.objectContaining({ status: 401 }),
		);
	});
});
