import { describe, expect, it } from 'vitest';

import {
	hasComunicacaoAccess,
	hasComunicacaoAdminAccess,
	requireComunicacaoAccess,
	requireComunicacaoAdminAccess,
} from '#lib/server/authorization/comunicacao.js';

describe('TU-01 comunicacao authorization', () => {
	it('redirects an anonymous user to the login page', () => {
		expect(() => requireComunicacaoAccess(null)).toThrow(expect.objectContaining({ status: 302, location: '/' }));
	});

	it('forbids a user without a Comunicação role', () => {
		expect(() => requireComunicacaoAccess({ roles: 'secretaria,tesouraria:admin' })).toThrow(
			expect.objectContaining({ status: 403 }),
		);
	});

	it.each(['comunicacao', 'secretaria, comunicacao:admin'])('accepts the user with roles %s', (roles) => {
		const user = { id: 'voluntario', roles };

		expect(requireComunicacaoAccess(user)).toBe(user);
	});

	it('recognizes only the exact Comunicação roles', () => {
		expect(hasComunicacaoAccess({ roles: 'comunicacao-admin,notcomunicacao' })).toBe(false);
		expect(hasComunicacaoAdminAccess({ roles: 'comunicacao' })).toBe(false);
		expect(hasComunicacaoAdminAccess({ roles: 'comunicacao:admin' })).toBe(true);
	});

	it('lets only the coordination through the coordination guard', () => {
		const coordinator = { id: 'coordenacao', roles: 'comunicacao:admin' };

		expect(requireComunicacaoAdminAccess(coordinator)).toBe(coordinator);
		expect(() => requireComunicacaoAdminAccess({ roles: 'comunicacao' })).toThrow(
			expect.objectContaining({ status: 403 }),
		);
	});
});
