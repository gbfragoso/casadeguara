import { describe, expect, it } from 'vitest';

import { COMUNICACAO_AREA, LIBRARY_AREA, SECRETARIA_AREA } from '#lib/server/users/area-roles.js';

describe('createAreaRoles', () => {
	it('replaces the area roles while keeping the roles of other areas', () => {
		const currentRoles = 'tesouraria,comunicacao';

		const roles = COMUNICACAO_AREA.replace(currentRoles, 'comunicacao:admin');

		expect(roles).toBe('comunicacao:admin,tesouraria');
	});

	it('selects only the area roles regardless of their position', () => {
		const roles = 'tesouraria, comunicacao:admin';

		const selected = COMUNICACAO_AREA.select(roles);

		expect(selected).toBe('comunicacao:admin');
	});

	it.each([
		['secretaria:admin', true],
		['tesouraria,secretaria', true],
		['secretaria,comunicacao', false],
		['', false],
	])('accepts "%s" as only Secretaria roles: %s', (roles, expected) => {
		expect(SECRETARIA_AREA.hasOnly(roles)).toBe(expected);
	});

	it.each([
		['comunicacao,tesouraria', true],
		['biblioteca:admin', false],
	])('detects an area role in "%s": %s', (roles, expected) => {
		expect(COMUNICACAO_AREA.includesAny(roles)).toBe(expected);
	});

	it('denies editing a user who coordinates an area the editor does not coordinate', () => {
		const editor = { roles: 'comunicacao:admin' };
		const target = { roles: 'comunicacao,biblioteca:admin' };

		const allowed = COMUNICACAO_AREA.administersOtherAreasOf(editor, target);

		expect(allowed).toBe(false);
	});

	it('allows editing a user whose other coordinations the editor shares', () => {
		const editor = { roles: 'biblioteca:admin,tesouraria:admin' };
		const target = { roles: 'biblioteca,tesouraria:admin,comunicacao' };

		const allowed = LIBRARY_AREA.administersOtherAreasOf(editor, target);

		expect(allowed).toBe(true);
	});
});
