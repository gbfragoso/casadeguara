import { db } from '$lib/database/connection';
import { user } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select({ roles: user.roles })
			.from(user)
			.where(eq(user.id, String(locals.user.id)));

		if (!resultado) {
			throw fail(404, { message: 'Usuário não encontrado' });
		}
		console.log(resultado[0].roles);
		return { roles: resultado[0].roles.split(',') };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao baixar os dados do usuário' });
	}
};
