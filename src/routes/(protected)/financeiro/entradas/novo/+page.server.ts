import { db } from '$lib/database/connection';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const contribuintes = async () => {
			return db.select({ nome: leitor.nome }).from(leitor);
		};

		return { contribuintes: contribuintes() };
	} catch (err) {
		console.error(err);
		throw error(500, {
			message: 'Falha ao carregar a lista de contribuintes',
		});
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
		const descricao = form.get('descricao') as string;
		const valor = form.get('valor') as string;
		const data_entrada = form.get('data_entrada') as string;

		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte é obrigatório',
			};
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte não pode conter somente números',
			};
		}

		if (validator.isEmpty(descricao, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do recebimento é obrigatória',
			};
		}

		if (validator.isNumeric(descricao)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do recebimento não pode conter somente números',
			};
		}

		try {
			const contribuinte = await db
				.select({ idleitor: leitor.idleitor })
				.from(leitor)
				.where(eq(leitor.nome, nome.toUpperCase()));

			if (!contribuinte) {
				return {
					status: 400,
					field: 'nome',
					message: 'Contribuinte não encontrado',
				};
			}

			await db.insert(entradas).values({
				idcontribuinte: Number(contribuinte[0].idleitor),
				descricao: descricao,
				uuid: uuidv7(),
				valor: valor,
				dataEntrada: new Date(data_entrada),
			});
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao cadastrar uma nova doação',
			});
		}
	},
} satisfies Actions;
