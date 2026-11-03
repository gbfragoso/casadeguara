import { describe, expect, it } from 'vitest';

import { load } from '../../../../../src/routes/(protected)/biblioteca/+layout.server';
import { runHandler } from '../../../support/handler-event';

describe('biblioteca layout load', () => {
	it.each([
		['a volunteer', 'biblioteca', false],
		['a superuser', 'biblioteca,superuser', true],
	])('tells whether %s of Biblioteca manages users', async (_scenario, roles, canManageUsers) => {
		const { result } = await runHandler(load, { roles, userId: 'user-7' });

		expect(result).toEqual({ username: 'Usuário', userid: 'user-7', isAdmin: false, canManageUsers });
	});
});
