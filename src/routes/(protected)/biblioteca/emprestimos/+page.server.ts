import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { emprestimo, exemplar, leitor, livro } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, count, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('leitor') || undefined;
	const titulo = url.searchParams.get('titulo') || undefined;
	const tombo = url.searchParams.get('tombo') || undefined;
	const atrasados = url.searchParams.get('atrasados') || undefined;
	const ativos = url.searchParams.get('ativos') || undefined;

	const nomeFilter = nome ? ulike(leitor.nome, nome + '%') : undefined;
	const tituloFilter = titulo ? ulike(livro.titulo, titulo + '%') : undefined;
	const atrasadosFilter = atrasados
		? and(lte(emprestimo.dataDevolucao, new Date()), isNull(emprestimo.dataDevolvido))
		: undefined;
	const tomboFilter = tombo ? eq(livro.tombo, tombo) : undefined;
	const ativosFilter = ativos
		? and(gte(emprestimo.dataDevolucao, new Date()), isNull(emprestimo.dataDevolvido))
		: undefined;

	const where = and(nomeFilter, tituloFilter, tomboFilter, atrasadosFilter, ativosFilter);

	try {
		const emprestimos = await db
			.select({
				idemp: emprestimo.idemp,
				idleitor: leitor.idleitor,
				leitor: leitor.nome,
				titulo: livro.titulo,
				numero: exemplar.numero,
				renovacoes: emprestimo.renovacoes,
				data_devolucao: emprestimo.dataDevolucao,
				data_emprestimo: emprestimo.dataEmprestimo,
				data_devolvido: emprestimo.dataDevolvido,
			})
			.from(emprestimo)
			.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(where)
			.offset((page - 1) * 10)
			.orderBy(desc(emprestimo.dataEmprestimo))
			.limit(10);

		const counter = await db
			.select({ count: count() })
			.from(emprestimo)
			.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(where);

		const total = counter[0].count;

		return { emprestimos, total, isAdmin: locals.user.roles.includes(':admin') };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de empréstimos',
		});
	}
};

export const actions: Actions = {
	renovar: async ({ locals, url }) => {
		const id = url.searchParams.get('id');
		const where = eq(emprestimo.idemp, Number(id));
		const resultado = await db.select({ renovacoes: emprestimo.renovacoes }).from(emprestimo).where(where);
		const renovacoes = Number(resultado[0].renovacoes);
		if (renovacoes > 1 && !locals.user?.roles.includes(':admin')) {
			return {
				status: 400,
				message: 'Limite de renovações excedido',
			};
		}

		const duracao = Number(14 + (renovacoes + 1) * 14);

		try {
			await db.execute(
				sql`update emprestimo set data_devolucao = data_emprestimo + ${duracao}::int, renovacoes = renovacoes + 1 where idemp = ${id}`,
			);
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao renovar o empréstimo',
			});
		}
	},
	devolver: async ({ url }) => {
		const id = url.searchParams.get('id');

		try {
			await db
				.update(emprestimo)
				.set({ dataDevolvido: new Date() })
				.where(eq(emprestimo.idemp, Number(id)));
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao devolver o empréstimo',
			});
		}
	},
} satisfies Actions;
