import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

const load = async ({ locals }: RequestEvent) => {
	if (!locals.user) redirect(302, '/');
};

const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const mes = form.get('mes') as string;

		try {
			const mesFilter = mes ? eq(sql<string>`extract(month from cadastros.aniversario)`, mes) : undefined;

			const leitores = await db
				.select({
					nome: cadastros.nome,
					aniversario: cadastros.aniversario,
					desencarnado: cadastros.desencarnado,
				})
				.from(cadastros)
				.where(and(eq(cadastros.trab, true), mesFilter))
				.orderBy(sql<number>`extract(day from cadastros.aniversario)`, cadastros.nome);

			return { leitores };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de leitores',
			});
		}
	},
};

export const createSecretariaAniversariantesHandlers = () => ({
	load,
	actions,
});
