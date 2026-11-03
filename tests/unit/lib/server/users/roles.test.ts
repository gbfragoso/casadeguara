import { describe, expect, it } from 'vitest';

import { buildRoles, readUserAccess, summarizeAccess, type UserAccess } from '#lib/server/users/roles.js';

const createAccess = (overrides: Partial<UserAccess['modules']> = {}, superuser = false): UserAccess => ({
	modules: { biblioteca: 'none', secretaria: 'none', tesouraria: 'none', comunicacao: 'none', ...overrides },
	superuser,
});

describe('TU-02 readUserAccess', () => {
	it('converts module roles into access levels', () => {
		const access = readUserAccess('secretaria, tesouraria:admin,superuser');

		expect(access).toEqual(createAccess({ secretaria: 'volunteer', tesouraria: 'coordination' }, true));
	});

	it('lets coordination prevail over volunteer for the same module', () => {
		const access = readUserAccess('biblioteca,biblioteca:admin');

		expect(access.modules.biblioteca).toBe('coordination');
	});

	it('ignores unknown roles', () => {
		const access = readUserAccess('financeiro,comunicacao-admin,');

		expect(access).toEqual(createAccess());
	});
});

describe('TU-03 buildRoles', () => {
	it('writes the chosen module roles in canonical order', () => {
		const roles = buildRoles(createAccess({ tesouraria: 'coordination', secretaria: 'volunteer' }));

		expect(roles).toBe('secretaria,tesouraria:admin');
	});

	it('replaces the current module roles and never keeps both levels of a module', () => {
		const roles = buildRoles(
			createAccess({ biblioteca: 'coordination' }),
			'biblioteca,biblioteca:admin,secretaria',
		);

		expect(roles).toBe('biblioteca:admin');
	});

	it('adds the superuser role', () => {
		const roles = buildRoles(createAccess({ comunicacao: 'volunteer' }, true), 'comunicacao');

		expect(roles).toBe('comunicacao,superuser');
	});

	it('removes the superuser role', () => {
		const roles = buildRoles(createAccess({ secretaria: 'volunteer' }), 'secretaria,superuser');

		expect(roles).toBe('secretaria');
	});

	it('preserves unknown roles in their original order without duplicates or empty items', () => {
		const roles = buildRoles(
			createAccess({ secretaria: 'volunteer' }),
			'financeiro, ,secretaria,auditoria,financeiro',
		);

		expect(roles).toBe('secretaria,financeiro,auditoria');
	});

	it('writes no role when every access is removed', () => {
		const roles = buildRoles(createAccess(), 'biblioteca:admin,superuser');

		expect(roles).toBe('');
	});
});

describe('TU-04 summarizeAccess', () => {
	it('lists the modules in canonical order followed by the superuser label', () => {
		const summary = summarizeAccess('superuser,comunicacao,biblioteca:admin,financeiro');

		expect(summary).toBe('Biblioteca: Coordenação, Comunicação: Voluntário, Superusuário');
	});

	it.each(['', 'financeiro'])('shows no access for roles %j', (roles) => {
		const summary = summarizeAccess(roles);

		expect(summary).toBe('Sem acesso');
	});
});
