import { editora } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/login");

	try {
		const resultado = await db.select().from(editora).where(eq(editora.ideditora, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Editora não encontrada' });
		}
		return { resultado };
	} catch (err) {
		throw error(500, 'Falha ao buscar os dados da editora');
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.update(editora).set({ nome: nome.toUpperCase()}).where(eq(editora.ideditora, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da editora' });
		}
	}
};
