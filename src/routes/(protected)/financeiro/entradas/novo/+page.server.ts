import { leitor, entradas } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const contribuintes = await db.select({ nome: leitor.nome }).from(leitor);
		return { contribuintes };
	} catch (err) {
		throw fail(500, { message: 'Falha ao carregar a lista de contribuintes' });
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome, descricao, valor, data_entrada } = Object.fromEntries(
			await request.formData()
		) as {
			nome: string;
			descricao: string;
			valor: string;
			data_entrada: string;
		};

		try {
			const contribuinte = await db.select({ idleitor: leitor.idleitor }).from(leitor).where(eq(leitor.nome, nome.toUpperCase()));

			if (contribuinte) {
				await db.insert(entradas).values({
					idcontribuinte: Number(contribuinte[0].idleitor),
					descricao: descricao,
					valor: valor,
					data_entrada: new Date(data_entrada)
				});
			} else {
				return {
					status: 400,
					field: 'nome',
					message: 'Contribuinte não encontrado'
				}
			}
			return { status: 201 }
		} catch (err) {
			return error(500, { message: 'Falha ao cadastrar uma nova doação' });
		}

		
	}
} satisfies Actions;
