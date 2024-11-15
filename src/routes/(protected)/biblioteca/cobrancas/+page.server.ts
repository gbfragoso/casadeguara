import { db } from '$lib/database/connection';
import { emprestimo, exemplar, leitor, livro } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const emprestimos = async () => {
			return db
				.select({
					idemp: emprestimo.idemp,
					idleitor: leitor.idleitor,
					leitor: leitor.nome,
					celular: leitor.celular,
					telefone: leitor.telefone,
					email: leitor.email,
					cobranca: emprestimo.cobranca,
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
				.where(and(lt(emprestimo.dataDevolucao, new Date()), isNull(emprestimo.dataDevolvido)))
				.orderBy(desc(emprestimo.dataEmprestimo));
		};

		return { emprestimos: emprestimos() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de empréstimos',
		});
	}
};
