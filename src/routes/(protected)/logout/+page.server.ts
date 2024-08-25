import { lucia } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

import type { Actions } from "./$types";

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) {
			redirect(302, "/");
		}

		await lucia.invalidateUserSessions(event.locals.user.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
		redirect(302, "/");
	}
};
