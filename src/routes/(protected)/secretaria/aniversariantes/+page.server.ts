import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const mes = form.get('mes') as string;

		try {
			const mesFilter = mes ? eq(sql<string>`extract(month from leitor.aniversario)`, mes) : undefined;

			const leitores = await db
				.select({ nome: leitor.nome, aniversario: leitor.aniversario, desencarnado: leitor.desencarnado })
				.from(leitor)
				.where(and(eq(leitor.trab, true), mesFilter))
				.orderBy(sql<number>`extract(day from leitor.aniversario)`, leitor.nome);

			return { leitores };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de leitores',
			});
		}
	},
} satisfies Actions;
