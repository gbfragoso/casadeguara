import { describe, expect, it, vi } from 'vitest';

import { SESSION_COOKIE_NAME } from '#lib/server/auth/cookie.js';
import { createSessionHandle } from '#lib/server/auth/handle.js';
import type { SessionModel, SessionValidation } from '#lib/server/auth/session.js';

import { createRequestEvent } from '../../../../integration/support/request-event';

const user = { id: 'user-1', username: 'leitora', roles: 'biblioteca', name: 'Leitora' };
const expiresAt = new Date('2026-10-15T12:30:00.000Z');

const createSessions = (validation: SessionValidation) => ({
	validate: vi.fn<SessionModel['validate']>(async () => validation),
});

const runHandle = async (sessions: ReturnType<typeof createSessions>, token?: string) => {
	const base = createRequestEvent();
	const cookies = {
		...base.cookies,
		get: (name: string) => (name === SESSION_COOKIE_NAME ? token : undefined),
		set: vi.fn(),
		delete: vi.fn(),
	};
	const event = { ...base, cookies };
	const response = new Response('ok');
	const resolve = vi.fn(async () => response);

	const result = await Reflect.apply(createSessionHandle({ sessions }), undefined, [{ event, resolve }]);

	return { cookies, event, resolve, response, result };
};

describe('createSessionHandle', () => {
	it('resolves an anonymous request without validating a session', async () => {
		const sessions = createSessions({ session: null, user: null });

		const { event, resolve, response, result } = await runHandle(sessions);

		expect(sessions.validate).not.toHaveBeenCalled();
		expect(event.locals).toEqual({ user: null, session: null });
		expect(resolve).toHaveBeenCalledWith(event);
		expect(result).toBe(response);
	});

	it('exposes the user of a valid session without rewriting the cookie', async () => {
		const session = { id: 'hash', userId: user.id, expiresAt, fresh: false };
		const sessions = createSessions({ session, user });

		const { cookies, event } = await runHandle(sessions, 'token');

		expect(event.locals).toEqual({ user, session });
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('extends the cookie when the session was renewed', async () => {
		const sessions = createSessions({ session: { id: 'hash', userId: user.id, expiresAt, fresh: true }, user });

		const { cookies } = await runHandle(sessions, 'token');

		expect(cookies.set).toHaveBeenCalledWith(
			SESSION_COOKIE_NAME,
			'token',
			expect.objectContaining({ expires: expiresAt }),
		);
	});

	it('clears the cookie of an invalid session', async () => {
		const sessions = createSessions({ session: null, user: null });

		const { cookies, event } = await runHandle(sessions, 'stale-token');

		expect(cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME, expect.objectContaining({ path: '/' }));
		expect(event.locals).toEqual({ user: null, session: null });
	});
});
