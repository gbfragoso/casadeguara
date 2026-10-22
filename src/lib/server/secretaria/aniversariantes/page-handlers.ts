import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { cadastros } from '#lib/server/database/schema.js';
import { requireSecretariaAccess } from '#lib/server/secretaria/access.js';
import { error } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

const load = async ({ locals }: RequestEvent) => {
	requireSecretariaAccess(locals.user);
};

const actions: Actions = {
	default: async ({ request, locals }) => {
		requireSecretariaAccess(locals.user);

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

			return { leitores, mes };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao carregar a lista de leitores');
		}
	},
};

export const createSecretariaAniversariantesHandlers = () => ({
	load,
	actions,
});
