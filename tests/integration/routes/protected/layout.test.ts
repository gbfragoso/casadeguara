import { isRedirect } from '@sveltejs/kit';
import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { describe, expect, it } from 'vitest';

import { createRequestEvent, invoke } from '../../support/request-event';
import { load } from '../../../../src/routes/(protected)/+layout.server';

describe('protected layout guard', () => {
	it('sends an anonymous visitor to the login page', async () => {
		const outcome = await Promise.resolve()
			.then(() => invoke(load, createRequestEvent()))
			.catch((reason: unknown) => reason);

		expect(isRedirect(outcome) && outcome.location).toBe(LOGIN_PATH);
	});

	it('lets a signed-in user through', async () => {
		const user = { id: 'ana', username: 'ana@exemplo.dev', name: 'Ana', roles: 'secretaria' };

		const outcome = await invoke(load, createRequestEvent({ locals: { user, session: null } }));

		expect(outcome).toBeUndefined();
	});
});
