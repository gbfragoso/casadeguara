import { lucia } from "$lib/server/auth";
import { db } from '$lib/database/connection';
import { User } from '$lib/database/schema';
import { eq } from "drizzle-orm";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "argon2";
import type { Actions } from "./$types";

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const email = formData.get("email");
		const password = formData.get("password");

		if (typeof email !== "string") {
			return fail(400, { invalidEmail: true });
		}

		if (typeof password !== "string" || password.length > 255) {
			return fail(400, { invalidPassword: true });
		}

		const existingUser = await db.select().from(User).where(eq(User.username, email.toLowerCase()));
		if (!existingUser) {
			return fail(400, { failedLogin: true });
		}

		const validPassword = await verify(existingUser[0].password_hash, password);
		if (!validPassword) {
			return fail(400, { failedLogin: true });
		}

		const session = await lucia.createSession(existingUser[0].id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});

		if (existingUser[0].roles.includes('biblioteca')) {
			redirect(302, "/biblioteca");
		}
		if (existingUser[0].roles.includes('financeiro')) {
			redirect(302, "/financeiro");
		}
		if (existingUser[0].roles.includes('gestao')) {
			redirect(302, "/gestao");
		}
		redirect(302, "/");
	}
} satisfies Actions;