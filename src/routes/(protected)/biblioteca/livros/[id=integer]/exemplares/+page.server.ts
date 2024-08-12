import { exemplar } from "$lib/database/schema";
import { eq, count } from "drizzle-orm";
import { db } from '$lib/database/connection';

import { fail, error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");
	
	const where = eq(exemplar.livro, Number(params.id));
	const exemplares = await db.select().from(exemplar).where(where).orderBy(exemplar.numero);
	
	return { exemplares };
};

export const actions: Actions = {
	adicionar: async ({ request, params }) => {
		const form = await request.formData();
		const id = Number(params.id);
		const numero = Number(form.get('numero'));

		try {
			await db.insert(exemplar).values( { livro: id, numero, status: 'Disponível', data_cadastro: new Date() });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar um novo autor' });
		}
	},
	excluir: async ({ url }) => {
		const id = url.searchParams.get('exemplar');
		if (!id) {
			return fail(400, { message: 'Nenhum exemplar foi selecionada para exclusão' });
		}

		try {
			await db.delete(exemplar).where(eq(exemplar.idexemplar, Number(id)));
			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao excluir o exemplar' });
		}
	}
};
