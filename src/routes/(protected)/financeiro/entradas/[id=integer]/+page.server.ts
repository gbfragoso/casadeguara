import { db } from '$lib/database/connection';
import { entradas, user } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');
	if (!locals.user.roles.includes('financeiro:admin')) redirect(302, '/financeiro');

	try {
		const entrada = await db
			.select({
				descricao: entradas.descricao,
				valor: entradas.valor,
				dataEntrada: entradas.dataEntrada,
				dataRegistro: entradas.dataRegistro,
				usuarioCadastro: user.name,
			})
			.from(entradas)
			.innerJoin(user, eq(user.id, entradas.userCadastro))
			.where(eq(entradas.identrada, Number(params.id)));
		if (!entrada) {
			throw fail(404, { message: 'Entrada não encontrada' });
		}

		return { entrada: JSON.parse(JSON.stringify(entrada[0])) };
	} catch (err) {
		console.error(err);
		throw error(500, {
			message: 'Falha ao recuperar os dados da entrada',
		});
	}
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (!locals.user) redirect(302, '/');
		if (!locals.user.roles.includes('financeiro:admin')) redirect(302, '/financeiro');

		const form = await request.formData();
		const descricao = form.get('descricao') as string;

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
			await db
				.update(entradas)
				.set({ descricao, userAlteracao: locals.user.id })
				.where(eq(entradas.identrada, Number(params.id)));

			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao atualizar os dados da entrada',
			});
		}
	},
};
