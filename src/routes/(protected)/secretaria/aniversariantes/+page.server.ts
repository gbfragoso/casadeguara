import { leitor } from "$lib/database/schema";
import { and, eq, sql } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user) redirect(302, "/");

    const mes = url.searchParams.get('mes') || undefined;

    try {
        const mesFilter = mes ? eq(sql<string>`extract(month from leitor.aniversario)`, mes) : undefined;
        const leitores = await db.select({ nome: leitor.nome, aniversario: leitor.aniversario }).from(leitor)
            .where(and(eq(leitor.trab, true), mesFilter)).orderBy(sql<number>`extract(day from leitor.aniversario)`);
        return { leitores };
    } catch (err) {
        return error(500, { message: 'Falha ao carregar a lista de leitores' });
    }
};
