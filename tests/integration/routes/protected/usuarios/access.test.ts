import { isRedirect } from '@sveltejs/kit';
import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUsername, withUsers } from '../../../lib/server/models/user-test-support';
import { invoke } from '../../../support/request-event';
import { load as listLoad } from '../../../../../src/routes/(protected)/usuarios/+page.server';
import {
	actions as editActions,
	load as editLoad,
} from '../../../../../src/routes/(protected)/usuarios/[id=alphanumeric]/+page.server';
import {
	actions as createActions,
	load as createLoad,
} from '../../../../../src/routes/(protected)/usuarios/novo/+page.server';
import {
	SUPERUSER,
	createAccountForm,
	createGetEvent,
	createPostEvent,
	readStoredUser,
	settle,
	signedInAs,
} from './support';

const COORDINATION = 'comunicacao:admin';

describe('TI-01 user management refusal without the superuser role', () => {
	it('answers 403 to the three loads', async () => {
		await withUsers(['secretaria'], async ([id]) => {
			const signedIn = signedInAs('integration-coordenacao', COORDINATION);

			const outcomes = await Promise.all([
				settle(() => invoke(listLoad, createGetEvent(signedIn))),
				settle(() => invoke(createLoad, createGetEvent(signedIn))),
				settle(() => invoke(editLoad, createGetEvent(signedIn, { id }))),
			]);

			expect(outcomes).toMatchObject([{ status: 403 }, { status: 403 }, { status: 403 }]);
		});
	});

	it('answers 403 to the creation without storing the user', async () => {
		const signedIn = signedInAs('integration-coordenacao', COORDINATION);
		const username = createTestUsername();
		const form = createAccountForm({ username, password: 'senha-segura', 'access-comunicacao': 'volunteer' });

		const outcome = await settle(() => invoke(createActions.default, createPostEvent(signedIn, form)));

		expect(outcome).toMatchObject({ status: 403 });
		expect(await db.select().from(user).where(eq(user.username, username))).toEqual([]);
	});

	it('answers 403 to the edition without changing the user', async () => {
		await withUsers(['secretaria'], async ([id]) => {
			const signedIn = signedInAs('integration-coordenacao', COORDINATION);
			const before = await readStoredUser(id);
			const form = createAccountForm({ username: before.username, 'access-secretaria': 'coordination' });

			const outcome = await settle(() => invoke(editActions.default, createPostEvent(signedIn, form, { id })));

			expect(outcome).toMatchObject({ status: 403 });
			expect(await readStoredUser(id)).toEqual(before);
		});
	});
});

describe('TI-02 user list without a session', () => {
	it('sends the anonymous visitor to the login page', async () => {
		const outcome = await settle(() => invoke(listLoad, createGetEvent(null)));

		expect(isRedirect(outcome) && outcome.location).toBe(LOGIN_PATH);
	});
});

describe('TI-10 unknown user identifier', () => {
	it('answers 404 to the edition load', async () => {
		const outcome = await settle(() => invoke(editLoad, createGetEvent(SUPERUSER, { id: 'usuarioinexistente' })));

		expect(outcome).toMatchObject({ status: 404 });
	});

	it('answers 404 to the edition action', async () => {
		const form = createAccountForm({ username: createTestUsername(), 'access-secretaria': 'volunteer' });

		const outcome = await settle(() =>
			invoke(editActions.default, createPostEvent(SUPERUSER, form, { id: 'usuarioinexistente' })),
		);

		expect(outcome).toMatchObject({ status: 404 });
	});
});
