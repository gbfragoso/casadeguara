import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '$lib/server/database/connection';
import { unaccent } from '$lib/server/database/functions';
import { cadastros, frequencia } from '$lib/server/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import dayjs from 'dayjs';

const load = async ({ locals }: RequestEvent) => {
	if (!locals.user) redirect(302, '/');
};

const actions: Actions = {
	pesquisar: async ({ request }) => {
		const form = await request.formData();

		let dataInicial = dayjs(form.get('dataInicio') as string);
		const dataFinal = dayjs(form.get('dataFim') as string);
		const dias = form.getAll('dias') as string[];
		const datas = [];
		const fulldates = [];

		for (let i = 0; dataInicial <= dataFinal; i++) {
			if (dias.includes(String(dataInicial.day()))) {
				datas.push(dataInicial.format('DD'));
				fulldates.push(dataInicial.format('YYYY-MM-DD'));
			}
			dataInicial = dataInicial.add(1, 'day');
		}

		try {
			const leitores = await db
				.select({ id: cadastros.idleitor, nome: cadastros.nome })
				.from(cadastros)
				.where(and(eq(cadastros.trab, true), eq(cadastros.frequencia, true)))
				.orderBy(unaccent(cadastros.nome));

			return { leitores, fulldates, datas };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de leitores',
			});
		}
	},
	registrar: async ({ request }) => {
		const form = await request.formData();
		const array: { trabalhador: number; dataPresenca: Date }[] = [];
		form.forEach((value, key) => {
			const item = {
				trabalhador: Number(key),
				dataPresenca: new Date(value as string),
			};
			array.push(item);
		});

		try {
			await db.insert(frequencia).values(array);
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo autor',
			});
		}
	},
};

export const createSecretariaFrequenciaRegistroHandlers = () => ({
	load,
	actions,
});
