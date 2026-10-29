import { isRedirect } from '@sveltejs/kit';
import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { generateSessionToken, sessionModel } from '#lib/server/auth/session.js';
import { db } from '#lib/server/database/connection.js';
import { session } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withUsers } from '../../lib/server/models/user-test-support';
import { createRequestEvent, invoke } from '../../support/request-event';
import { actions } from '../../../../src/routes/(protected)/logout/+page.server';

const signOut = (locals: ReturnType<typeof createRequestEvent>['locals']) =>
	Promise.resolve()
		.then(() => invoke(actions.default, createRequestEvent({ locals })))
		.catch((reason: unknown) => reason);

describe('logout route', () => {
	it('closes every session of the user and sends them to the login page', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			await sessionModel.create(generateSessionToken(), id);
			const user = { id, username: 'ana@exemplo.dev', name: 'Ana', roles: 'comunicacao' };

			const outcome = await signOut({ user, session: null });

			expect(isRedirect(outcome) && outcome.location).toBe(LOGIN_PATH);
			expect(await db.select().from(session).where(eq(session.userId, id))).toEqual([]);
		});
	});

	it('sends an anonymous visitor to the login page', async () => {
		const outcome = await signOut({ user: null, session: null });

		expect(isRedirect(outcome) && outcome.location).toBe(LOGIN_PATH);
	});
});
