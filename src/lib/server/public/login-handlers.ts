import type { Actions } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { setSessionCookie } from '#lib/server/auth/cookie.js';
import { generateSessionToken, sessionModel } from '#lib/server/auth/session.js';
import { fail, redirect } from '@sveltejs/kit';
import { verify } from 'argon2';
import { eq } from 'drizzle-orm';

const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string') {
			return fail(400, { invalidEmail: true });
		}

		if (typeof password !== 'string' || password.length > 255) {
			return fail(400, { invalidPassword: true });
		}

		const existingUser = await db.select().from(user).where(eq(user.username, email.toLowerCase()));
		if (!existingUser || existingUser.length === 0) {
			return fail(400, { failedLogin: true });
		}

		const validPassword = await verify(existingUser[0].passwordHash, password);
		if (!validPassword) {
			return fail(400, { failedLogin: true });
		}

		const token = generateSessionToken();
		const session = await sessionModel.create(token, existingUser[0].id);
		setSessionCookie(cookies, token, session.expiresAt);

		const role = existingUser[0].roles;
		if (role.includes(',')) {
			redirect(302, '/sistemas');
		} else if (role.includes('biblioteca')) {
			redirect(302, '/biblioteca');
		} else if (role.includes('tesouraria')) {
			redirect(302, '/tesouraria');
		} else if (role.includes('secretaria')) {
			redirect(302, '/secretaria');
		} else {
			return fail(400, {
				message: 'Solicite ao administrador do sistema cadastramento no setor',
			});
		}
	},
};

export const createLoginHandlers = () => ({
	actions,
});
