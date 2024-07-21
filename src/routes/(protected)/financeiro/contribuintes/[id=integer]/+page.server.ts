import { leitor } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/login");

	try {
		const contribuinte = await db.select().from(leitor).where(eq(leitor.idleitor, Number(params.id)));
		if (!contribuinte) {
			throw fail(404, { message: 'Contribuinte não encontrado' });
		}
		return { contribuinte }
	} catch (err) {
		throw fail(500, { message: 'Falha ao recuperar os dados do contribuinte' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formdata = await request.formData();
		const nome = String(formdata.get('nome'));
		const trabalhador = Boolean(formdata.get('trabalhador'));

		try {
			await db.update(leitor).set({ nome: nome, trab: trabalhador }).where(eq(leitor.idleitor, Number(params.id)));
			return { status: 200 }
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do contribuinte' });
		}
	}
};
