import { isRedirect } from '@sveltejs/kit';
import { hash } from 'argon2';
import { db } from '#lib/server/database/connection.js';
import { session, user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUserValues } from '../lib/server/models/user-test-support';
import { createRequestEvent, invoke } from '../support/request-event';
import { actions } from '../../../src/routes/+page.server';

const PASSWORD = 'senha-segura';

const loginEvent = (email: string) => {
	const form = new FormData();
	form.set('email', email);
	form.set('password', PASSWORD);

	return createRequestEvent({ request: new Request('http://localhost/', { method: 'POST', body: form }) });
};

describe('login route', () => {
	it('opens a session and sends a user with only Comunicação to the module', async () => {
		const values = { ...createTestUserValues('comunicacao'), passwordHash: await hash(PASSWORD) };
		await db.insert(user).values(values);

		try {
			const outcome = await Promise.resolve()
				.then(() => invoke(actions.default, loginEvent(values.username.toUpperCase())))
				.catch((reason: unknown) => reason);
			const sessions = await db.select({ id: session.id }).from(session).where(eq(session.userId, values.id));

			expect(isRedirect(outcome) && outcome.location).toBe('/comunicacao');
			expect(sessions).toHaveLength(1);
		} finally {
			await db.delete(session).where(eq(session.userId, values.id));
			await db.delete(user).where(eq(user.id, values.id));
		}
	});
});
