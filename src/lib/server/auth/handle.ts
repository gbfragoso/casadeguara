import type { Handle } from '@sveltejs/kit/hooks';

import { deleteSessionCookie, SESSION_COOKIE_NAME, setSessionCookie } from './cookie';
import type { SessionModel } from './session';

type SessionHandleDependencies = { sessions: Pick<SessionModel, 'validate'> };

export const createSessionHandle =
	({ sessions }: SessionHandleDependencies): Handle =>
	async ({ event, resolve }) => {
		const token = event.cookies.get(SESSION_COOKIE_NAME);
		if (!token) {
			event.locals.user = null;
			event.locals.session = null;
			return resolve(event);
		}

		const { session, user } = await sessions.validate(token);
		if (session?.fresh) setSessionCookie(event.cookies, token, session.expiresAt);
		if (!session) deleteSessionCookie(event.cookies);

		event.locals.user = user;
		event.locals.session = session;
		return resolve(event);
	};
