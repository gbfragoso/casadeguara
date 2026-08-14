import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { cadastros, emprestimo, exemplar, livro } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	return { isAdmin: locals.user.roles.includes('biblioteca:admin') };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/');

		const form = await request.formData();
		const nome = form.get('leitor') as string;
		const titulo = form.get('titulo') as string;
		const tombo = form.get('tombo') as string;
		const atrasados = form.get('atrasados') as string;
		const ativos = form.get('ativos') as string;

		const nomeFilter = nome ? ulike(cadastros.nome, nome + '%') : undefined;
		const tituloFilter = titulo ? ulike(livro.titulo, titulo + '%') : undefined;
		const atrasadosFilter = atrasados
			? and(lte(emprestimo.dataDevolucao, new Date()), isNull(emprestimo.dataDevolvido))
			: undefined;
		const tomboFilter = tombo ? eq(livro.tombo, tombo) : undefined;
		const ativosFilter = ativos ? and(isNull(emprestimo.dataDevolvido)) : undefined;

		const where = and(nomeFilter, tituloFilter, tomboFilter, atrasadosFilter, ativosFilter);

		try {
			const emprestimos = await db
				.select({
					idemp: emprestimo.idemp,
					idleitor: cadastros.idleitor,
					exemplar: emprestimo.exemplar,
					leitor: cadastros.nome,
					telefone: cadastros.telefone,
					titulo: livro.titulo,
					numero: exemplar.numero,
					renovacoes: emprestimo.renovacoes,
					data_devolucao: emprestimo.dataDevolucao,
					data_emprestimo: emprestimo.dataEmprestimo,
					data_devolvido: emprestimo.dataDevolvido,
				})
				.from(emprestimo)
				.innerJoin(cadastros, eq(emprestimo.leitor, cadastros.idleitor))
				.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
				.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
				.where(where)
				.orderBy(desc(emprestimo.dataDevolucao), desc(emprestimo.idemp))
				.limit(50);

			return { emprestimos, status: 200, message: 'OK' };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de empréstimos',
			});
		}
	},
} satisfies Actions;
