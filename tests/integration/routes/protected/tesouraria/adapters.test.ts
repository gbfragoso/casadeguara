import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import {
	actions as contributorActions,
	load as contributorLoad,
} from '../../../../../src/routes/(protected)/tesouraria/contribuintes/+page.server';
import {
	actions as newContributorActions,
	load as newContributorLoad,
} from '../../../../../src/routes/(protected)/tesouraria/contribuintes/novo/+page.server';
import {
	actions as editContributorActions,
	load as editContributorLoad,
} from '../../../../../src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { bibliotecaUser, tesourariaUser } from '../../../support/auth';

const event = () =>
	createRequestEvent({ request: new Request('http://localhost/', { method: 'POST', body: new FormData() }) });
const invokeSafely = <Result>(handler: (...args: never[]) => Result) =>
	Promise.resolve().then(() => invoke(handler, event()));
const invokeAsForeignUser = <Result>(handler: (...args: never[]) => Result) =>
	Promise.resolve().then(() =>
		invoke(
			handler,
			createRequestEvent({
				locals: { user: bibliotecaUser, session: null },
				request: new Request('http://localhost/', { method: 'POST', body: new FormData() }),
			}),
		),
	);
const loads = [contributorLoad, newContributorLoad, editContributorLoad];
const actions = [contributorActions.default, newContributorActions.default, editContributorActions.default];

describe('TI-06 tesouraria route exports', () => {
	it('rejects anonymous loads at each protected boundary', async () => {
		await Promise.all(loads.map((load) => expect(invokeSafely(load)).rejects.toMatchObject({ status: 302 })));
	});

	it('rejects anonymous actions before validation or persistence', async () => {
		await Promise.all(actions.map((action) => expect(invokeSafely(action)).rejects.toMatchObject({ status: 302 })));
	});

	it('rejects a user from another domain on every contributor export', async () => {
		await Promise.all(
			[...loads, ...actions].map((handler) =>
				expect(invokeAsForeignUser(handler)).rejects.toMatchObject({ status: 401 }),
			),
		);
	});

	it('commits a valid contributor through the real action export', async () => {
		const form = new FormData();
		form.set('nome', 'Integração contribuinte');
		const result = await invoke(
			newContributorActions.default,
			createRequestEvent({
				locals: { user: tesourariaUser, session: null },
				request: new Request('http://localhost/', { method: 'POST', body: form }),
			}),
		);
		const [created] = await db
			.select({ id: cadastros.idleitor })
			.from(cadastros)
			.where(eq(cadastros.nome, 'INTEGRAÇÃO CONTRIBUINTE'));

		try {
			expect(result).toEqual({ status: 201 });
			expect(created).toBeDefined();
		} finally {
			if (created) await db.delete(cadastros).where(eq(cadastros.idleitor, created.id));
		}
	});
});
