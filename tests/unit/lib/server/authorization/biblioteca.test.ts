import { describe, expect, it } from 'vitest';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';

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
		expect(() => requireLibraryAccess({ roles: 'biblioteca,biblioteca:admin' })).not.toThrow();
	});
});
