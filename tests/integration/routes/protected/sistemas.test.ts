import { isRedirect } from '@sveltejs/kit';
import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { withUsers } from '../../lib/server/models/user-test-support';
import { createRequestEvent, invoke } from '../../support/request-event';
import { load } from '../../../../src/routes/(protected)/sistemas/+page.server';

const loadModules = (user: ReturnType<typeof createRequestEvent>['locals']['user']) =>
	Promise.resolve()
		.then(() => invoke(load, createRequestEvent({ locals: { user, session: null } })))
		.catch((reason: unknown) => reason);

const sessionUser = (id: string) => ({ id, username: 'ana@exemplo.dev', name: 'Ana', roles: '' });

describe('module selection route', () => {
	afterEach(() => vi.restoreAllMocks());

	it('reads the stored roles of the signed-in user', async () => {
		await withUsers(['secretaria,comunicacao'], async ([id]) => {
			const data = await loadModules(sessionUser(id));

			expect(data).toEqual({ roles: ['secretaria', 'comunicacao'] });
		});
	});

	it('answers 404 when the signed-in user no longer exists', async () => {
		const outcome = await loadModules(sessionUser('usuario-removido'));

		expect(outcome).toMatchObject({ status: 404 });
	});

	it('sends an anonymous visitor to the login page', async () => {
		const outcome = await loadModules(null);

		expect(isRedirect(outcome) && outcome.location).toBe(LOGIN_PATH);
	});
});
