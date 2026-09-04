import { describe, expect, it } from 'vitest';

import {
	getCadastroAccess,
	hasBibliotecaAccess,
	hasSecretariaAccess,
	hasTesourariaAccess,
	parseRoles,
} from '$lib/server/authorization/cadastros';

describe('cadastro authorization', () => {
	it('distinguishes unauthenticated callers', () => {
		expect(getCadastroAccess(null, 'biblioteca')).toBe('unauthenticated');
	});

	it('distinguishes an authenticated caller without dashboard access', () => {
		expect(getCadastroAccess({ roles: 'secretaria' }, 'biblioteca')).toBe('unauthorized');
	});

	it('allows each base dashboard role', () => {
		expect(hasBibliotecaAccess({ roles: 'biblioteca' })).toBe(true);
		expect(hasSecretariaAccess({ roles: 'secretaria' })).toBe(true);
		expect(hasTesourariaAccess({ roles: 'tesouraria' })).toBe(true);
	});

	it('allows each dashboard administrator role', () => {
		expect(hasBibliotecaAccess({ roles: 'biblioteca:admin' })).toBe(true);
		expect(hasSecretariaAccess({ roles: 'secretaria:admin' })).toBe(true);
		expect(hasTesourariaAccess({ roles: 'tesouraria:admin' })).toBe(true);
	});

	it('allows a caller with multiple dashboard roles', () => {
		expect(hasTesourariaAccess({ roles: 'biblioteca,tesouraria:admin' })).toBe(true);
	});

	it('trims role tokens before exact matching', () => {
		expect(parseRoles(' secretaria, biblioteca ')).toEqual(['secretaria', 'biblioteca']);
		expect(hasBibliotecaAccess({ roles: 'secretaria, biblioteca' })).toBe(true);
	});

	it('rejects deceptive role substrings', () => {
		expect(hasBibliotecaAccess({ roles: 'notbiblioteca,bibliotecario' })).toBe(false);
	});
});
