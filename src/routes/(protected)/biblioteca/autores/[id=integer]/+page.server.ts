import { autor } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");
	
	try {
		const resultado = await db.select().from(autor).where(eq(autor.idautor, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Autor não encontrado' });
		}
		return { autor: resultado[0] };
	} catch (err) {
		return error(500, { message: 'Falha ao baixar os dados do autor' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;

		if (!nome || nome.length === 0 || /^\s*$/.test(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do nome é obrigatório'
			}
		}

		if (/^\d+$/.test(nome)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Nome do autor não pode ser somente números'
			}
		}

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
