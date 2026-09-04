import { describe, expect, it } from 'vitest';

import { requireTesourariaAccess } from '$lib/server/tesouraria/contributors/access';

describe('treasury contributor access', () => {
	it('preserves the contributor guard redirect for anonymous users', () => {
		expect(() => requireTesourariaAccess(null)).toThrow(expect.objectContaining({ status: 302 }));
	});

	it('preserves the contributor guard status for foreign users', () => {
		expect(() => requireTesourariaAccess({ id: 'foreign', roles: 'secretaria' })).toThrow(
			expect.objectContaining({ status: 401 }),
		);
	});

	it('allows a treasury contributor user', () => {
		const user = { id: 'contributor', roles: ' tesouraria ' };

		expect(requireTesourariaAccess(user)).toBe(user);
	});
});
