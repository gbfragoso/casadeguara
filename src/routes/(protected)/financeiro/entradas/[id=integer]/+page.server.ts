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

		return { entrada: JSON.parse(JSON.stringify(entrada[0])) };
	} catch (err) {
		throw fail(500, { message: 'Falha ao recuperar os dados da entrada' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await request.formData();
		const descricao = form.get('descricao') as string;
		const valor = form.get('valor') as string;
		const data_entrada = form.get('data_entrada') as string;

		if (!descricao || descricao.length === 0 || /^\s*$/.test(descricao)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do recebimento é obrigatória'
			}
		}

		if (/^\d+$/.test(descricao)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do recebimento não pode ser somente números'
			}
		}

		try {
			await db.update(entradas)
				.set({ descricao, valor, data_entrada: new Date(data_entrada) })
				.where(eq(entradas.identrada, Number(params.id)));

			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da entrada' });
		}
	}
};
