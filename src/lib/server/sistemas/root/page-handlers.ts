import type { RequestEvent } from '@sveltejs/kit';

import { db } from '$lib/server/database/connection';
import { user } from '$lib/server/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const load = async ({ locals }: RequestEvent) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select({ roles: user.roles })
			.from(user)
			.where(eq(user.id, String(locals.user.id)));

		if (!resultado) {
			throw fail(404, { message: 'Usuário não encontrado' });
		}
		return { roles: resultado[0].roles.split(',') };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao baixar os dados do usuário' });
	}
};

export const createSistemasHandlers = () => ({
	load,
});
