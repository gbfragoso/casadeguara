import { leitor } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/login");

	try {
		const resultado = await db.select().from(leitor).where(eq(leitor.idleitor, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Leitor não encontrado' });
		}
		return { resultado };
	} catch (err) {
		return error(500, { message: 'Falha ao recuperar os dados do leitor' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.update(leitor).set({ nome: nome.toUpperCase() }).where(eq(leitor.idleitor, Number(params.id)));
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do leitor' });
		}

		return {
			status: 200
		};
	}
};
