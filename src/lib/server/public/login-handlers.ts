import type { Actions } from '@sveltejs/kit';

import { resolveLoginDestination } from '#lib/navigation/system-modules.js';
import { setSessionCookie } from '#lib/server/auth/cookie.js';
import { generateSessionToken, type SessionModel } from '#lib/server/auth/session.js';
import type { UserModel } from '#lib/server/models/user.js';
import { fail, redirect } from '@sveltejs/kit';

const PASSWORD_MAX_LENGTH = 255;

type LoginDependencies = {
	users: Pick<UserModel, 'findCredentials'>;
	sessions: Pick<SessionModel, 'create'>;
	verifyPassword: (passwordHash: string, password: string) => Promise<boolean>;
};

export const createLoginHandlers = ({ users, sessions, verifyPassword }: LoginDependencies) => {
	const actions: Actions = {
		default: async ({ cookies, request }) => {
			const formData = await request.formData();
			const email = formData.get('email');
			const password = formData.get('password');

			if (typeof email !== 'string') {
				return fail(400, { invalidEmail: true });
			}

			if (typeof password !== 'string' || password.length > PASSWORD_MAX_LENGTH) {
				return fail(400, { invalidPassword: true });
			}

			const credentials = await users.findCredentials(email.toLowerCase());
			if (!credentials || !(await verifyPassword(credentials.passwordHash, password))) {
				return fail(400, { failedLogin: true });
			}

			const token = generateSessionToken();
			const session = await sessions.create(token, credentials.id);
			setSessionCookie(cookies, token, session.expiresAt);

			const destination = resolveLoginDestination(credentials.roles);
			if (!destination) {
				return fail(400, { message: 'Solicite ao administrador do sistema cadastramento no setor' });
			}
			redirect(302, destination);
		},
	};

	return { actions };
};
