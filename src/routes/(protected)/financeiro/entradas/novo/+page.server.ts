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
		const form = await request.formData();
		const nome = form.get('nome') as string;
		const descricao = form.get('descricao') as string;
		const valor = form.get('valor') as string;
		const data_entrada = form.get('data_entrada') as string;

		if (!nome || nome.length === 0 || /^\s*$/.test(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte é obrigatório'
			}
		}

		if (/^\d+$/.test(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte não pode ser somente números'
			}
		}

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
