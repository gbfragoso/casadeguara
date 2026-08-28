import { db } from '$lib/server/database/connection';
import { unaccent } from '$lib/server/database/functions';
import { cadastros } from '$lib/server/database/schema';
import { error, redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
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
			return error(500, {
				message: 'Falha ao carregar a lista de leitores',
			});
		}
	},
} satisfies Actions;
