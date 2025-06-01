import { db } from '$lib/database/connection';
import { entradas, leitor, user } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');
	if (!locals.user.roles.includes('financeiro:admin')) redirect(302, '/financeiro');

	try {
		const entrada = await db
			.select({
				contribuinte: leitor.nome,
				descricao: entradas.descricao,
				valor: entradas.valor,
				dataEntrada: entradas.dataEntrada,
				dataRegistro: entradas.dataRegistro,
				usuarioCadastro: user.name,
			})
			.from(entradas)
			.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
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
		const motivoEstorno = form.get('motivo') as string;

		try {
			await db
				.update(entradas)
				.set({ motivoEstorno, userEstorno: locals.user.id, dataEstorno: sql<Date>`now()` })
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
