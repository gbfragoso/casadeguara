import { describe, expect, it } from 'vitest';

import {
	getTesourariaAccess,
	hasTesourariaAccess,
	hasTesourariaAdminAccess,
	requireTesourariaAccess,
	requireTesourariaAdminAccess,
} from '$lib/server/authorization/tesouraria';

describe('tesouraria authorization', () => {
	it('distinguishes anonymous, foreign and treasury access', () => {
		expect(getTesourariaAccess(null)).toBe('unauthenticated');
		expect(getTesourariaAccess({ roles: 'secretaria' })).toBe('unauthorized');
		expect(getTesourariaAccess({ roles: ' tesouraria ' })).toBe('authorized');
	});

	it('recognizes only exact common and administrative roles', () => {
		expect(hasTesourariaAccess({ roles: 'tesouraria' })).toBe(true);
		expect(hasTesourariaAccess({ roles: 'tesouraria:admin' })).toBe(true);
		expect(hasTesourariaAccess({ roles: 'nottesouraria,tesouraria-admin' })).toBe(false);
		expect(hasTesourariaAdminAccess({ roles: 'tesouraria' })).toBe(false);
		expect(hasTesourariaAdminAccess({ roles: 'tesouraria:admin' })).toBe(true);
	});

	it('redirects anonymous common access', () => {
		expect(() => requireTesourariaAccess(null)).toThrow(expect.objectContaining({ status: 302 }));
	});

	it('forbids a foreign user from common access', () => {
		expect(() => requireTesourariaAccess({ roles: 'secretaria' })).toThrow(
			expect.objectContaining({ status: 403 }),
		);
	});

	it('requires the exact administrative role', () => {
		const user = { id: 'admin', roles: 'tesouraria:admin' };

		expect(requireTesourariaAdminAccess(user)).toBe(user);
		expect(() => requireTesourariaAdminAccess({ roles: 'tesouraria' })).toThrow(
			expect.objectContaining({ status: 403 }),
		);
	});
});
