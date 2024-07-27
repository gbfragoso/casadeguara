import { exemplar } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const resultado = await db.select().from(exemplar).where(eq(exemplar.idexemplar, Number(params.id)));
		if (!resultado) {
			throw error(404, 'Exemplar não encontrado');
		}
		return { resultado };
	} catch (err) {
		throw error(500, 'Falha ao buscar os dados do exemplar');
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { status } = Object.fromEntries(await request.formData()) as {
			status: string;
		};

		try {
			await db.update(exemplar).set({ status: status }).where(
				eq(exemplar.idexemplar, Number(params.id))
			);
			return { status: 200 }
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do exemplar' });
		}
	}
};
