import { db } from '$lib/database/connection';
import { user } from '$lib/database/schema';
import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { verify } from 'argon2';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions: Actions = {
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
		if (!existingUser) {
			return fail(400, { failedLogin: true });
		}

		const validPassword = await verify(existingUser[0].passwordHash, password);
		if (!validPassword) {
			return fail(400, { failedLogin: true });
		}

		const session = await lucia.createSession(existingUser[0].id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});

		const role = existingUser[0].roles;
		if (role.includes('biblioteca')) {
			redirect(302, '/biblioteca');
		} else if (role.includes('financeiro')) {
			redirect(302, '/financeiro');
		} else if (role.includes('secretaria')) {
			redirect(302, '/secretaria');
		} else {
			return fail(400, {
				message: 'Solicite ao administrador do sistema cadastramento no setor',
			});
		}
	},
} satisfies Actions;
