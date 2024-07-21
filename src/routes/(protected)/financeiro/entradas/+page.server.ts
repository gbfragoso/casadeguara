import { leitor, entradas } from "$lib/database/schema";
import { eq, and, lte, gte, desc, ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/login");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('contribuinte')?.toUpperCase() || undefined;
	const dataInicioString = url.searchParams.get('dataInicio') || undefined;
	const dataFimString = url.searchParams.get('dataFim') || undefined;

	let dataInicio;
	if (dataInicioString) {
		dataInicio = new Date(dataInicioString);
	}
	let dataFim;
	if (dataFimString) {
		dataFim = new Date(dataFimString);
	}

	const where = {
		data_entrada: {
			lte: dataFim,
			gte: dataInicio
		},
		contribuinte: {
			nome: {
				startsWith: nome
			}
		}
	};

	try {
		const where = and(lte(entradas.data_entrada, dataFim), gte(entradas.data_entrada, dataInicio), ilike(leitor.nome, nome));
		const resultados = await db.select().from(entradas)
			.innerJoin(leitor, eq(entradas.idcontribuinte, leitor.idleitor))
			.offset((page - 1) * 10).limit(10)
			.where(where)
			.orderBy(desc(entradas.data_entrada));

		const total = await db.select({ count: count() }).from(entradas).where(where);

		return {
			entradas: JSON.parse(JSON.stringify(resultados)),
			total
		};
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a listagem de doações' });
	}
};
