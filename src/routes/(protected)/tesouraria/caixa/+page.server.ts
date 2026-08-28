import { db } from '$lib/server/database/connection';
import { cadastros, entradas } from '$lib/server/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	if (!locals.user.roles.includes('tesouraria:admin')) redirect(302, '/tesouraria');

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
					contribuinte: cadastros.nome,
					idcontribuinte: cadastros.idleitor,
					trabalhador: cadastros.trab,
				})
				.from(entradas)
				.innerJoin(cadastros, eq(cadastros.idleitor, entradas.idcontribuinte))
				.where(and(eq(entradas.depositado, false), isNull(entradas.motivoEstorno)))
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
