import { entradas } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const entrada = await db.select().from(entradas).where(eq(entradas.identrada, Number(params.id)));
		if (!entrada) {
			throw fail(404, { message: 'Entrada não encontrada' });
		}
		return { entrada: JSON.parse(JSON.stringify(entrada)) };
	} catch (err) {
		throw fail(500, { message: 'Falha ao recuperar os dados da entrada' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { valor, data_entrada } = Object.fromEntries(await request.formData()) as {
			valor: string;
			data_entrada: string;
		};

		try {
			await db.update(entradas)
				.set({ valor: valor, data_entrada: new Date(data_entrada) })
				.where(eq(entradas.identrada, Number(params.id)));

			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da entrada' });
		}
	}
};
