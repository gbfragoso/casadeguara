import { db } from '$lib/database/connection';
import { keyword } from "$lib/database/schema";
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from "drizzle-orm";
import validator from "validator";

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const resultado = await db.select().from(keyword).where(eq(keyword.idkeyword, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Palavra-chave não encontrada' });
		}
		return { keyword: resultado[0] };
	} catch (err) {
		return error(500, { message: 'Falha ao recuperar os dados dao palavra-chave' });
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const chave = form.get('chave') as string;

		if (validator.isEmpty(chave, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'chave',
				message: 'Descrição da palavra-chave é obrigatório'
			}
		}

		if (validator.isNumeric(chave)) {
			return {
				status: 400,
				field: 'chave',
				message: 'Palavra-chave não pode conter somente números'
			}
		}

		try {
			await db.update(keyword).set({ chave: chave.toUpperCase() }).where(eq(keyword.idkeyword, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da palavra-chave' });
		}
	}
};