import { db } from '$lib/database/connection';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { desc, eq, inArray, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	if (!locals.user.roles.includes(':admin')) redirect(302, '/financeiro');

	try {
		const resultados = async () => {
			return db
				.select({
					identrada: entradas.identrada,
					descricao: entradas.descricao,
					dataEntrada: entradas.dataEntrada,
					valor: entradas.valor,
					depositado: entradas.depositado,
					uuid: entradas.uuid,
					contribuinte: leitor.nome,
					idcontribuinte: leitor.idleitor,
					trabalhador: leitor.trab,
				})
				.from(entradas)
				.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
				.where(isNull(entradas.depositado))
				.orderBy(desc(entradas.dataEntrada));
		};

		return { entradas: resultados() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de entradas',
		});
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const ids = form.getAll('entradas') as string[];

		try {
			await db
				.update(entradas)
				.set({ depositado: true })
				.where(inArray(entradas.identrada, ids.map(Number)));
			return { status: 201, message: 'Depósito confirmado com sucesso' };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao confirmar o depósito',
			});
		}
	},
} satisfies Actions;
