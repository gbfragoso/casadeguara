import { describe, expect, it } from 'vitest';

import { load } from '../../../../../src/routes/(protected)/comunicacao/+layout.server';
import { expectHttpError, runHandler } from '../../../support/handler-event';

describe('TU-05 comunicacao layout load', () => {
	it('forbids a user without a Comunicação role', async () => {
		const { error } = await expectHttpError(load, { roles: 'secretaria' });

		expect(error.status).toBe(403);
	});

	it.each([
		['a volunteer', 'comunicacao', false],
		['the coordination', 'tesouraria,comunicacao:admin', true],
	])('tells whether %s administers the module', async (_scenario, roles, isAdmin) => {
		const { result } = await runHandler(load, { roles, userId: 'user-7' });

		expect(result).toEqual({ username: 'Usuário', userid: 'user-7', isAdmin, canManageUsers: false });
	});

	it('lets a superuser with the module manage users', async () => {
		const { result } = await runHandler(load, { roles: 'comunicacao,superuser', userId: 'user-7' });

		expect(result).toMatchObject({ canManageUsers: true });
	});
});
