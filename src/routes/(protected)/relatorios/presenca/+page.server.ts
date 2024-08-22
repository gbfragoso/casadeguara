import { leitor } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';
import dayjs from "dayjs";

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

    let dataInicial = dayjs('2024-08-01');
    let dataFinal = dayjs('2024-08-07');
    let datas = [];
    let dias = [1, 2, 4];

    for (var i = 0; dataInicial <= dataFinal; i++) {
        if (dias.includes(dataInicial.day())) {
            datas.push(dataInicial.format('DD'));
        }
        dataInicial = dataInicial.add(1, 'day');
    }

	try {
		const leitores = await db.select().from(leitor).where(eq(leitor.trab, true)).orderBy(leitor.nome);
		return { leitores, datas };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de leitores' });
	}
};
