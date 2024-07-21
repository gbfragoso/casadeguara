import { autor } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params}) => {
	if (!locals.user) redirect(302, "/login");
	try {
		const resultado = await db.select().from(autor).where(eq(autor.idautor, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Autor não encontrado' });
		}
		return { resultado };
	} catch (err) {
		return error(500, { message: 'Falha ao baixar os dados do autor' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.update(autor).set({ nome: nome.toUpperCase() }).where(eq(autor.idautor, Number(params.id)));
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do autor' });
		}

		return {
			status: 200
		};
	}
};
