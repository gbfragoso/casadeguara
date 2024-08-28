import { db } from '$lib/database/connection';
import { unaccent } from '$lib/database/functions';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	let dataInicial = dayjs(url.searchParams.get('dataInicio'));
	const dataFinal = dayjs(url.searchParams.get('dataFim'));
	const dias = url.searchParams.getAll('dias');
	const datas = [];

	for (let i = 0; dataInicial <= dataFinal; i++) {
		if (dias.includes(String(dataInicial.day()))) {
			datas.push(dataInicial.format('DD'));
		}
		dataInicial = dataInicial.add(1, 'day');
	}

	try {
		if (datas.length > 0) {
			const leitores = await db
				.select({ nome: leitor.nome })
				.from(leitor)
				.where(eq(leitor.trab, true))
				.orderBy(unaccent(leitor.nome));
			return { leitores, datas };
		}
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de leitores',
		});
	}
};
