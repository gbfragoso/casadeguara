import { keyword } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/login");

	try {
		const resultado = await db.select().from(keyword).where(eq(keyword.idkeyword, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Palavra-chave não encontrada' });
		}
		return { resultado };
	} catch (err) {
		return error(500, { message: 'Falha ao recuperar os dados dao palavra-chave' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { chave } = Object.fromEntries(await request.formData()) as {
			chave: string;
		};

		try {
			await db.update(keyword).set({ chave: chave.toUpperCase() }).where(eq(keyword.idkeyword, Number(params.id)));
			return { status: 200 }
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da palavra-chave' });
		}
	}
};
