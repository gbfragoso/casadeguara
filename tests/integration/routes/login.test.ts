import { isRedirect } from '@sveltejs/kit';
import { hash } from 'argon2';
import { db } from '#lib/server/database/connection.js';
import { session, user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUserValues } from '../lib/server/models/user-test-support';
import { createRequestEvent, invoke } from '../support/request-event';
import { actions } from '../../../src/routes/login/+page.server';

const PASSWORD = 'senha-segura';

const loginEvent = (email: string) => {
	const form = new FormData();
	form.set('email', email);
	form.set('password', PASSWORD);

	return createRequestEvent({ request: new Request('http://localhost/', { method: 'POST', body: form }) });
};

const loginAs = async (roles: string, email: (username: string) => string = (username) => username) => {
	const values = { ...createTestUserValues(roles), passwordHash: await hash(PASSWORD) };
	await db.insert(user).values(values);

	try {
		const outcome = await Promise.resolve()
			.then(() => invoke(actions.default, loginEvent(email(values.username))))
			.catch((reason: unknown) => reason);
		const sessions = await db.select({ id: session.id }).from(session).where(eq(session.userId, values.id));

		return { outcome, sessions };
	} finally {
		await db.delete(session).where(eq(session.userId, values.id));
		await db.delete(user).where(eq(user.id, values.id));
	}
};

describe('login route', () => {
	it('opens a session and sends a user with only Comunicação to the module', async () => {
		const { outcome, sessions } = await loginAs('comunicacao', (username) => username.toUpperCase());

		expect(isRedirect(outcome) && outcome.location).toBe('/comunicacao');
		expect(sessions).toHaveLength(1);
	});

	it('TI-12 sends a user with only the superuser role to the module selection', async () => {
		const { outcome } = await loginAs('superuser');

		expect(isRedirect(outcome) && [outcome.status, outcome.location]).toEqual([302, '/sistemas']);
	});
});
