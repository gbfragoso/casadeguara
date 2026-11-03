import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';

import { createRequestEvent, type TestUser } from '../../../support/request-event';

export type AccountForm = Record<string, string>;

export const signedInAs = (id: string, roles = 'superuser'): TestUser => ({
	id,
	username: 'gestor@exemplo.dev',
	name: 'Gestor',
	roles,
});

export const SUPERUSER = signedInAs('integration-superuser');

export const createAccountForm = (overrides: AccountForm = {}): AccountForm => ({
	username: 'ana@exemplo.dev',
	name: 'Ana Souza',
	password: '',
	'access-biblioteca': 'none',
	'access-secretaria': 'none',
	'access-tesouraria': 'none',
	'access-comunicacao': 'none',
	...overrides,
});

const toFormData = (fields: AccountForm) => {
	const formData = new FormData();
	Object.entries(fields).forEach(([name, value]) => formData.set(name, value));
	return formData;
};

export const createGetEvent = (signedIn: TestUser | null, params: Record<string, string> = {}) =>
	createRequestEvent({ locals: { user: signedIn, session: null }, params });

export const createPostEvent = (signedIn: TestUser | null, fields: AccountForm, params: Record<string, string> = {}) =>
	createRequestEvent({
		locals: { user: signedIn, session: null },
		params,
		request: new Request('http://localhost/', { method: 'POST', body: toFormData(fields) }),
	});

export const settle = (run: () => unknown) =>
	Promise.resolve()
		.then(run)
		.catch((reason: unknown) => reason);

export const readStoredUser = async (id: string) => {
	const [found] = await db
		.select({ username: user.username, name: user.name, roles: user.roles, passwordHash: user.passwordHash })
		.from(user)
		.where(eq(user.id, id));

	return found;
};

export const storePasswordHash = (id: string, passwordHash: string) =>
	db.update(user).set({ passwordHash }).where(eq(user.id, id));
