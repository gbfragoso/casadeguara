import { db } from '$lib/database/connection';
import { leitor } from "$lib/database/schema";
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from "drizzle-orm";
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const contribuinte = await db.select().from(leitor).where(eq(leitor.idleitor, Number(params.id)));
		if (!contribuinte) {
			throw fail(404, { message: 'Contribuinte não encontrado' });
		}
		return { contribuinte: contribuinte[0] }
	} catch (err) {
		throw fail(500, { message: 'Falha ao recuperar os dados do contribuinte' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formdata = await request.formData();
		const nome = formdata.get('nome') as string;
		const trabalhador = Boolean(formdata.get('trabalhador'));

		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte é obrigatório'
			}
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte não pode conter somente números'
			}
		}

		try {
			await db.update(leitor).set({ nome: nome.toUpperCase(), trab: trabalhador }).where(eq(leitor.idleitor, Number(params.id)));
			return { status: 200 }
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do contribuinte' });
		}
	}
};
