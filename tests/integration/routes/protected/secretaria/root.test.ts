import { isRedirect } from '@sveltejs/kit';
import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { describe, expect, it } from 'vitest';

import { createRequestEvent, invoke } from '../../../support/request-event';
import { load } from '../../../../../src/routes/(protected)/secretaria/+page.server';

const loadIndicators = (user: ReturnType<typeof createRequestEvent>['locals']['user']) =>
	Promise.resolve()
		.then(() => invoke(load, createRequestEvent({ locals: { user, session: null } })))
		.catch((reason: unknown) => reason);

describe('secretaria home route', () => {
	it('counts the workers and the attendance of the month', async () => {
		const user = { id: 'secretaria-inicio', username: 'ana@exemplo.dev', name: 'Ana', roles: 'secretaria' };

		const data = (await loadIndicators(user)) as { leitores: Promise<unknown>; engajamento: Promise<unknown> };

		expect(await data.leitores).toEqual([{ counter: expect.any(Number) }]);
		expect(await data.engajamento).toEqual([{ counter: expect.any(Number) }]);
	});

	it('sends an anonymous visitor to the login page', async () => {
		const outcome = await loadIndicators(null);

		expect(isRedirect(outcome) && outcome.location).toBe(LOGIN_PATH);
	});
});
