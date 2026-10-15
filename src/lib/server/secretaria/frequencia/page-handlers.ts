import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { unaccent } from '#lib/server/database/functions.js';
import { cadastros } from '#lib/server/database/schema.js';
import { requireSecretariaAccess } from '#lib/server/secretaria/access.js';
import { error } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';

const load = async ({ locals }: RequestEvent) => {
	requireSecretariaAccess(locals.user);
};

const actions: Actions = {
	default: async ({ request, locals }) => {
		requireSecretariaAccess(locals.user);

		const form = await request.formData();

		let dataInicial = dayjs(form.get('dataInicio') as string);
		const dataFinal = dayjs(form.get('dataFim') as string);
		const dias = form.getAll('dias') as string[];
		const datas = [];

		for (let i = 0; dataInicial <= dataFinal; i++) {
			if (dias.includes(String(dataInicial.day()))) {
				datas.push(dataInicial.format('DD'));
			}
			dataInicial = dataInicial.add(1, 'day');
		}

		try {
			const leitores = await db
				.select({ nome: cadastros.nome, desencarnado: cadastros.desencarnado })
				.from(cadastros)
				.where(and(eq(cadastros.trab, true), eq(cadastros.frequencia, true)))
				.orderBy(unaccent(cadastros.nome));

			return { leitores, datas };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao carregar a lista de leitores');
		}
	},
};

export const createSecretariaFrequenciaHandlers = () => ({
	load,
	actions,
});
