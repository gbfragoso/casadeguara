import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { ulike } from '#lib/server/database/functions.js';
import { cadastros, emprestimo, exemplar, livro } from '#lib/server/database/schema.js';
import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';
import { error } from '@sveltejs/kit';
import { and, desc, eq, isNull, lte } from 'drizzle-orm';

const load = async ({ locals }: RequestEvent) => {
	const user = requireLibraryAccess(locals.user);
	return { isAdmin: user.roles.includes('biblioteca:admin') };
};

const actions: Actions = {
	default: async ({ request, locals }) => {
		requireLibraryAccess(locals.user);

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
			return error(500, 'Falha ao carregar a lista de empréstimos');
		}
	},
};

export const createBibliotecaEmprestimosHandlers = () => ({
	load,
	actions,
});
