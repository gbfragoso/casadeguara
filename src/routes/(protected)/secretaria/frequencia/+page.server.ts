import { db } from '$lib/database/connection';
import { unaccent } from '$lib/database/functions';
import { leitor } from '$lib/database/schema';
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
				.select({ nome: leitor.nome, desencarnado: leitor.desencarnado })
				.from(leitor)
				.where(and(eq(leitor.trab, true), eq(leitor.frequencia, true)))
				.orderBy(unaccent(leitor.nome));

			return { leitores, datas };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de leitores',
			});
		}
	},
} satisfies Actions;
