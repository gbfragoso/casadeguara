import { isRedirect } from '@sveltejs/kit';
import { db } from '#lib/server/database/connection.js';
import { session, user } from '#lib/server/database/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUsername, withUsers } from '../../../lib/server/models/user-test-support';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions as loginActions } from '../../../../../src/routes/login/+page.server';
import { actions } from '../../../../../src/routes/(protected)/usuarios/novo/+page.server';
import { SUPERUSER, createAccountForm, createPostEvent, readStoredUser, settle } from './support';

const PASSWORD = 'senha-segura';
const MODULE_SELECTION = '/sistemas';

const signIn = (email: string) => {
	const form = new FormData();
	form.set('email', email);
	form.set('password', PASSWORD);
	const request = new Request('http://localhost/', { method: 'POST', body: form });

	return settle(() => invoke(loginActions.default, createRequestEvent({ request })));
};

const removeUsersNamed = async (username: string) => {
	const found = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
	const ids = found.map(({ id }) => id);
	if (ids.length === 0) return;

	await db.delete(session).where(inArray(session.userId, ids));
	await db.delete(user).where(inArray(user.id, ids));
};

describe('TI-04 user creation', () => {
	it('stores exactly the chosen roles and the real login accepts the password', async () => {
		const username = createTestUsername();
		const form = createAccountForm({
			username,
			password: PASSWORD,
			'access-secretaria': 'volunteer',
			'access-tesouraria': 'coordination',
		});

		try {
			const outcome = await invoke(actions.default, createPostEvent(SUPERUSER, form));
			const [stored] = await db.select({ roles: user.roles }).from(user).where(eq(user.username, username));
			const login = await signIn(username);

			expect(outcome).toEqual({ status: 201 });
			expect(stored.roles).toBe('secretaria,tesouraria:admin');
			expect(isRedirect(login) && login.location).toBe(MODULE_SELECTION);
		} finally {
			await removeUsersNamed(username);
		}
	});
});

describe('TI-05 duplicate login on creation', () => {
	it('refuses an existing login without storing another user', async () => {
		await withUsers(['secretaria'], async ([id]) => {
			const { username } = await readStoredUser(id);
			const form = createAccountForm({ username, password: PASSWORD, 'access-secretaria': 'volunteer' });

			const outcome = await settle(() => invoke(actions.default, createPostEvent(SUPERUSER, form)));
			const stored = await db.select({ id: user.id }).from(user).where(eq(user.username, username));

			expect(outcome).toMatchObject({
				status: 400,
				data: { errors: { username: ['Já existe um usuário com este login.'] } },
			});
			expect(stored).toEqual([{ id }]);
		});
	});
});
