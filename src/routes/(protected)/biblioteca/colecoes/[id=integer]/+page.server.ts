import { serie } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/login");

	try {
		const colecao = await db.select().from(serie).where(eq(serie.idserie, Number(params.id)));
		if (!colecao) {
			throw fail(404, { message: 'Coleção não encontrada' });
		}
		return { colecao };
	} catch (err) {
		return error(500, { message: 'Falha ao recuperar os dados da coleção' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.update(serie).set({ nome: nome.toUpperCase() }).where(eq(serie.idserie, Number(params.id)));
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da coleção' });
		}

		return {
			status: 200
		};
	}
};
