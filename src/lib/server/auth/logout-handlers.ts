import type { Actions } from '@sveltejs/kit';

import { deleteSessionCookie } from '#lib/server/auth/cookie.js';
import { sessionModel } from '#lib/server/auth/session.js';
import { redirect } from '@sveltejs/kit';

const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) {
			redirect(302, '/');
		}

		await sessionModel.invalidateUserSessions(event.locals.user.id);
		deleteSessionCookie(event.cookies);
		redirect(302, '/');
	},
};

export const createLogoutHandlers = () => ({
	actions,
});
