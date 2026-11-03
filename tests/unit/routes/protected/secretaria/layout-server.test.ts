import { describe, expect, it } from 'vitest';

import { load } from '../../../../../src/routes/(protected)/secretaria/+layout.server';
import { runHandler } from '../../../support/handler-event';

describe('secretaria layout load', () => {
	it.each([
		['a volunteer', 'secretaria', false],
		['a superuser', 'secretaria,superuser', true],
	])('tells whether %s of Secretaria manages users', async (_scenario, roles, canManageUsers) => {
		const { result } = await runHandler(load, { roles, userId: 'user-7' });

		expect(result).toEqual({ username: 'Usuário', userid: 'user-7', isAdmin: false, canManageUsers });
	});
});
