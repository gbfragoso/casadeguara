import { isActionFailure, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';

import { createLoginHandlers } from '#lib/server/public/login-handlers.js';
import { createRequestEvent, invoke } from '../../../../integration/support/request-event';

const PASSWORD = 'senha-correta';
const PASSWORD_LIMIT = 255;
const SESSION_EXPIRATION = new Date('2026-10-25T12:00:00Z');

type StoredUser = { id: string; passwordHash: string; roles: string };

const createUsers = (stored: StoredUser[]) => ({
	findCredentials: async (username: string) => stored.find(({ id }) => `${id}@exemplo.dev` === username),
});

const createSessions = () => {
	const created: string[] = [];
	return {
		created,
		create: async (token: string, userId: string) => {
			created.push(userId);
			return { id: token, userId, expiresAt: SESSION_EXPIRATION, fresh: true };
		},
	};
};

const verifyPassword = async (passwordHash: string, password: string) => passwordHash === `hash:${password}`;

const submitLogin = async (roles: string, form: Record<string, string>) => {
	const sessions = createSessions();
	const users = createUsers([{ id: 'ana', passwordHash: `hash:${PASSWORD}`, roles }]);
	const body = new FormData();
	Object.entries(form).forEach(([name, value]) => body.set(name, value));
	const request = new Request('http://localhost/', { method: 'POST', body });

	const { actions } = createLoginHandlers({ users, sessions, verifyPassword });
	const outcome = await Promise.resolve()
		.then(() => invoke(actions.default, createRequestEvent({ request })))
		.catch((reason: unknown) => reason);

	return { outcome, sessions: sessions.created };
};

const validLogin = { email: 'ANA@exemplo.dev', password: PASSWORD };

describe('login handlers', () => {
	it('TU-03 sends a user with only Comunicação to the module', async () => {
		const { outcome, sessions } = await submitLogin('comunicacao', validLogin);

		expect(isRedirect(outcome) && [outcome.status, outcome.location]).toEqual([302, '/comunicacao']);
		expect(sessions).toEqual(['ana']);
	});

	it('sends a user with several areas to the module selection', async () => {
		const { outcome } = await submitLogin('secretaria,comunicacao', validLogin);

		expect(isRedirect(outcome) && outcome.location).toBe('/sistemas');
	});

	it.each([
		['a wrong password', { ...validLogin, password: 'senha-errada' }],
		['an unknown user', { ...validLogin, email: 'rui@exemplo.dev' }],
	])('rejects %s without opening a session', async (_scenario, form) => {
		const { outcome, sessions } = await submitLogin('comunicacao', form);

		expect(isActionFailure(outcome) && outcome.data).toEqual({ failedLogin: true });
		expect(sessions).toEqual([]);
	});

	it('rejects a missing e-mail', async () => {
		const { outcome } = await submitLogin('comunicacao', { password: PASSWORD });

		expect(isActionFailure(outcome) && outcome.data).toEqual({ invalidEmail: true });
	});

	it('rejects a password longer than the limit', async () => {
		const { outcome } = await submitLogin('comunicacao', {
			...validLogin,
			password: 'x'.repeat(PASSWORD_LIMIT + 1),
		});

		expect(isActionFailure(outcome) && outcome.data).toEqual({ invalidPassword: true });
	});

	it('asks a user without a module to request access', async () => {
		const { outcome } = await submitLogin('desconhecido', validLogin);

		expect(isActionFailure(outcome) && outcome.data).toEqual({
			message: 'Solicite ao administrador do sistema cadastramento no setor',
		});
	});

	it('sends a signed-in user with a module straight to the module', async () => {
		const { load } = createLoginHandlers({ users: createUsers([]), sessions: createSessions(), verifyPassword });

		const outcome = await Promise.resolve()
			.then(() => load({ locals: { user: { roles: 'comunicacao' } } }))
			.catch((reason: unknown) => reason);

		expect(isRedirect(outcome) && [outcome.status, outcome.location]).toEqual([302, '/comunicacao']);
	});

	it.each([
		['an anonymous visitor', null],
		['a signed-in user without a module', { roles: 'desconhecido' }],
	])('shows the form to %s', (_scenario, user) => {
		const { load } = createLoginHandlers({ users: createUsers([]), sessions: createSessions(), verifyPassword });

		const outcome = load({ locals: { user } });

		expect(outcome).toBeUndefined();
	});
});
