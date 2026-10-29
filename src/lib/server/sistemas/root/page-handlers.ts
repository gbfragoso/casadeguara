import type { RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const findStoredRoles = async (id: string) => {
	try {
		const [registro] = await db.select({ roles: user.roles }).from(user).where(eq(user.id, id));
		return registro;
	} catch (err) {
		console.error(err);
		error(500, 'Falha ao baixar os dados do usuário');
	}
};

const load = async ({ locals }: RequestEvent) => {
	const sessionUser = requireAuthenticatedUser(locals.user);

	const registro = await findStoredRoles(sessionUser.id);
	if (!registro) error(404, 'Usuário não encontrado');

	return { roles: registro.roles.split(',') };
};

export const createSistemasHandlers = () => ({
	load,
});
