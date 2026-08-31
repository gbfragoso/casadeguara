import { describe, expect, it } from 'vitest';

import { protectedBibliotecaActions } from '../../../support/biblioteca-route-actions';
import { protectedBibliotecaLoads } from '../../../support/biblioteca-route-loads';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { secretariaUser } from '../../../support/auth';

const invokeAnonymous = <Result>(handler: (...args: never[]) => Result) =>
	Promise.resolve().then(() =>
		invoke(
			handler,
			createRequestEvent({ request: new Request('http://localhost/', { method: 'POST', body: new FormData() }) }),
		),
	);

const invokeAsForeignUser = <Result>(handler: (...args: never[]) => Result) =>
	Promise.resolve().then(() =>
		invoke(
			handler,
			createRequestEvent({
				locals: { user: secretariaUser, session: null },
				request: new Request('http://localhost/', { method: 'POST', body: new FormData() }),
			}),
		),
	);

describe('TI-06 biblioteca route exports', () => {
	it('rejects anonymous page loads before touching protected data', async () => {
		await Promise.all(
			protectedBibliotecaLoads.map((load) =>
				expect(invokeAnonymous(load)).rejects.toMatchObject({ status: 302 }),
			),
		);
	});

	it('rejects anonymous actions before parsing submitted data', async () => {
		await Promise.all(
			protectedBibliotecaActions.map((action) =>
				expect(invokeAnonymous(action)).rejects.toMatchObject({ status: 302 }),
			),
		);
	});

	it('rejects a user from another domain on every library export', async () => {
		await Promise.all(
			[...protectedBibliotecaLoads, ...protectedBibliotecaActions].map((handler) =>
				expect(invokeAsForeignUser(handler)).rejects.toMatchObject({ status: 401 }),
			),
		);
	});
});
