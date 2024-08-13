import { error, redirect } from '@sveltejs/kit';
import { emprestimo, exemplar, leitor, livro } from "$lib/database/schema";
import { and, count, eq, desc, ilike, isNull, gte } from "drizzle-orm";
import { db } from '$lib/database/connection';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('leitor') + "%" || undefined;
	const titulo = url.searchParams.get('titulo') + "%" || undefined;
	const tombo = url.searchParams.get('tombo') || undefined;
	const atrasados = url.searchParams.get('atrasados') || undefined;
	const ativos = url.searchParams.get('ativos') || undefined;
	
	const nomeFilter = nome ? ilike(leitor.nome, nome) : undefined;
	const tituloFilter = titulo ? ilike(livro.titulo, titulo) : undefined;
	const atrasadosFilter = atrasados ? and(gte(emprestimo.data_devolucao, new Date()), isNull(emprestimo.data_devolvido)) : undefined;
	const tomboFilter = tombo ? eq(livro.tombo, tombo) : undefined;
	const ativosFilter = ativos ? isNull(emprestimo.data_devolvido) : undefined;

	const where = and(nomeFilter, tituloFilter, tomboFilter, atrasadosFilter, ativosFilter);

	try {
		const emprestimos = await db.select({
			idemp: emprestimo.idemp, idleitor: leitor.idleitor, leitor: leitor.nome, titulo: livro.titulo, numero: exemplar.numero,
			renovacoes: emprestimo.renovacoes, data_devolucao: emprestimo.data_devolucao,
			data_emprestimo: emprestimo.data_emprestimo, data_devolvido: emprestimo.data_devolvido
		}).from(emprestimo)
			.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(where).offset((page - 1) * 10).orderBy(desc(emprestimo.data_emprestimo)).limit(10);

		const counter = await db.select({ count: count() }).from(emprestimo)
			.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(where);

		const total = counter[0].count;

		return { emprestimos, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de empréstimos' });
	}
};
