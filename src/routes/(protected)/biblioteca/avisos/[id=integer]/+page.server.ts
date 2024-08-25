import { db } from '$lib/database/connection';
import { aviso } from "$lib/database/schema";
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from "drizzle-orm";
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");
	
	try {
		const resultado = await db.select().from(aviso).where(eq(aviso.idaviso, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Aviso não encontrado' });
		}
		return { aviso: resultado[0] };
	} catch (err) {
		return error(500, { message: 'Falha ao baixar os dados do aviso' });
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const texto = form.get('texto') as string;

		if (validator.isEmpty(texto, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'texto',
				message: 'Texto do aviso é obrigatório'
			}
		}

		try {
			await db.update(aviso).set({ texto }).where(eq(aviso.idaviso, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar o texto do aviso' });
		}
	}
};
