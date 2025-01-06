import { db } from '$lib/database/connection';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { v7 as uuidv7 } from 'uuid';
import { sql } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const contribuintes = async () => {
			return db.select({ idleitor: leitor.idleitor, nome: sql<string>`unaccent(leitor.nome)` }).from(leitor);
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
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/');

		const form = await request.formData();
		const idcontribuinte = Number(form.get('contribuinteid') as string);
		const descricao = form.get('descricao') as string;
		const valor = form.get('valor') as string;
		const data_entrada = form.get('data_entrada') as string;
		const uuid = uuidv7();

		if (!idcontribuinte || idcontribuinte === 0) {
			return {
				status: 400,
				field: 'contribuinte',
				message: 'Contribuinte não encontrado',
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

		await db.insert(entradas).values({
			idcontribuinte,
			descricao,
			uuid,
			valor: valor,
			dataEntrada: new Date(data_entrada),
			dataRegistro: new Date(),
			userCadastro: locals.user.id,
		});

		return redirect(302, '/recibo/' + uuid);
	},
} satisfies Actions;
