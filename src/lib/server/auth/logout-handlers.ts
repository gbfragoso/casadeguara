import type { Actions } from '@sveltejs/kit';

import { deleteSessionCookie } from '#lib/server/auth/cookie.js';
import { sessionModel } from '#lib/server/auth/session.js';
import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { redirect } from '@sveltejs/kit';

const actions: Actions = {
	default: async (event) => {
		const user = requireAuthenticatedUser(event.locals.user);

		await sessionModel.invalidateUserSessions(user.id);
		deleteSessionCookie(event.cookies);
		redirect(302, LOGIN_PATH);
	},
};

export const createLogoutHandlers = () => ({
	actions,
});
