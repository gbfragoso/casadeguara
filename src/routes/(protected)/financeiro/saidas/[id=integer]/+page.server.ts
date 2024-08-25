import { db } from "$lib/database/connection";
import { saidas } from "$lib/database/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import validator from 'validator';

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const saida = await db.select().from(saidas).where(eq(saidas.idsaida, Number(params.id)));
		if (!saida) {
			throw fail(404, { message: 'Saída não encontrada' });
		}

		return { saida: JSON.parse(JSON.stringify(saida[0])) };
	} catch (err) {
		throw fail(500, { message: 'Falha ao recuperar os dados da saída' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await request.formData();
		const descricao = form.get('descricao') as string;
		const valor = form.get('valor') as string;
		const data_saida = form.get('data_saida') as string;

		if (validator.isEmpty(descricao, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do pagamento é obrigatória'
			}
		}

		if (validator.isNumeric(descricao)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do pagamento não pode conter somente números'
			}
		}

		try {
			await db.update(saidas)
				.set({ descricao, valor, data_saida: new Date(data_saida) })
				.where(eq(saidas.idsaida, Number(params.id)));

			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da saida' });
		}
	}
};